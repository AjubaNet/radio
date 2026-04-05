import { useState, useEffect, useCallback, useRef } from 'react';
import type { ModulationType, RadioSignals, RadioMetrics } from '../types/radio';
import { RadioEngine, SignalGenerator } from '../dsp/core';
import { MODULATION_DEFAULTS, NURSERY_RHYMES } from '../constants/modulationData';
import { SimpleFFT } from '../dsp/generators';

function erfc(x: number): number {
  const t = 1 / (1 + 0.3275911 * x);
  return t * Math.exp(-x * x) * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
}
function qFunc(x: number): number { return 0.5 * erfc(x / Math.sqrt(2)); }

function computeEVM(pts: {I:number,Q:number}[]): number {
  const ideal = [-3,-1,1,3].flatMap(i => [-3,-1,1,3].map(q => ({I:i/Math.sqrt(10),Q:q/Math.sqrt(10)})));
  let sumSq = 0;
  for (const p of pts) {
    let minDist = Infinity;
    for (const ref of ideal) {
      const d = (p.I-ref.I)**2 + (p.Q-ref.Q)**2;
      if (d < minDist) minDist = d;
    }
    sumSq += minDist;
  }
  return pts.length > 0 ? Math.sqrt(sumSq / pts.length) / (3/Math.sqrt(10)) * 100 : 0;
}

