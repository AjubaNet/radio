import { CONFIG } from '../constants/modulation';

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
    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    generateCarrier(frequency: number, amplitude = 1, duration = 1, phase = 0): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const signal = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let i = 0; i < samples; i++) {
            signal[i] = amplitude * Math.sin(omega * i + phase);
        }
        return signal;
    }

    generateMessage(frequency: number, type = 'sine', amplitude = 1, duration = 1, bitStream: Uint8Array | null = null): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const signal = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        
        if (bitStream) {
            const bitDurationSamples = Math.floor(this.sampleRate * CONFIG.bitDuration);
            let bitIndex = 0;
            for (let i = 0; i < samples; i++) {
                const bit = bitStream[bitIndex % bitStream.length];
                signal[i] = (bit ? amplitude : -amplitude) * 0.5;
                if (i % bitDurationSamples === 0) bitIndex++;
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
                    case 'sawtooth': {
                        const period = this.sampleRate / frequency;
                        const ph = (i % period) / period;
                        signal[i] = amplitude * (2 * ph - 1);
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
        const noisePower = signalPower / snrLinear;
        const noiseStdDev = Math.sqrt(noisePower);
        for (let i = 0; i < signal.length; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            noisy[i] = signal[i] + noiseStdDev * gaussian;
        }
        return noisy;
    }

    generatePNSequence(length: number, _polynomial = 0x0B): Uint8Array {
        const sequence = new Uint8Array(length);
        let lfsr = 1;
        for (let i = 0; i < length; i++) {
            let feedback = 0;
            let temp = lfsr;
            while (temp) { feedback ^= (temp & 1); temp >>= 1; }
            sequence[i] = (lfsr & 1) ? 1 : 0;
            lfsr = ((lfsr << 1) | feedback) & ((1 << 8) - 1);
        }
        return sequence;
    }
}

export class AnalogModulator {
    sampleRate: number;
    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    modulate_AM(carrier: Float32Array, message: Float32Array, modulationIndex: number): Float32Array {
        const modulated = new Float32Array(carrier.length);
        let msgMax = 0;
        for (let i = 0; i < message.length; i++) msgMax = Math.max(msgMax, Math.abs(message[i]));
        for (let i = 0; i < carrier.length; i++) {
            const msgNorm = msgMax > 0 ? message[i] / msgMax : 0;
            modulated[i] = (1 + modulationIndex * msgNorm) * carrier[i];
        }
        return modulated;
    }

    modulate_FM(frequency: number, message: Float32Array, frequencyDeviation: number, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        let msgMax = 1e-12;
        for (let i = 0; i < message.length; i++) msgMax = Math.max(msgMax, Math.abs(message[i]));
        let phase = 0;
        for (let i = 0; i < samples; i++) {
            const msgIdx = Math.min(message.length - 1, Math.floor((i / samples) * message.length));
            const msgNorm = message[msgIdx] / msgMax;
            const instFreq = frequency + frequencyDeviation * msgNorm;
            phase += 2 * Math.PI * instFreq / this.sampleRate;
            modulated[i] = Math.sin(phase);
        }
        return modulated;
    }

    modulate_PM(carrier: Float32Array, message: Float32Array, phaseDeviation: number, carrierFreq: number): Float32Array {
        const modulated = new Float32Array(carrier.length);
        let msgMax = 1e-12;
        for (let i = 0; i < message.length; i++) msgMax = Math.max(msgMax, Math.abs(message[i]));
        const omega = 2 * Math.PI * carrierFreq / this.sampleRate;
        for (let i = 0; i < carrier.length; i++) {
            const msgIdx = Math.min(message.length - 1, i);
            const msgNorm = msgMax > 0 ? message[msgIdx] / msgMax : 0;
            modulated[i] = Math.sin(omega * i + phaseDeviation * msgNorm);
        }
        return modulated;
    }

    demodulate_AM_Envelope(signal: Float32Array, carrierFreq: number): Float32Array {
        const n = signal.length;
        const rectified = new Float32Array(n);
        for (let i = 0; i < n; i++) rectified[i] = Math.abs(signal[i]);
        const carrierPeriod = Math.max(2, Math.round(this.sampleRate / carrierFreq));
        const lpfWin = carrierPeriod * 2;
        const envelope = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            let sum = 0, cnt = 0;
            const lo = Math.max(0, i - lpfWin);
            const hi = Math.min(n - 1, i + lpfWin);
            for (let j = lo; j <= hi; j++) { sum += rectified[j]; cnt++; }
            envelope[i] = sum / cnt;
        }
        const alpha = 0.999;
        const output = new Float32Array(n);
        let dc = envelope[0];
        for (let i = 0; i < n; i++) {
            dc = alpha * dc + (1 - alpha) * envelope[i];
            output[i] = envelope[i] - dc;
        }
        let maxAbs = 1e-12;
        for (let i = 0; i < n; i++) maxAbs = Math.max(maxAbs, Math.abs(output[i]));
        if (maxAbs > 0) for (let i = 0; i < n; i++) output[i] /= maxAbs;
        return output;
    }

    demodulate_FM(signal: Float32Array, frequency: number): Float32Array {
        const n = signal.length;
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        const rawI = new Float32Array(n);
        const rawQ = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            rawI[i] = signal[i] * 2 * Math.cos(omega * i);
            rawQ[i] = signal[i] * (-2) * Math.sin(omega * i);
        }
        const carrierPeriod = Math.max(2, Math.round(this.sampleRate / frequency));
        const lpfWin = Math.max(2, Math.round(carrierPeriod / 4));
        const I = new Float32Array(n);
        const Q = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            let si = 0, sq = 0, cnt = 0;
            const lo = Math.max(0, i - lpfWin);
            const hi = Math.min(n - 1, i + lpfWin);
            for (let j = lo; j <= hi; j++) { si += rawI[j]; sq += rawQ[j]; cnt++; }
            I[i] = si / cnt; Q[i] = sq / cnt;
        }
        const demod = new Float32Array(n);
        for (let i = 1; i < n; i++) {
            const dI = I[i] - I[i - 1];
            const dQ = Q[i] - Q[i - 1];
            const mag2 = I[i] * I[i] + Q[i] * Q[i];
            demod[i] = mag2 > 1e-20 ? (I[i] * dQ - Q[i] * dI) / mag2 : 0;
        }
        demod[0] = demod[1];
        let mean = 0;
        for (let i = 0; i < n; i++) mean += demod[i];
        mean /= n || 1;
        let maxAbs = 1e-12;
        for (let i = 0; i < n; i++) { demod[i] -= mean; maxAbs = Math.max(maxAbs, Math.abs(demod[i])); }
        if (maxAbs > 0) for (let i = 0; i < n; i++) demod[i] /= maxAbs;
        return demod;
    }

    demodulate_PM_Hilbert(signal: Float32Array, carrierFreq: number): Float32Array {
        const n = signal.length;
        const omega = 2 * Math.PI * carrierFreq / this.sampleRate;
        const rawI = new Float32Array(n);
        const rawQ = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            rawI[i] = signal[i] * 2 * Math.cos(omega * i);
            rawQ[i] = signal[i] * (-2) * Math.sin(omega * i);
        }
        const carrierPeriod = Math.round(this.sampleRate / carrierFreq);
        const lpfWin = Math.max(carrierPeriod, carrierPeriod * 2);
        const I = new Float32Array(n);
        const Q = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            let si = 0, sq = 0, cnt = 0;
            const lo = Math.max(0, i - lpfWin);
            const hi = Math.min(n - 1, i + lpfWin);
            for (let j = lo; j <= hi; j++) { si += rawI[j]; sq += rawQ[j]; cnt++; }
            I[i] = si / cnt; Q[i] = sq / cnt;
        }
        for (let i = 0; i < n; i++) {
            const mag = Math.sqrt(I[i] * I[i] + Q[i] * Q[i]);
            if (mag > 1e-10) { I[i] /= mag; Q[i] /= mag; }
        }
        const phaseDemod = new Float32Array(n);
        for (let i = 0; i < n; i++) phaseDemod[i] = Math.atan2(Q[i], I[i]);
        let mean = 0;
        for (let i = 0; i < n; i++) mean += phaseDemod[i];
        mean /= n || 1;
        let maxAbs = 1e-12;
        for (let i = 0; i < n; i++) { phaseDemod[i] -= mean; maxAbs = Math.max(maxAbs, Math.abs(phaseDemod[i])); }
        if (maxAbs > 0) for (let i = 0; i < n; i++) phaseDemod[i] /= maxAbs;
        return phaseDemod;
    }
}

