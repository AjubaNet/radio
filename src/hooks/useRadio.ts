import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    SignalGenerator, 
    AnalogModulator, 
    DigitalModulator, 
    PulseModulator, 
    SpreadSpectrumModulator, 
    SignalAnalyzer,
    SimpleFFT
} from '../dsp/core';
import { CONFIG, MODULATION_DEFAULTS } from '../constants/modulation';

export const useRadio = () => {
    const [modulation, setModulation] = useState('am');
    const [carrierFreq, setCarrierFreq] = useState(MODULATION_DEFAULTS.am.carrierFreq);
    const [msgFreq, setMsgFreq] = useState(MODULATION_DEFAULTS.am.msgFreq);
    const [modIndex, setModIndex] = useState(MODULATION_DEFAULTS.am.modIndex);
    const [snr, setSnr] = useState(MODULATION_DEFAULTS.am.snrDb);
    const [sampleRate, setSampleRate] = useState(MODULATION_DEFAULTS.am.sampleRate * 1000);
    
    const [signals, setSignals] = useState({
        carrier: new Float32Array(0),
        message: new Float32Array(0),
        modulated: new Float32Array(0),
        demodulated: new Float32Array(0),
        demodIdeal: new Float32Array(0),
        noise: new Float32Array(0)
    });

    const [metrics, setMetrics] = useState({
        snr: 0,
        ber: 0,
        bandwidth: 0,
        peakPower: 0,
        efficiency: 0,
        evm: 0
    });

    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const generateSignals = useCallback(() => {
        const sigGen = new SignalGenerator(sampleRate);
        const analogMod = new AnalogModulator(sampleRate);
        const digitalMod = new DigitalModulator(sampleRate);
        const pulseMod = new PulseModulator(sampleRate);
        const spreadMod = new SpreadSpectrumModulator(sampleRate);
        const analyzer = new SignalAnalyzer(sampleRate);
        const fft = new SimpleFFT(2048);

        const duration = 0.1; // 100ms
        const carrier = sigGen.generateCarrier(carrierFreq, 1, duration);
        let message = new Float32Array(0);
        let modulated = new Float32Array(0);
        let demodIdeal = new Float32Array(0);
        let bitStream: Uint8Array | null = null;

        const isDigital = ['ask', 'fsk', 'psk', 'qam'].includes(modulation);
        const isPulse = ['pam', 'pwm', 'ppm', 'pcm'].includes(modulation);
        const isSpread = ['dsss', 'fhss'].includes(modulation);

        if (isDigital || isSpread) {
            bitStream = new Uint8Array(16);
            for (let i = 0; i < 16; i++) bitStream[i] = Math.random() > 0.5 ? 1 : 0;
            message = sigGen.generateMessage(msgFreq, 'sine', 1, duration, bitStream);
        } else {
            message = sigGen.generateMessage(msgFreq, 'sine', 1, duration);
        }

        switch (modulation) {
            case 'am':
                modulated = analogMod.modulate_AM(carrier, message, modIndex);
                demodIdeal = analogMod.demodulate_AM_Envelope(modulated, carrierFreq);
                break;
            case 'fm':
                modulated = analogMod.modulate_FM(carrierFreq, message, msgFreq * modIndex, duration);
                demodIdeal = analogMod.demodulate_FM(modulated, carrierFreq);
                break;
            case 'pm':
                modulated = analogMod.modulate_PM(carrier, message, modIndex, carrierFreq);
                demodIdeal = analogMod.demodulate_PM_Hilbert(modulated, carrierFreq);
                break;
            case 'ask':
                modulated = digitalMod.modulate_ASK(carrierFreq, bitStream!, 0.01);
                const recoveredAsk = digitalMod.demodulate_ASK(modulated, 0.01);
                demodIdeal = sigGen.generateMessage(msgFreq, 'sine', 1, duration, recoveredAsk);
                break;
            case 'fsk':
                modulated = digitalMod.modulate_FSK(carrierFreq + 200, carrierFreq - 200, bitStream!, 0.01);
                const recoveredFsk = digitalMod.demodulate_FSK(modulated, carrierFreq + 200, carrierFreq - 200, 0.01);
                demodIdeal = sigGen.generateMessage(msgFreq, 'sine', 1, duration, recoveredFsk);
                break;
            case 'psk':
                modulated = digitalMod.modulate_BPSK(carrierFreq, bitStream!, 0.01);
                const recoveredPsk = digitalMod.demodulate_PSK(modulated, carrierFreq, 0.01);
                demodIdeal = sigGen.generateMessage(msgFreq, 'sine', 1, duration, recoveredPsk);
                break;
            case 'qam':
                modulated = digitalMod.modulate_16QAM(carrierFreq, bitStream!, 0.01);
                const recoveredQam = digitalMod.demodulate_16QAM(modulated, carrierFreq, 0.01);
                demodIdeal = sigGen.generateMessage(msgFreq, 'sine', 1, duration, recoveredQam);
                break;
            // ... add others as needed
        }

        const noise = sigGen.addNoise(modulated, snr);
        let demodulated = new Float32Array(0);

        // Simple noisy demodulation for demo
        switch (modulation) {
            case 'am': demodulated = analogMod.demodulate_AM_Envelope(noise, carrierFreq); break;
            case 'fm': demodulated = analogMod.demodulate_FM(noise, carrierFreq); break;
            case 'pm': demodulated = analogMod.demodulate_PM_Hilbert(noise, carrierFreq); break;
            // Digital ones would need bit recovery then re-synthesis or just use waveform
            default: demodulated = demodIdeal; // Placeholder
        }

        setSignals({
            carrier,
            message,
            modulated,
            demodulated,
            demodIdeal,
            noise
        });

        // Calculate metrics
        const measuredSnr = analyzer.calculateSNR(modulated, noise);
        const peakPower = analyzer.calculatePeakPower(modulated);
        const spectrum = fft.forward(modulated);
        const bandwidth = analyzer.calculateBandwidth(spectrum, sampleRate);

        setMetrics({
            snr: measuredSnr,
            ber: isDigital ? analyzer.calculateBER(bitStream!, digitalMod.demodulate_ASK(noise, 0.01)) : 0,
            bandwidth,
            peakPower,
            efficiency: 1.0, // placeholder
            evm: 0 // placeholder
        });

    }, [modulation, carrierFreq, msgFreq, modIndex, snr, sampleRate]);

    useEffect(() => {
        generateSignals();
    }, [generateSignals]);

    const playSignal = async (type: keyof typeof signals) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        const signal = signals[type];
        if (!signal.length) return;

        const buffer = audioCtxRef.current.createBuffer(1, signal.length, audioCtxRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Simple resampling/normalization for playback
        const maxVal = Math.max(...Array.from(signal).map(Math.abs));
        for (let i = 0; i < signal.length; i++) {
            data[i] = maxVal > 0 ? signal[i] / maxVal : 0;
        }

        if (sourceRef.current) {
            sourceRef.current.stop();
        }

        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.start();
        sourceRef.current = source;
    };

    const handleModulationChange = (newMod: string) => {
        setModulation(newMod);
        const defaults = MODULATION_DEFAULTS[newMod as keyof typeof MODULATION_DEFAULTS];
        if (defaults) {
            setCarrierFreq(defaults.carrierFreq);
            setMsgFreq(defaults.msgFreq);
            setModIndex(defaults.modIndex);
            setSnr(defaults.snrDb);
            setSampleRate(defaults.sampleRate * 1000);
        }
    };

    return {
        modulation,
        carrierFreq,
        msgFreq,
        modIndex,
        snr,
        sampleRate,
        signals,
        metrics,
        setCarrierFreq,
        setMsgFreq,
        setModIndex,
        setSnr,
        setSampleRate,
        handleModulationChange,
        playSignal,
        generateSignals
    };
};
