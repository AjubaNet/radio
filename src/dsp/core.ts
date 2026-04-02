import type { ModulationType } from '../types/radio';

export class SimpleFFT {
    size: number;
    constructor(size: number) {
        let n = 1;
        while (n * 2 <= size) n *= 2;
        this.size = n;
    }

    forward(input: Float32Array): Float32Array {
        const N = this.size;
        const re = new Float32Array(N);
        const im = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
            re[i] = (i < input.length ? input[i] : 0) * w;
        }
        let j = 0;
        for (let i = 1; i < N; i++) {
            let bit = N >> 1;
            for (; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) {
                [re[i], re[j]] = [re[j], re[i]];
                [im[i], im[j]] = [im[j], im[i]];
            }
        }
        for (let len = 2; len <= N; len <<= 1) {
            const ang = -2 * Math.PI / len;
            const wRe = Math.cos(ang);
            const wIm = Math.sin(ang);
            for (let i = 0; i < N; i += len) {
                let uRe = 1, uIm = 0;
                for (let k = 0; k < len / 2; k++) {
                    const eRe = re[i + k], eIm = im[i + k];
                    const oRe = re[i + k + len/2] * uRe - im[i + k + len/2] * uIm;
                    const oIm = re[i + k + len/2] * uIm + im[i + k + len/2] * uRe;
                    re[i + k]         = eRe + oRe;
                    im[i + k]         = eIm + oIm;
                    re[i + k + len/2] = eRe - oRe;
                    im[i + k + len/2] = eIm - oIm;
                    const nuRe = uRe * wRe - uIm * wIm;
                    uIm = uRe * wIm + uIm * wRe;
                    uRe = nuRe;
                }
            }
        }
        const out = new Float32Array(N * 2);
        for (let i = 0; i < N; i++) {
            out[i * 2]     = re[i];
            out[i * 2 + 1] = im[i];
        }
        return out;
    }
}

export class SignalGenerator {
    sampleRate: number;
    constructor(sampleRate: number) {
        this.sampleRate = sampleRate;
    }

    generateCarrier(frequency: number, amplitude = 1, duration = 0.1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const signal = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let i = 0; i < samples; i++) signal[i] = amplitude * Math.sin(omega * i);
        return signal;
    }

    generateMessage(frequency: number, type = 'sine', amplitude = 0.5, duration = 0.1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const signal = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let i = 0; i < samples; i++) {
            switch(type) {
                case 'sine': signal[i] = amplitude * Math.sin(omega * i); break;
                case 'square': signal[i] = amplitude * (Math.sin(omega * i) >= 0 ? 1 : -1); break;
                case 'triangle': {
                    const period = this.sampleRate / frequency;
                    const ph = (i % period) / period;
                    signal[i] = amplitude * (ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph);
                    break;
                }
                default: signal[i] = amplitude * Math.sin(omega * i);
            }
        }
        return signal;
    }

    addNoise(signal: Float32Array, snrDb: number): Float32Array {
        const noisy = new Float32Array(signal.length);
        let signalPower = 0;
        for (let i = 0; i < signal.length; i++) signalPower += signal[i] * signal[i];
        signalPower /= signal.length;
        const snrLinear = Math.pow(10, snrDb / 10);
        const noiseStdDev = Math.sqrt(signalPower / snrLinear);
        for (let i = 0; i < signal.length; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            noisy[i] = signal[i] + noiseStdDev * gaussian;
        }
        return noisy;
    }
}

export class RadioEngine {
    sampleRate: number;
    constructor(sampleRate: number) {
        this.sampleRate = sampleRate;
    }

    modulate(type: ModulationType, carrier: Float32Array, message: Float32Array, index: number, freq: number): Float32Array {
        const modulated = new Float32Array(carrier.length);
        switch(type) {
            case 'am':
                for (let i = 0; i < carrier.length; i++) modulated[i] = (1 + index * message[i]) * carrier[i];
                break;
            case 'fm':
                let phase = 0;
                const deviation = freq * index;
                for (let i = 0; i < carrier.length; i++) {
                    const instFreq = freq + deviation * message[i];
                    phase += 2 * Math.PI * instFreq / this.sampleRate;
                    modulated[i] = Math.sin(phase);
                }
                break;
            default:
                modulated.set(carrier);
        }
        return modulated;
    }

    demodulate(type: ModulationType, signal: Float32Array, carrierFreq: number): Float32Array {
        const n = signal.length;
        const out = new Float32Array(n);
        switch(type) {
            case 'am':
                const rectified = new Float32Array(n);
                for (let i = 0; i < n; i++) rectified[i] = Math.abs(signal[i]);
                const lpfWin = Math.floor(this.sampleRate / carrierFreq) * 2;
                for (let i = 0; i < n; i++) {
                    let sum = 0, cnt = 0;
                    for (let j = Math.max(0, i-lpfWin); j <= Math.min(n-1, i+lpfWin); j++) { sum += rectified[j]; cnt++; }
                    out[i] = (sum / cnt) * 2 - 1;
                }
                break;
            case 'fm':
                const omega = 2 * Math.PI * carrierFreq / this.sampleRate;
                const I = new Float32Array(n);
                const Q = new Float32Array(n);
                for (let i = 0; i < n; i++) {
                    I[i] = signal[i] * Math.cos(omega * i);
                    Q[i] = -signal[i] * Math.sin(omega * i);
                }
                for (let i = 1; i < n; i++) {
                    const dI = I[i] - I[i-1];
                    const dQ = Q[i] - Q[i-1];
                    const mag2 = I[i]*I[i] + Q[i]*Q[i] + 1e-10;
                    out[i] = (I[i]*dQ - Q[i]*dI) / mag2;
                }
                break;
            default:
                out.set(signal);
        }
        let max = 0;
        for (let i = 0; i < n; i++) max = Math.max(max, Math.abs(out[i]));
        if (max > 0) for (let i = 0; i < n; i++) out[i] /= max;
        return out;
    }
}