export class DigitalModulator {
    sampleRate: number;
    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    modulate_ASK(frequency: number, bitStream: Uint8Array, symbolDuration = 0.01): Float32Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const modulated = new Float32Array(bitStream.length * samplesPerSymbol);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let bit = 0; bit < bitStream.length; bit++) {
            for (let s = 0; s < samplesPerSymbol; s++) {
                const idx = bit * samplesPerSymbol + s;
                modulated[idx] = bitStream[bit] ? Math.sin(omega * idx) : 0;
            }
        }
        return modulated;
    }

    modulate_FSK(freqHigh: number, freqLow: number, bitStream: Uint8Array, symbolDuration = 0.01): Float32Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const modulated = new Float32Array(bitStream.length * samplesPerSymbol);
        const omega_high = 2 * Math.PI * freqHigh / this.sampleRate;
        const omega_low = 2 * Math.PI * freqLow / this.sampleRate;
        for (let bit = 0; bit < bitStream.length; bit++) {
            const omega = bitStream[bit] ? omega_high : omega_low;
            for (let s = 0; s < samplesPerSymbol; s++) {
                const idx = bit * samplesPerSymbol + s;
                modulated[idx] = Math.sin(omega * idx);
            }
        }
        return modulated;
    }

    modulate_BPSK(frequency: number, bitStream: Uint8Array, symbolDuration = 0.01): Float32Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const modulated = new Float32Array(bitStream.length * samplesPerSymbol);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let bit = 0; bit < bitStream.length; bit++) {
            const phase = bitStream[bit] ? 0 : Math.PI;
            for (let s = 0; s < samplesPerSymbol; s++) {
                const idx = bit * samplesPerSymbol + s;
                modulated[idx] = Math.sin(omega * idx + phase);
            }
        }
        return modulated;
    }

    modulate_16QAM(frequency: number, bitStream: Uint8Array, symbolDuration = 0.01): Float32Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const numSymbols = Math.floor(bitStream.length / 4);
        const modulated = new Float32Array(numSymbols * samplesPerSymbol);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        const alphabet = [-3, -1, 1, 3];
        for (let i = 0; i < numSymbols; i++) {
            const bits = bitStream.slice(i * 4, i * 4 + 4);
            const I = alphabet[((bits[0] << 1) | bits[1]) % 4];
            const Q = alphabet[((bits[2] << 1) | bits[3]) % 4];
            for (let s = 0; s < samplesPerSymbol; s++) {
                const idx = i * samplesPerSymbol + s;
                modulated[idx] = I * Math.cos(omega * idx) - Q * Math.sin(omega * idx);
            }
        }
        return modulated;
    }

    demodulate_ASK(signal: Float32Array, symbolDuration = 0.01): Uint8Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const numBits = Math.floor(signal.length / samplesPerSymbol);
        const bits = new Uint8Array(numBits);
        for (let bit = 0; bit < numBits; bit++) {
            let energy = 0;
            for (let s = 0; s < samplesPerSymbol; s++) {
                const sample = signal[bit * samplesPerSymbol + s];
                energy += sample * sample;
            }
            bits[bit] = energy / samplesPerSymbol > 0.25 ? 1 : 0;
        }
        return bits;
    }

    demodulate_FSK(signal: Float32Array, freqHigh: number, freqLow: number, symbolDuration = 0.01): Uint8Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const numBits = Math.floor(signal.length / samplesPerSymbol);
        const bits = new Uint8Array(numBits);
        const omega_high = 2 * Math.PI * freqHigh / this.sampleRate;
        const omega_low = 2 * Math.PI * freqLow / this.sampleRate;
        for (let bit = 0; bit < numBits; bit++) {
            let energyHigh = 0, energyLow = 0;
            for (let s = 0; s < samplesPerSymbol; s++) {
                const idx = bit * samplesPerSymbol + s;
                const sample = signal[idx];
                energyHigh += Math.abs(sample * Math.sin(omega_high * idx));
                energyLow += Math.abs(sample * Math.sin(omega_low * idx));
            }
            bits[bit] = energyHigh > energyLow ? 1 : 0;
        }
        return bits;
    }

    demodulate_PSK(signal: Float32Array, frequency: number, symbolDuration = 0.01): Uint8Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const numBits = Math.floor(signal.length / samplesPerSymbol);
        const bits = new Uint8Array(numBits);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let bit = 0; bit < numBits; bit++) {
            let correlation = 0;
            for (let s = 0; s < samplesPerSymbol; s++) {
                const idx = bit * samplesPerSymbol + s;
                correlation += signal[idx] * Math.sin(omega * idx);
            }
            bits[bit] = correlation > 0 ? 1 : 0;
        }
        return bits;
    }

    demodulate_16QAM(signal: Float32Array, frequency: number, symbolDuration = 0.01): Uint8Array {
        const samplesPerSymbol = Math.floor(this.sampleRate * symbolDuration);
        const numSymbols = Math.floor(signal.length / samplesPerSymbol);
        const bitStream = new Uint8Array(numSymbols * 4);
        const alphabet = [-3, -1, 1, 3];
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let sym = 0; sym < numSymbols; sym++) {
            let I = 0, Q = 0;
            for (let s = 0; s < samplesPerSymbol; s++) {
                const idx = sym * samplesPerSymbol + s;
                I += signal[idx] *  Math.cos(omega * idx);
                Q += signal[idx] * -Math.sin(omega * idx);
            }
            I = (2 * I) / samplesPerSymbol;
            Q = (2 * Q) / samplesPerSymbol;
            const findNearest = (val: number) => {
                let best = 0, bestDist = Infinity;
                for (let k = 0; k < alphabet.length; k++) {
                    const d = Math.abs(val - alphabet[k]);
                    if (d < bestDist) { bestDist = d; best = k; }
                }
                return best;
            };
            const I_idx = findNearest(I);
            const Q_idx = findNearest(Q);
            bitStream[sym * 4 + 0] = (I_idx >> 1) & 1;
            bitStream[sym * 4 + 1] =  I_idx & 1;
            bitStream[sym * 4 + 2] = (Q_idx >> 1) & 1;
            bitStream[sym * 4 + 3] =  Q_idx & 1;
        }
        return bitStream;
    }
}

