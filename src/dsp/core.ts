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

    generateMessage(frequency: number, type = 'sine', amplitude = 0.5, duration = 0.1, bitStream: Uint8Array | null = null): Float32Array {
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

    generatePNSequence(length: number): Uint8Array {
        const seq = new Uint8Array(length);
        let lfsr = 0xACE1;
        for (let i = 0; i < length; i++) {
            const bit = ((lfsr >> 0) ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1;
            seq[i] = bit;
            lfsr = (lfsr >> 1) | (bit << 15);
        }
        return seq;
    }
}

export class RadioEngine {
    sampleRate: number;
    constructor(sampleRate: number) {
        this.sampleRate = sampleRate;
    }

    modulate(type: ModulationType, carrier: Float32Array, message: Float32Array, index: number, freq: number, bitStream?: Uint8Array): Float32Array {
        const n = carrier.length;
        const modulated = new Float32Array(n);
        const omega = 2 * Math.PI * freq / this.sampleRate;

        switch(type) {
            case 'am':
                for (let i = 0; i < n; i++) modulated[i] = (1 + index * message[i]) * carrier[i];
                break;
            case 'fm':
                let fmPhase = 0;
                const deviation = freq * index;
                for (let i = 0; i < n; i++) {
                    const instFreq = freq + deviation * message[i];
                    fmPhase += 2 * Math.PI * instFreq / this.sampleRate;
                    modulated[i] = Math.sin(fmPhase);
                }
                break;
            case 'pm':
                for (let i = 0; i < n; i++) modulated[i] = Math.sin(omega * i + index * message[i]);
                break;
            case 'ask':
                if (!bitStream) return carrier;
                const spbAsk = Math.floor(n / bitStream.length);
                for (let i = 0; i < bitStream.length; i++) {
                    const amp = bitStream[i] ? 1 : 0;
                    for (let s = 0; s < spbAsk; s++) {
                        const idx = i * spbAsk + s;
                        if (idx < n) modulated[idx] = amp * carrier[idx];
                    }
                }
                break;
            case 'fsk':
                if (!bitStream) return carrier;
                const spbFsk = Math.floor(n / bitStream.length);
                const fHigh = freq + 500;
                const fLow = freq - 500;
                for (let i = 0; i < bitStream.length; i++) {
                    const f = bitStream[i] ? fHigh : fLow;
                    const w = 2 * Math.PI * f / this.sampleRate;
                    for (let s = 0; s < spbFsk; s++) {
                        const idx = i * spbFsk + s;
                        if (idx < n) modulated[idx] = Math.sin(w * idx);
                    }
                }
                break;
            case 'psk':
                if (!bitStream) return carrier;
                const spbPsk = Math.floor(n / bitStream.length);
                for (let i = 0; i < bitStream.length; i++) {
                    const phase = bitStream[i] ? 0 : Math.PI;
                    for (let s = 0; s < spbPsk; s++) {
                        const idx = i * spbPsk + s;
                        if (idx < n) modulated[idx] = Math.sin(omega * idx + phase);
                    }
                }
                break;
            case 'pam':
                const spbPam = Math.floor(this.sampleRate * 0.002); // 2ms pulses
                for (let i = 0; i < n; i++) {
                    const pulseIdx = Math.floor(i / spbPam);
                    const inPulse = (i % spbPam) < (spbPam * 0.5);
                    modulated[i] = inPulse ? message[pulseIdx * spbPam] : 0;
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
        const omega = 2 * Math.PI * carrierFreq / this.sampleRate;

        switch(type) {
            case 'am':
                const rectified = new Float32Array(n);
                for (let i = 0; i < n; i++) rectified[i] = Math.abs(signal[i]);
                const lpfWinAm = Math.max(2, Math.floor(this.sampleRate / carrierFreq) * 2);
                for (let i = 0; i < n; i++) {
                    let sum = 0, cnt = 0;
                    for (let j = Math.max(0, i-lpfWinAm); j <= Math.min(n-1, i+lpfWinAm); j++) { sum += rectified[j]; cnt++; }
                    out[i] = (sum / cnt) * 2 - 0.6; // Basic envelope recovery
                }
                break;
            case 'fm':
                // Coherent quadrature demodulation
                const rawI = new Float32Array(n);
                const rawQ = new Float32Array(n);
                for (let i = 0; i < n; i++) {
                    rawI[i] = signal[i] * Math.cos(omega * i);
                    rawQ[i] = -signal[i] * Math.sin(omega * i);
                }
                // LPF window sized to remove 2fc component
                const lpfWinFm = Math.max(2, Math.floor(this.sampleRate / carrierFreq));
                const filteredI = new Float32Array(n);
                const filteredQ = new Float32Array(n);
                for (let i = 0; i < n; i++) {
                    let sI = 0, sQ = 0, cnt = 0;
                    for (let j = Math.max(0, i-lpfWinFm); j <= Math.min(n-1, i+lpfWinFm); j++) {
                        sI += rawI[j]; sQ += rawQ[j]; cnt++;
                    }
                    filteredI[i] = sI / cnt;
                    filteredQ[i] = sQ / cnt;
                }
                // Discriminator: dPhase/dt
                for (let i = 1; i < n; i++) {
                    const dI = filteredI[i] - filteredI[i-1];
                    const dQ = filteredQ[i] - filteredQ[i-1];
                    const mag2 = filteredI[i]*filteredI[i] + filteredQ[i]*filteredQ[i] + 1e-10;
                    out[i] = (filteredI[i]*dQ - filteredQ[i]*dI) / mag2;
                }
                break;
            case 'pm':
                const pI = new Float32Array(n);
                const pQ = new Float32Array(n);
                for (let i = 0; i < n; i++) {
                    pI[i] = signal[i] * Math.cos(omega * i);
                    pQ[i] = -signal[i] * Math.sin(omega * i);
                }
                const lpfWinPm = Math.max(2, Math.floor(this.sampleRate / carrierFreq) * 2);
                for (let i = 0; i < n; i++) {
                    let sI = 0, sQ = 0, cnt = 0;
                    for (let j = Math.max(0, i-lpfWinPm); j <= Math.min(n-1, i+lpfWinPm); j++) {
                        sI += pI[j]; sQ += pQ[j]; cnt++;
                    }
                    out[i] = Math.atan2(sQ / cnt, sI / cnt);
                }
                break;
            default:
                out.set(signal);
        }
        
        // Remove DC and normalize
        let mean = 0;
        for (let i = 0; i < n; i++) mean += out[i];
        mean /= n;
        let maxAbs = 0;
        for (let i = 0; i < n; i++) {
            out[i] -= mean;
            maxAbs = Math.max(maxAbs, Math.abs(out[i]));
        }
        if (maxAbs > 0) for (let i = 0; i < n; i++) out[i] /= maxAbs;
        
        return out;
    }
}
