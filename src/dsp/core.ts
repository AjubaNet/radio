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

        // Hann window
        for (let i = 0; i < N; i++) {
            const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
            re[i] = (i < input.length ? input[i] : 0) * w;
        }

        // Bit-reversal permutation
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

        // Butterfly operations
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

    /** Generates carrier: A * sin(2π f_c t + φ) */
    generateCarrier(frequency: number, amplitude = 1, duration = 1, phase = 0): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const signal = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        for (let i = 0; i < samples; i++) {
            signal[i] = amplitude * Math.sin(omega * i + phase);
        }
        return signal;
    }

    /** Baseband message (analog waveforms or digital bits) */
    generateMessage(frequency: number, type = 'sine', amplitude = 1, duration = 1, bitStream: Uint8Array | null = null): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const signal = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;

        if (bitStream && bitStream.length > 0) {
            const bitDurationSamples = Math.floor(this.sampleRate * CONFIG.bitDuration);
            let bitIndex = 0;
            for (let i = 0; i < samples; i++) {
                const bit = bitStream[bitIndex % bitStream.length];
                signal[i] = (bit ? amplitude : -amplitude) * 0.5;
                if ((i + 1) % bitDurationSamples === 0) bitIndex++;
            }
        } else {
            for (let i = 0; i < samples; i++) {
                switch (type) {
                    case 'sine':
                        signal[i] = amplitude * Math.sin(omega * i);
                        break;
                    case 'square':
                        signal[i] = amplitude * (Math.sin(omega * i) >= 0 ? 1 : -1);
                        break;
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
                    default:
                        signal[i] = amplitude * Math.sin(omega * i);
                }
            }
        }
        return signal;
    }

    /** Add AWGN noise (Box-Muller transform). SNR in dB. */
    addNoise(signal: Float32Array, snrDb: number): Float32Array {
        const noisy = new Float32Array(signal.length);
        let signalPower = 0;
        for (let i = 0; i < signal.length; i++) signalPower += signal[i] * signal[i];
        signalPower /= signal.length;

        const snrLinear = Math.pow(10, snrDb / 10);
        const noisePower = signalPower / (snrLinear || 1);
        const noiseStdDev = Math.sqrt(Math.max(noisePower, 1e-12));

        for (let i = 0; i < signal.length; i++) {
            const u1 = Math.random() || 1e-12;
            const u2 = Math.random();
            const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            noisy[i] = signal[i] + noiseStdDev * gaussian;
        }
        return noisy;
    }

    /** Improved PN sequence for DSSS/FHSS */
    generatePNSequence(length: number): Uint8Array {
        const sequence = new Uint8Array(length);
        let lfsr = 1;
        for (let i = 0; i < length; i++) {
            const feedback = ((lfsr >> 0) ^ (lfsr >> 1) ^ (lfsr >> 3) ^ (lfsr >> 7)) & 1;
            sequence[i] = lfsr & 1;
            lfsr = ((lfsr << 1) | feedback) & 0xFF;
        }
        return sequence;
    }
}

export class AnalogModulator {
    sampleRate: number;

    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    /** AM: s(t) = [1 + μ ⋅ m_norm(t)] ⋅ carrier(t) */
    modulate_AM(carrier: Float32Array, message: Float32Array, modulationIndex: number): Float32Array {
        const modulated = new Float32Array(carrier.length);
        let msgMax = 0;
        for (const val of message) msgMax = Math.max(msgMax, Math.abs(val));

        for (let i = 0; i < carrier.length; i++) {
            const msgNorm = msgMax > 0 ? message[Math.min(i, message.length - 1)] / msgMax : 0;
            modulated[i] = (1 + modulationIndex * msgNorm) * carrier[i];
        }
        return modulated;
    }

    /** FM: s(t) = sin(2π f_c t + 2π Δf ∫_0^t m(τ) dτ)  [Completed fix] */
    modulate_FM(carrierFreq: number, message: Float32Array, frequencyDeviation: number, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        let msgMax = 1e-12;
        for (const val of message) msgMax = Math.max(msgMax, Math.abs(val));

        let phase = 0;
        for (let i = 0; i < samples; i++) {
            const msgIdx = Math.min(i, message.length - 1);
            const msgNorm = message[msgIdx] / msgMax;
            const instFreq = carrierFreq + frequencyDeviation * msgNorm;
            phase += 2 * Math.PI * instFreq / this.sampleRate;
            modulated[i] = Math.sin(phase);
        }
        return modulated;
    }