export class PulseModulator {
    sampleRate: number;
    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    modulate_PAM(message: Float32Array, _samplingFreq: number, pulseWidth: number): Float32Array {
        const samplesPerPulse = Math.floor(pulseWidth * this.sampleRate);
        const modulated = new Float32Array(message.length * samplesPerPulse);
        let outIdx = 0;
        for (let i = 0; i < message.length; i++) {
            for (let p = 0; p < samplesPerPulse; p++) modulated[outIdx++] = message[i];
        }
        return modulated;
    }

    modulate_PWM(message: Float32Array, _frequency: number, period: number): Float32Array {
        const samplesPerPeriod = Math.floor(this.sampleRate * period);
        const modulated = new Float32Array(message.length * samplesPerPeriod);
        let outIdx = 0;
        for (let i = 0; i < message.length; i++) {
            const normalized = (message[i] + 1) / 2;
            const pulseOnTime = Math.floor(samplesPerPeriod * normalized);
            for (let s = 0; s < samplesPerPeriod; s++) modulated[outIdx++] = s < pulseOnTime ? 1 : 0;
        }
        return modulated;
    }

    modulate_PPM(message: Float32Array, _frequency: number, period: number): Float32Array {
        const samplesPerPeriod = Math.floor(this.sampleRate * period);
        const modulated = new Float32Array(message.length * samplesPerPeriod);
        const pulseWidth = Math.floor(samplesPerPeriod * 0.1);
        let outIdx = 0;
        for (let i = 0; i < message.length; i++) {
            const normalized = (message[i] + 1) / 2;
            const pulseStart = Math.floor(samplesPerPeriod * normalized * 0.8);
            for (let s = 0; s < samplesPerPeriod; s++) modulated[outIdx++] = (s >= pulseStart && s < pulseStart + pulseWidth) ? 1 : 0;
        }
        return modulated;
    }

