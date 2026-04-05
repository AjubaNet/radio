/**
 * DSP facade: RadioEngine delegates to focused per-category modules.
 *
 * Module layout:
 *   generators.ts  — SimpleFFT, SignalGenerator, Analysis
 *   analog.ts      — AM, FM, PM
 *   digital.ts     — ASK, FSK, PSK, QAM, PCM
 *   pulse.ts       — PAM, PWM, PPM
 *   spread.ts      — DSSS, FHSS
 */

import type { ModulationType } from '../types/radio';

// Re-export utility classes so existing imports keep working
export { CONFIG, SimpleFFT, SignalGenerator, Analysis } from './generators';

import { modulateAM, demodulateAM, modulateFM, demodulateFM, modulatePM, demodulatePM } from './analog';
import { modulateASK, demodulateASK, modulateFSK, demodulateFSK, modulatePSK, demodulatePSK, modulateQAM, demodulateQAM, modulatePCM, demodulatePCM } from './digital';
import { modulatePAM, demodulatePAM, modulatePWM, demodulatePWM, modulatePPM, demodulatePPM } from './pulse';
import { modulateDSSS, demodulateDSSS, modulateFHSS, demodulateFHSS } from './spread';

export class RadioEngine {
    sampleRate: number;

    constructor(sampleRate: number) {
        this.sampleRate = sampleRate;
    }

    /**
     * @param msgFreq  Message frequency (Hz). Required for FM (Δf = msgFreq × modIndex).
     *                 Defaults to 100 Hz if omitted.
     */
    modulate(
        type: ModulationType,
        carrier: Float32Array,
        message: Float32Array,
        index: number,
        freq: number,
        bitStream?: Uint8Array,
        msgFreq = 100
    ): Float32Array {
        const n = carrier.length;
        const omega = 2 * Math.PI * freq / this.sampleRate;

        switch (type) {
            case 'am':   return modulateAM(carrier, message, index);
            case 'fm':   return modulateFM(n, this.sampleRate, freq, message, index, msgFreq);
            case 'pm':   return modulatePM(carrier, message, index, omega);
            case 'ask':  return bitStream ? modulateASK(n, omega, bitStream) : carrier.slice();
            case 'fsk':  return bitStream ? modulateFSK(n, this.sampleRate, freq, bitStream) : carrier.slice();
            case 'psk':  return bitStream ? modulatePSK(n, omega, bitStream) : carrier.slice();
            case 'qam':  return bitStream ? modulateQAM(n, omega, bitStream) : carrier.slice();
            case 'pam':  return modulatePAM(n, this.sampleRate, message);
            case 'pwm':  return modulatePWM(n, this.sampleRate, message);
            case 'ppm':  return modulatePPM(n, this.sampleRate, message);
            case 'pcm':  return modulatePCM(n, this.sampleRate, message);
            case 'dsss': return bitStream ? modulateDSSS(n, omega, bitStream) : carrier.slice();
            case 'fhss': return bitStream ? modulateFHSS(n, this.sampleRate, freq, bitStream) : carrier.slice();
            default:     return carrier.slice();
        }
    }

    demodulate(
        type: ModulationType,
        signal: Float32Array,
        carrierFreq: number
    ): { waveform: Float32Array; constellation?: { I: number; Q: number }[] } {
        const n = signal.length;
        let raw: Float32Array;
        let constellation: { I: number; Q: number }[] | undefined;

        switch (type) {
            case 'am':   raw = demodulateAM(signal, this.sampleRate, carrierFreq); break;
            case 'fm':   raw = demodulateFM(signal, this.sampleRate, carrierFreq); break;
            case 'pm':   raw = demodulatePM(signal, this.sampleRate, carrierFreq); break;
            case 'ask':  raw = demodulateASK(signal, this.sampleRate, carrierFreq); break;
            case 'fsk':  raw = demodulateFSK(signal, this.sampleRate, carrierFreq); break;
            case 'psk':  raw = demodulatePSK(signal, this.sampleRate, carrierFreq); break;
            case 'qam': {
                const r = demodulateQAM(signal, this.sampleRate, carrierFreq);
                raw = r.waveform;
                constellation = r.constellation;
                break;
            }
            case 'pam':  raw = demodulatePAM(signal, this.sampleRate); break;
            case 'pwm':  raw = demodulatePWM(signal, this.sampleRate); break;
            case 'ppm':  raw = demodulatePPM(signal, this.sampleRate); break;
            case 'pcm':  raw = demodulatePCM(signal, this.sampleRate); break;
            case 'dsss': raw = demodulateDSSS(signal, this.sampleRate, carrierFreq); break;
            case 'fhss': raw = demodulateFHSS(signal, this.sampleRate, carrierFreq); break;
            default:     raw = signal.slice(); break;
        }

        // Post-processing: DC removal + normalize to [-1, 1]
        // Skip for QAM (has its own multi-level scaling) and PCM (quantized levels)
        if (type !== 'qam' && type !== 'pcm') {
            let mean = 0;
            for (let i = 0; i < n; i++) mean += raw[i];
            mean /= n;
            let maxAbs = 0;
            for (let i = 0; i < n; i++) {
                raw[i] -= mean;
                maxAbs = Math.max(maxAbs, Math.abs(raw[i]));
            }
            if (maxAbs > 0) for (let i = 0; i < n; i++) raw[i] /= maxAbs;
        }

        return { waveform: raw, constellation };
    }
}