function computeCorrelation(a: Float32Array, b: Float32Array): number {
  const len = Math.min(a.length, b.length);
  let sumAB = 0, sumA2 = 0, sumB2 = 0;
  for (let i = 0; i < len; i++) { sumAB += a[i]*b[i]; sumA2 += a[i]*a[i]; sumB2 += b[i]*b[i]; }
  const denom = Math.sqrt(sumA2 * sumB2);
  return denom > 0 ? Math.abs(sumAB / denom) : 0;
}

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const useRadio = () => {
    const [modulation, setModulation] = useState<ModulationType>('am');
    const [messageType, setMessageType] = useState<string>('sine');
    const [carrierFreq, setCarrierFreq] = useState(1000);
    const [msgFreq, setMsgFreq] = useState(100);
    const [modIndex, setModIndex] = useState(0.5);
    const [snr, setSnr] = useState(30);
    const [sampleRate, setSampleRate] = useState(44100);
    const [deterministicBits, setDeterministicBits] = useState(false);
    
    const [signals, setSignals] = useState<RadioSignals>({
        carrier: new Float32Array(0),
        message: new Float32Array(0),
        modulated: new Float32Array(0),
        demodulated: new Float32Array(0),
        demodIdeal: new Float32Array(0),
        noise: new Float32Array(0),
        spectrum: new Float32Array(0)
    });

    const [constellation, setConstellation] = useState<{I: number, Q: number}[]>([]);

    const [metrics, setMetrics] = useState<RadioMetrics>({
        snr: 0,
        setSnr: 30,
        peakPower: 0,
        bandwidth: 0,
        ber: 0,
        spectralEfficiency: 0,
        evm: 0,
        correlation: 0
    });

    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const generateSignals = useCallback(() => {
        const sigGen = new SignalGenerator(sampleRate);
        const engine = new RadioEngine(sampleRate);
        
        const isDigital = ['ask', 'fsk', 'psk', 'qam', 'dsss', 'fhss'].includes(modulation);
        const duration = 0.1;
        
        let message: Float32Array;
        let bitStream: Uint8Array | undefined;

        if (isDigital) {
            const numBits = 16;
            bitStream = new Uint8Array(numBits);
            const rng = deterministicBits ? mulberry32(42) : Math.random.bind(Math);
            for (let i = 0; i < numBits; i++) bitStream[i] = rng() > 0.5 ? 1 : 0;
            message = sigGen.generateMessage(msgFreq, messageType === 'digital' ? 'sine' : messageType, 0.5, duration, bitStream);
        } else {
            message = sigGen.generateMessage(msgFreq, messageType, 0.5, duration);
        }

        const carrier = sigGen.generateCarrier(carrierFreq, 1, duration);
        const modulated = engine.modulate(modulation, carrier, message, modIndex, carrierFreq, bitStream, msgFreq);
        const noise = sigGen.addNoise(modulated, snr);
        
        const idealResult = engine.demodulate(modulation, modulated, carrierFreq);
        const noisyResult = engine.demodulate(modulation, noise, carrierFreq);

        // BER
        const snrLinear = Math.pow(10, snr / 10);
        const berMap: Record<string, () => number> = {
          ask: () => qFunc(Math.sqrt(snrLinear)),
          fsk: () => 0.5 * Math.exp(-snrLinear / 2),
          psk: () => qFunc(Math.sqrt(2 * snrLinear)),
          qam: () => (3/8) * erfc(Math.sqrt(2 * snrLinear / 5)),
          dsss: () => qFunc(Math.sqrt(2 * snrLinear * 7)),
          fhss: () => qFunc(Math.sqrt(2 * snrLinear)),
        };
        const ber = berMap[modulation] ? berMap[modulation]() : NaN;

        // Peak Power (dBm)
        let maxAmp = 0;
        for (let i = 0; i < modulated.length; i++) maxAmp = Math.max(maxAmp, Math.abs(modulated[i]));
        const peakPower = 10 * Math.log10(maxAmp * maxAmp / 0.001);

        // Spectral Efficiency
        const effMap: Record<string, number> = {
          am: 0.5, fm: 0.3, pm: 0.3,
          ask: 1, fsk: 0.5, psk: 1, qam: 4,
          pam: 0, pwm: 0, ppm: 0, pcm: 0,
          dsss: 0.14, fhss: 0.25
        };
        const spectralEfficiency = effMap[modulation] ?? 0;

        // EVM
        const evm = modulation === 'qam' && noisyResult.constellation ? computeEVM(noisyResult.constellation) : 0;

        // Bandwidth (improved)
        const bwMap: Record<string, () => number> = {
          am: () => msgFreq * 2,
          fm: () => 2 * msgFreq * (modIndex + 1),
          pm: () => 2 * msgFreq * (modIndex + 1),
          ask: () => 2 * (16 * msgFreq),
          fsk: () => 2 * (500 + 16 * msgFreq),
          psk: () => 2 * (16 * msgFreq),
          qam: () => 4 * (16 * msgFreq / 4),
          pam: () => msgFreq * 4,
          pwm: () => msgFreq * 4,
          ppm: () => msgFreq * 4,
          pcm: () => 4 * (1000 / 0.5),
          dsss: () => 7 * 16 * msgFreq * 2,
          fhss: () => 1200 * 2,
        };
        const bandwidth = (bwMap[modulation] ?? (() => msgFreq * 2))();

        // Correlation
        const correlation = computeCorrelation(message, noisyResult.waveform);

        // Spectrum (FFT)
        const fftSize = 2048;
        const fft = new SimpleFFT(fftSize);
        const fftResult = fft.forward(modulated);
        const spectrum = new Float32Array(fftSize / 2);
        for (let i = 0; i < fftSize / 2; i++) {
          const re = fftResult[i * 2];
          const im = fftResult[i * 2 + 1];
          spectrum[i] = Math.sqrt(re*re + im*im) / fftSize;
        }

        setSignals({ 
            carrier, message, modulated, 
            demodulated: noisyResult.waveform, 
            demodIdeal: idealResult.waveform, 
            noise,
            spectrum
        });
        
        if (noisyResult.constellation) {
            setConstellation(noisyResult.constellation);
        } else {
            setConstellation([]);
        }
        
        setMetrics({
            snr,
            setSnr: snr,
            peakPower,
            bandwidth,
            ber,
            spectralEfficiency,
            evm,
            correlation
        });

    }, [modulation, messageType, carrierFreq, msgFreq, modIndex, snr, sampleRate, deterministicBits]);

    useEffect(() => {
        generateSignals();
    }, [generateSignals]);

    const playLongTrack = async () => {
        const sigGen = new SignalGenerator(sampleRate);
        const engine = new RadioEngine(sampleRate);
        const rhyme = NURSERY_RHYMES.twinkle;
        const noteDuration = rhyme.duration / rhyme.frequencies.length;
        let fullMelody = new Float32Array(0);
        for (const freq of rhyme.frequencies) {
            const note = sigGen.generateMessage(freq, 'sine', 0.5, noteDuration);
            const combined = new Float32Array(fullMelody.length + note.length);
            combined.set(fullMelody);
            combined.set(note, fullMelody.length);
            fullMelody = combined;
        }
        const carrier = sigGen.generateCarrier(carrierFreq, 1, rhyme.duration);
        const modulated = engine.modulate(modulation, carrier, fullMelody, modIndex, carrierFreq, undefined, msgFreq);
        const noise = sigGen.addNoise(modulated, snr);
        const result = engine.demodulate(modulation, noise, carrierFreq);
        await playSignalData(result.waveform);
    };

    const playSignalData = async (signal: Float32Array) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
        const buffer = audioCtxRef.current.createBuffer(1, signal.length, audioCtxRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        let max = 0;
        for (let i = 0; i < signal.length; i++) max = Math.max(max, Math.abs(signal[i]));
        for (let i = 0; i < signal.length; i++) data[i] = max > 0 ? (signal[i] / (max * 1.1)) : 0;
        if (sourceRef.current) try { sourceRef.current.stop(); } catch(e) {}
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.start();
        sourceRef.current = source;
    };

    const playSignal = async (type: keyof RadioSignals) => {
        if (type === 'spectrum') return;
        const sig = signals[type];
        if (sig instanceof Float32Array) {
            await playSignalData(sig);
        }
    };

    const handleModulationChange = (newMod: ModulationType) => {
        setModulation(newMod);
        const d = MODULATION_DEFAULTS[newMod];
        if (d) {
            setCarrierFreq(d.carrierFreq);
            setMsgFreq(d.msgFreq);
            setModIndex(d.modIndex);
            setSnr(d.snrDb);
            setSampleRate(d.sampleRate * 1000);
        }
    };

    const exportWAV = (signalKey: keyof RadioSignals) => {
        if (signalKey === 'spectrum') return;
        const signal = signals[signalKey];
        if (!(signal instanceof Float32Array) || signal.length === 0) return;
        const numSamples = signal.length;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);
        const writeStr = (offset: number, str: string) => { for (let i=0;i<str.length;i++) view.setUint8(offset+i, str.charCodeAt(i)); };
        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeStr(36, 'data');
        view.setUint32(40, numSamples * 2, true);
        let max = 0;
        for (let i = 0; i < numSamples; i++) max = Math.max(max, Math.abs(signal[i]));
        for (let i = 0; i < numSamples; i++) {
            const s = max > 0 ? Math.round((signal[i] / max) * 32767) : 0;
            view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, s)), true);
        }
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `radio_${signalKey}.wav`; a.click();
        URL.revokeObjectURL(url);
    };

    const copyParams = () => {
        const params = JSON.stringify({ modulation, carrierFreq, msgFreq, modIndex, snrDb: snr, messageType }, null, 2);
        navigator.clipboard.writeText(params).catch(() => {});
    };

    return {
        modulation, messageType, carrierFreq, msgFreq, modIndex, snr, sampleRate,
        signals, metrics, constellation,
        deterministicBits, setDeterministicBits,
        setCarrierFreq, setMsgFreq, setModIndex, setSnr, setMessageType,
        handleModulationChange, playSignal, playLongTrack, generateSignals,
        exportWAV, copyParams
    };
};