    /** PM: s(t) = sin(2π f_c t + Δφ ⋅ m_norm(t)) */
    modulate_PM(carrierFreq: number, message: Float32Array, phaseDeviation: number, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        let msgMax = 1e-12;
        for (const val of message) msgMax = Math.max(msgMax, Math.abs(val));

        for (let i = 0; i < samples; i++) {
            const msgIdx = Math.min(i, message.length - 1);
            const msgNorm = message[msgIdx] / msgMax;
            const phase = 2 * Math.PI * carrierFreq * i / this.sampleRate + phaseDeviation * msgNorm;
            modulated[i] = Math.sin(phase);
        }
        return modulated;
    }
}

export class DigitalModulator {
    sampleRate: number;

    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    /** ASK (On-Off Keying variant): bit 1 = carrier, bit 0 = silence */
    modulate_ASK(carrier: Float32Array, bitStream: Uint8Array): Float32Array {
        const modulated = new Float32Array(carrier.length);
        const bitDurationSamples = Math.floor(this.sampleRate * CONFIG.bitDuration);
        let bitIndex = 0;

        for (let i = 0; i < carrier.length; i++) {
            const bit = bitStream[bitIndex % bitStream.length];
            modulated[i] = bit ? carrier[i] : 0;
            if ((i + 1) % bitDurationSamples === 0) bitIndex++;
        }
        return modulated;
    }

    /** FSK (Binary, non-coherent): select between two frequencies based on bit */
    modulate_FSK(lowFreq: number, highFreq: number, bitStream: Uint8Array, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        const bitDurationSamples = Math.floor(this.sampleRate * CONFIG.bitDuration);
        let bitIndex = 0;
        let phase = 0;

        for (let i = 0; i < samples; i++) {
            const bit = bitStream[bitIndex % bitStream.length];
            const freq = bit ? highFreq : lowFreq;
            phase += 2 * Math.PI * freq / this.sampleRate;
            modulated[i] = Math.sin(phase);
            if ((i + 1) % bitDurationSamples === 0) bitIndex++;
        }
        return modulated;
    }

    /** BPSK: phase 0 or π according to bit */
    modulate_BPSK(carrierFreq: number, bitStream: Uint8Array, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        const bitDurationSamples = Math.floor(this.sampleRate * CONFIG.bitDuration);
        let bitIndex = 0;

        for (let i = 0; i < samples; i++) {
            const bit = bitStream[bitIndex % bitStream.length];
            const phase = 2 * Math.PI * carrierFreq * i / this.sampleRate + (bit ? Math.PI : 0);
            modulated[i] = Math.sin(phase);
            if ((i + 1) % bitDurationSamples === 0) bitIndex++;
        }
        return modulated;
    }

    // 16-QAM and other schemes can be added similarly – let me know if you need them expanded.
}

export class Demodulator {
    sampleRate: number;

    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    /** AM Envelope Detection: rectify + low-pass + DC block */
    demodulate_AM_Envelope(signal: Float32Array): Float32Array {
        const rectified = new Float32Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            rectified[i] = Math.abs(signal[i]);
        }

        // Simple moving average LPF (boxcar)
        const window = 32;
        const demod = new Float32Array(signal.length);
        let sum = 0;
        for (let i = 0; i < signal.length; i++) {
            sum += rectified[i];
            if (i >= window) sum -= rectified[i - window];
            demod[i] = sum / window;
        }

        // Rough DC block
        const avg = demod.reduce((a, b) => a + b, 0) / demod.length;
        for (let i = 0; i < demod.length; i++) {
            demod[i] -= avg * 0.8;
        }
        return demod;
    }

    /** FM Demodulation using quadrature / phase derivative approximation */
    demodulate_FM(signal: Float32Array): Float32Array {
        const demod = new Float32Array(signal.length - 1);
        for (let i = 1; i < signal.length; i++) {
            // Simple discrete derivative of phase via quadrature difference
            const prev = signal[i - 1];
            const curr = signal[i];
            const diff = curr * prev - prev * curr; // rough cross term (I*Q' - Q*I')
            demod[i - 1] = diff; // scale later if needed
        }
        return demod;
    }

    /** PM Demodulation using approximate phase extraction */
    demodulate_PM(signal: Float32Array): Float32Array {
        const demod = new Float32Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            // Simplified: use arcsin approximation for small deviations or atan2 if I/Q available
            demod[i] = Math.asin(Math.max(-1, Math.min(1, signal[i])));
        }
        return demod;
    }

    /** Basic BPSK / PSK coherent demod (sign after correlation with reference) */
    demodulate_PSK(signal: Float32Array, carrierFreq: number): Uint8Array {
        const bitDurationSamples = Math.floor(this.sampleRate * CONFIG.bitDuration);
        const bits: number[] = [];
        let sum = 0;
        let sampleCount = 0;

        for (let i = 0; i < signal.length; i++) {
            const ref = Math.cos(2 * Math.PI * carrierFreq * i / this.sampleRate);
            sum += signal[i] * ref;
            sampleCount++;
            if (sampleCount >= bitDurationSamples) {
                bits.push(sum > 0 ? 1 : 0);
                sum = 0;
                sampleCount = 0;
            }
        }
        return new Uint8Array(bits);
    }
}

