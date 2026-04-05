import { useState, useEffect, useCallback, useRef } from 'react';
import type { ModulationType, RadioSignals, RadioMetrics } from '../types/radio';
import { RadioEngine, SignalGenerator } from '../dsp/core';
import { MODULATION_DEFAULTS, NURSERY_RHYMES } from '../constants/modulationData';

export const useRadio = () => {
    const [modulation, setModulation] = useState<ModulationType>('am');
    const [messageType, setMessageType] = useState<string>('sine');
    const [carrierFreq, setCarrierFreq] = useState(1000);
    const [msgFreq, setMsgFreq] = useState(100);
    const [modIndex, setModIndex] = useState(0.5);
    const [snr, setSnr] = useState(30);
    const [sampleRate, setSampleRate] = useState(44100);
    
    const [signals, setSignals] = useState<RadioSignals>({
        carrier: new Float32Array(0),
        message: new Float32Array(0),
        modulated: new Float32Array(0),
        demodulated: new Float32Array(0),
        demodIdeal: new Float32Array(0),
        noise: new Float32Array(0)
    });

    const [constellation, setConstellation] = useState<{I: number, Q: number}[]>([]);

    const [metrics, setMetrics] = useState<RadioMetrics>({
        snr: 0,
        setSnr: 30,
        peakPower: 0,
        bandwidth: 0,
        ber: 0,
        spectralEfficiency: 0,
        evm: 0
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
            const numBits = modulation === 'qam' ? 16 : 16;
            bitStream = new Uint8Array(numBits);
            for (let i = 0; i < numBits; i++) bitStream[i] = Math.random() > 0.5 ? 1 : 0;
            message = sigGen.generateMessage(msgFreq, messageType === 'digital' ? 'sine' : messageType, 0.5, duration, bitStream);
        } else {
            message = sigGen.generateMessage(msgFreq, messageType, 0.5, duration);
        }

        const carrier = sigGen.generateCarrier(carrierFreq, 1, duration);
        const modulated = engine.modulate(modulation, carrier, message, modIndex, carrierFreq, bitStream);
        const noise = sigGen.addNoise(modulated, snr);
        
        const idealResult = engine.demodulate(modulation, modulated, carrierFreq);
        const noisyResult = engine.demodulate(modulation, noise, carrierFreq);

        setSignals({ 
            carrier, message, modulated, 
            demodulated: noisyResult.waveform, 
            demodIdeal: idealResult.waveform, 
            noise 
        });
        
        if (noisyResult.constellation) {
            setConstellation(noisyResult.constellation);
        } else {
            setConstellation([]);
        }
        
        setMetrics(prev => ({
            ...prev,
            snr: snr,
            setSnr: snr,
            peakPower: 0,
            bandwidth: modulation === 'am' ? msgFreq * 2 : msgFreq * (1 + modIndex) * 2
        }));

    }, [modulation, messageType, carrierFreq, msgFreq, modIndex, snr, sampleRate]);

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
        const modulated = engine.modulate(modulation, carrier, fullMelody, modIndex, carrierFreq);
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
        await playSignalData(signals[type]);
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

    return {
        modulation, messageType, carrierFreq, msgFreq, modIndex, snr, sampleRate,
        signals, metrics, constellation,
        setCarrierFreq, setMsgFreq, setModIndex, setSnr, setMessageType,
        handleModulationChange, playSignal, playLongTrack, generateSignals
    };
};
