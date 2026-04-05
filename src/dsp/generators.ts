import type { ModulationType } from '../types/radio';

export const CONFIG = {
    bitDuration: 0.01, // 10ms per bit
    defaultSampleRate: 44100
};

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
                    const oRe = re[i + k + len / 2] * uRe - im[i + k + len / 2] * uIm;
                    const oIm = re[i + k + len / 2] * uIm + im[i + k + len / 2] * uRe;
                    re[i + k]         = eRe + oRe;
                    im[i + k]         = eIm + oIm;
                    re[i + k + len / 2] = eRe - oRe;
                    im[i + k + len / 2] = eIm - oIm;
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

    generateMessage(frequency: number, type: string, amplitude = 0.5, duration = 0.1, bitStream: Uint8Array | null = null): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const signal = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;

        if (bitStream) {
            const samplesPerBit = Math.floor(samples / bitStream.length);
            for (let i = 0; i < bitStream.length; i++) {
                const val = bitStream[i] ? amplitude : -amplitude;
                for (let s = 0; s < samplesPerBit; s++) {
                    const idx = i * samplesPerBit + s;
                    if (idx < samples) signal[idx] = val;
                }
            }
        } else {
            for (let i = 0; i < samples; i++) {
                const t = i / this.sampleRate;
                switch (type) {
                    case 'sine':     signal[i] = amplitude * Math.sin(omega * i); break;
                    case 'square':   signal[i] = amplitude * (Math.sin(omega * i) >= 0 ? 1 : -1); break;
                    case 'sawtooth': signal[i] = amplitude * (2 * (t * frequency - Math.floor(0.5 + t * frequency))); break;
                    case 'triangle': signal[i] = amplitude * (2 * Math.abs(2 * (t * frequency - Math.floor(0.5 + t * frequency))) - 1); break;
                    case 'noise':    signal[i] = amplitude * (Math.random() * 2 - 1); break;
                    default:         signal[i] = amplitude * Math.sin(omega * i);
                }
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
        const noiseStdDev = Math.sqrt(signalPower / Math.max(1e-10, snrLinear));
        for (let i = 0; i < signal.length; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const gaussian = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
            noisy[i] = signal[i] + noiseStdDev * gaussian;
        }
        return noisy;
    }
}

export class Analysis {
    calculateSNR(original: Float32Array, noisy: Float32Array): number {
        let signalPower = 0, noisePower = 0;
        for (let i = 0; i < original.length; i++) {
            signalPower += original[i] * original[i];
            const noise = noisy[i] - original[i];
            noisePower += noise * noise;
        }
        return 10 * Math.log10((signalPower / original.length) / Math.max(noisePower / original.length, 1e-12));
    }

    calculateBER(original: Uint8Array, recovered: Uint8Array): number {
        let errors = 0;
        const n = Math.min(original.length, recovered.length);
        for (let i = 0; i < n; i++) if (original[i] !== recovered[i]) errors++;
        return n > 0 ? (errors / n) * 100 : 0;
    }
}

// Suppress unused import warning — ModulationType is used by core.ts facade
export type { ModulationType };