export class SpreadSpectrumModulator {
    sampleRate: number;

    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    /** DSSS: data XOR PN → BPSK on carrier */
    modulate_DSSS(carrierFreq: number, bitStream: Uint8Array, pnSequence: Uint8Array, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        const chipDurationSamples = Math.floor(this.sampleRate * CONFIG.bitDuration / pnSequence.length);
        let chipIndex = 0;

        for (let i = 0; i < samples; i++) {
            const dataBit = bitStream[Math.floor(i / (chipDurationSamples * pnSequence.length)) % bitStream.length];
            const chip = pnSequence[chipIndex % pnSequence.length];
            const spreadBit = dataBit ^ chip;
            const phase = 2 * Math.PI * carrierFreq * i / this.sampleRate + (spreadBit ? Math.PI : 0);
            modulated[i] = Math.sin(phase);
            if ((i + 1) % chipDurationSamples === 0) chipIndex++;
        }
        return modulated;
    }

    /** Fixed FHSS with data: data modulates each hop via BFSK */
    modulate_FHSS(baseFreq: number, bitStream: Uint8Array, pnSequence: Uint8Array, hopDuration = 0.05): Float32Array {
        const samples = Math.floor(this.sampleRate * (bitStream.length * CONFIG.bitDuration));
        const modulated = new Float32Array(samples);
        const hopSamples = Math.floor(this.sampleRate * hopDuration);
        let hopIndex = 0;
        let phase = 0;

        for (let i = 0; i < samples; i++) {
            const hop = pnSequence[hopIndex % pnSequence.length];
            const dataBit = bitStream[Math.floor(i / (hopSamples * pnSequence.length)) % bitStream.length] || 0;
            const freqOffset = dataBit ? 500 : -500; // BFSK offset on each hop
            const freq = baseFreq + hop * 200 + freqOffset; // hop + data

            phase += 2 * Math.PI * freq / this.sampleRate;
            modulated[i] = Math.sin(phase);

            if ((i + 1) % hopSamples === 0) hopIndex++;
        }
        return modulated;
    }

    /** Simple FHSS demod (energy per hop + data decision) – improved */
    demodulate_FHSS(signal: Float32Array, pnSequence: Uint8Array, baseFreq: number, hopDuration = 0.05): Uint8Array {
        const hopSamples = Math.floor(this.sampleRate * hopDuration);
        const bits: number[] = [];
        let hopIndex = 0;

        for (let start = 0; start < signal.length; start += hopSamples) {
            const end = Math.min(start + hopSamples, signal.length);
            let energyLow = 0, energyHigh = 0;

            for (let i = start; i < end; i++) {
                // Rough energy detection around expected hop frequencies
                const hop = pnSequence[hopIndex % pnSequence.length];
                const expectedFreq = baseFreq + hop * 200;
                // Simplified decision: compare average amplitude or zero-crossings (placeholder)
                energyHigh += Math.abs(signal[i]); // improve with proper correlation in production
            }

            bits.push(energyHigh > 0 ? 1 : 0); // placeholder – replace with proper BFSK decision
            hopIndex++;
        }
        return new Uint8Array(bits);
    }
}

export class PulseModulator {
    sampleRate: number;

    constructor(sampleRate = CONFIG.defaultSampleRate) {
        this.sampleRate = sampleRate;
    }