    modulate_PCM(message: Float32Array, bitsPerSample = 8): Uint8Array {
        const levels = Math.pow(2, bitsPerSample);
        const bitStream = new Uint8Array(message.length * bitsPerSample);
        let bitIdx = 0;
        for (let i = 0; i < message.length; i++) {
            const normalized = Math.round(((message[i] + 1) / 2) * (levels - 1));
            for (let b = bitsPerSample - 1; b >= 0; b--) bitStream[bitIdx++] = (normalized >> b) & 1;
        }
        return bitStream;
    }

    demodulate_PAM(signal: Float32Array, samplesPerPulse: number): Float32Array {
        const numSamples = Math.floor(signal.length / samplesPerPulse);
        const demodulated = new Float32Array(numSamples);
        for (let i = 0; i < numSamples; i++) {
            let sum = 0;
            for (let s = 0; s < samplesPerPulse; s++) sum += signal[i * samplesPerPulse + s];
            demodulated[i] = sum / samplesPerPulse;
        }
        return demodulated;
    }

    demodulate_PWM(signal: Float32Array, periodSamples: number): Float32Array {
        const numPeriods = Math.floor(signal.length / periodSamples);
        const demodulated = new Float32Array(numPeriods);
        for (let p = 0; p < numPeriods; p++) {
            let high = 0;
            for (let s = 0; s < periodSamples; s++) if (signal[p * periodSamples + s] > 0.5) high++;
            demodulated[p] = 2 * (high / periodSamples) - 1;
        }
        return demodulated;
    }