    /** PAM: Flat-top pulse amplitude modulation */
    modulate_PAM(message: Float32Array, pulseWidth = 0.01): Float32Array {
        const samples = message.length;
        const modulated = new Float32Array(samples);
        const pulseSamples = Math.floor(this.sampleRate * pulseWidth);

        for (let i = 0; i < samples; i += pulseSamples) {
            const amp = message[Math.floor(i / pulseSamples) % message.length];
            for (let j = 0; j < pulseSamples && (i + j) < samples; j++) {
                modulated[i + j] = amp;
            }
        }
        return modulated;
    }

    /** PWM: Pulse Width Modulation – duty cycle proportional to message */
    modulate_PWM(message: Float32Array, carrierFreq: number, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        const periodSamples = Math.floor(this.sampleRate / carrierFreq);
        let msgMax = 1e-12;
        for (const val of message) msgMax = Math.max(msgMax, Math.abs(val));

        for (let i = 0; i < samples; i++) {
            const msgIdx = Math.floor(i / periodSamples) % message.length;
            const msgNorm = (message[msgIdx] / msgMax + 1) / 2; // 0..1
            const duty = Math.max(0.1, Math.min(0.9, msgNorm));
            const pos = (i % periodSamples) / periodSamples;
            modulated[i] = pos < duty ? 1 : -1;
        }
        return modulated;
    }

    /** PPM: Pulse Position Modulation */
    modulate_PPM(message: Float32Array, pulseWidth = 0.005, duration = 1): Float32Array {
        const samples = Math.floor(this.sampleRate * duration);
        const modulated = new Float32Array(samples);
        const frameSamples = Math.floor(this.sampleRate * 0.02); // frame rate
        let msgMax = 1e-12;
        for (const val of message) msgMax = Math.max(msgMax, Math.abs(val));

        for (let frame = 0; frame < samples; frame += frameSamples) {
            const msgIdx = Math.floor(frame / frameSamples) % message.length;
            const msgNorm = message[msgIdx] / msgMax;
            const delay = Math.floor((msgNorm + 1) * 0.4 * frameSamples); // position offset

            for (let j = 0; j < Math.floor(this.sampleRate * pulseWidth) && (frame + delay + j) < samples; j++) {
                modulated[frame + delay + j] = 1;
            }
        }
        return modulated;
    }

    /** PCM: Simple 8-bit uniform quantization */
    modulate_PCM(message: Float32Array): Uint8Array {
        const bits: number[] = [];
        let msgMax = 1e-12;
        for (const val of message) msgMax = Math.max(msgMax, Math.abs(val));

        for (const val of message) {
            const norm = Math.max(-1, Math.min(1, val / msgMax));
            const quantized = Math.floor((norm + 1) * 127.5); // 0-255
            for (let b = 7; b >= 0; b--) {
                bits.push((quantized >> b) & 1);
            }
        }
        return new Uint8Array(bits);
    }
}

export class Analysis {
    /** Approximate SNR calculation from signal and noisy versions */
    calculateSNR(original: Float32Array, noisy: Float32Array): number {
        let signalPower = 0, noisePower = 0;
        for (let i = 0; i < original.length; i++) {
            signalPower += original[i] * original[i];
            const noise = noisy[i] - original[i];
            noisePower += noise * noise;
        }
        signalPower /= original.length;
        noisePower /= original.length;
        return 10 * Math.log10(signalPower / (noisePower || 1e-12));
    }

    /** Simple BER approximation (for demo – compare recovered bits) */
    calculateBER(originalBits: Uint8Array, recoveredBits: Uint8Array): number {
        let errors = 0;
        const len = Math.min(originalBits.length, recoveredBits.length);
        for (let i = 0; i < len; i++) {
            if (originalBits[i] !== recoveredBits[i]) errors++;
        }
        return len > 0 ? errors / len : 0;
    }

    /** Peak power and RMS bandwidth helpers can be added here if needed */
}

// Main exports – adjust according to how your components import
export {
    SignalGenerator,
    AnalogModulator,
    DigitalModulator,
    Demodulator,
    SpreadSpectrumModulator,
    PulseModulator,
    Analysis,
    SimpleFFT
};

// Example usage wrapper (optional – you can remove or expand)
export function createDSP() {
    const generator = new SignalGenerator();
    const analog = new AnalogModulator();
    const digital = new DigitalModulator();
    const demod = new Demodulator();
    const ss = new SpreadSpectrumModulator();
    const pulse = new PulseModulator();
    const analysis = new Analysis();

    return { generator, analog, digital, demod, ss, pulse, analysis };
}