    demodulate_PPM(signal: Float32Array, periodSamples: number): Float32Array {
        const numPeriods = Math.floor(signal.length / periodSamples);
        const demodulated = new Float32Array(numPeriods);
        for (let p = 0; p < numPeriods; p++) {
            let peakPos = 0, peakVal = -Infinity;
            for (let s = 0; s < periodSamples; s++) {
                const v = signal[p * periodSamples + s];
                if (v > peakVal) { peakVal = v; peakPos = s; }
            }
            const normalized = peakPos / (periodSamples * 0.8);
            demodulated[p] = Math.max(-1, Math.min(1, normalized * 2 - 1));
        }
        return demodulated;
    }

    demodulate_PCM(bitStream: Uint8Array, bitsPerSample = 8): Float32Array {
        const levels = Math.pow(2, bitsPerSample);
        const samples = Math.floor(bitStream.length / bitsPerSample);
        const demodulated = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            let value = 0;
            for (let b = 0; b < bitsPerSample; b++) value = (value << 1) | bitStream[i * bitsPerSample + b];
            demodulated[i] = 2 * (value / (levels - 1)) - 1;
        }
        return demodulated;
    }
}

export class SpreadSpectrumModulator {
    sampleRate: number;
    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    modulate_DSSS(bitStream: Uint8Array, carrier: Float32Array, pnSequence: Uint8Array, chipRate: number): Float32Array {
        const samplesPerChip = Math.floor(this.sampleRate / chipRate);
        const modulated = new Float32Array(bitStream.length * samplesPerChip * pnSequence.length);
        let outIdx = 0;
        for (let bit = 0; bit < bitStream.length; bit++) {
            for (let chip = 0; chip < pnSequence.length; chip++) {
                const pnBit = pnSequence[chip];
                const dataChip = bitStream[bit] ? pnBit : (1 - pnBit);
                for (let s = 0; s < samplesPerChip; s++) {
                    modulated[outIdx] = (2 * dataChip - 1) * carrier[outIdx % carrier.length];
                    outIdx++;
                }
            }
        }
        return modulated;
    }

    modulate_FHSS(bitStream: Uint8Array, hopFreqs: number[], pnSequence: Uint8Array, hopsPerBit = 5): Float32Array {
        const samplesPerHop = Math.floor(this.sampleRate / 100);
        const modulated = new Float32Array(bitStream.length * hopsPerBit * samplesPerHop);
        let outIdx = 0, pnIdx = 0;
        for (let bit = 0; bit < bitStream.length; bit++) {
            for (let hop = 0; hop < hopsPerBit; hop++) {
                const hopFreq = hopFreqs[pnSequence[pnIdx++ % pnSequence.length] % hopFreqs.length];
                const omega = 2 * Math.PI * hopFreq / this.sampleRate;
                for (let s = 0; s < samplesPerHop; s++) {
                    modulated[outIdx] = Math.sin(omega * outIdx);
                    outIdx++;
                }
            }
        }
        return modulated;
    }

    demodulate_DSSS(signal: Float32Array, pnSequence: Uint8Array, chipRate: number): Uint8Array {
        const samplesPerChip = Math.floor(this.sampleRate / chipRate);
        const samplesPerBit = samplesPerChip * pnSequence.length;
        const numBits = Math.floor(signal.length / samplesPerBit);
        const bits = new Uint8Array(numBits);
        for (let bit = 0; bit < numBits; bit++) {
            let correlation = 0;
            for (let chip = 0; chip < pnSequence.length; chip++) {
                const pnBit = pnSequence[chip];
                for (let s = 0; s < samplesPerChip; s++) {
                    const idx = bit * samplesPerBit + chip * samplesPerChip + s;
                    correlation += signal[idx] * (pnBit ? 1 : -1);
                }
            }
            bits[bit] = correlation > 0 ? 1 : 0;
        }
        return bits;
    }

    demodulate_FHSS(signal: Float32Array, hopFreqs: number[], pnSequence: Uint8Array, hopsPerBit = 5): Uint8Array {
        const samplesPerHop = Math.floor(this.sampleRate / 100);
        const numBits = Math.floor(signal.length / (hopsPerBit * samplesPerHop));
        const bits = new Uint8Array(numBits);
        let pnIdx = 0, signalIdx = 0;
        for (let bit = 0; bit < numBits; bit++) {
            let energy = 0;
            for (let hop = 0; hop < hopsPerBit; hop++) {
                const hopFreq = hopFreqs[pnSequence[pnIdx++ % pnSequence.length] % hopFreqs.length];
                const omega = 2 * Math.PI * hopFreq / this.sampleRate;
                let re = 0, im = 0;
                for (let s = 0; s < samplesPerHop && signalIdx < signal.length; s++, signalIdx++) {
                    re += signal[signalIdx] * Math.cos(omega * signalIdx);
                    im += signal[signalIdx] * Math.sin(omega * signalIdx);
                }
                energy += re * re + im * im;
            }
            bits[bit] = energy > samplesPerHop * hopsPerBit * 0.25 ? 1 : 0;
        }
        return bits;
    }
}

export class SignalAnalyzer {
    sampleRate: number;
    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    calculateSNR(cleanSignal: Float32Array, noisySignal: Float32Array): number {
        let signalPower = 0, noisePower = 0;
        const n = Math.min(cleanSignal.length, noisySignal.length);
        for (let i = 0; i < n; i++) {
            signalPower += cleanSignal[i] * cleanSignal[i];
            const noise = noisySignal[i] - cleanSignal[i];
            noisePower += noise * noise;
        }
        return 10 * Math.log10((signalPower / n) / Math.max(noisePower / n, 1e-10));
    }

    calculateBER(original: Uint8Array, recovered: Uint8Array): number {
        let errors = 0;
        const n = Math.min(original.length, recovered.length);
        for (let i = 0; i < n; i++) if (original[i] !== recovered[i]) errors++;
        return (errors / n) * 100;
    }

    calculatePeakPower(signal: Float32Array): number {
        let maxPower = 0;
        for (let i = 0; i < signal.length; i++) maxPower = Math.max(maxPower, signal[i] * signal[i]);
        return 10 * Math.log10(Math.max(maxPower, 1e-10));
    }

    calculateBandwidth(spectrum: Float32Array, sampleRate: number): number {
        let totalPower = 0, weightedFreq = 0;
        const numBins = spectrum.length / 2;
        const freqStep = sampleRate / (spectrum.length / 2);
        for (let i = 0; i < numBins; i++) {
            const mag = Math.sqrt(spectrum[i*2]**2 + spectrum[i*2+1]**2);
            totalPower += mag;
            weightedFreq += i * freqStep * mag;
        }
        const centerFreq = totalPower > 0 ? weightedFreq / totalPower : 0;
        let variance = 0;
        for (let i = 0; i < numBins; i++) {
            const mag = Math.sqrt(spectrum[i*2]**2 + spectrum[i*2+1]**2);
            variance += ((i * freqStep - centerFreq)**2) * mag;
        }
        return Math.sqrt(variance / Math.max(1, totalPower)) * 2;
    }
}
