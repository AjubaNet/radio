/**
 * Spread-spectrum modulation/demodulation: DSSS, FHSS
 */

const PN_SEQUENCE = [1, 1, 1, -1, -1, 1, -1] as const; // 7-chip Gold-like PN code

/** Hop frequency plan: 4 slots symmetrically around carrier */
function hopFreqs(carrierFreq: number): number[] {
    return [carrierFreq - 600, carrierFreq - 200, carrierFreq + 200, carrierFreq + 600];
}

// --- DSSS ---

export function modulateDSSS(n: number, omega: number, bitStream: Uint8Array): Float32Array {
    const out = new Float32Array(n);
    const spb = Math.floor(n / bitStream.length);
    const spc = Math.floor(spb / PN_SEQUENCE.length); // samples per chip

    for (let b = 0; b < bitStream.length; b++) {
        const bitVal = bitStream[b] ? 1 : -1;
        for (let c = 0; c < PN_SEQUENCE.length; c++) {
            const chipVal = bitVal * PN_SEQUENCE[c]; // BPSK spreading
            for (let s = 0; s < spc; s++) {
                const idx = b * spb + c * spc + s;
                if (idx < n) out[idx] = chipVal * Math.sin(omega * idx);
            }
        }
    }
    return out;
}

/**
 * DSSS despreader: correlate each bit slot with pn[c]·sin(ωt) over all chips.
 * Outputs ±1 stepped waveform (16-bit frame assumed).
 */
export function demodulateDSSS(signal: Float32Array, sr: number, carrierFreq: number): Float32Array {
    const n = signal.length;
    const omega = 2 * Math.PI * carrierFreq / sr;
    const DEFAULT_BITS = 16;
    const spb = Math.floor(n / DEFAULT_BITS);
    const spc = Math.floor(spb / PN_SEQUENCE.length);
    const out = new Float32Array(n);

    for (let b = 0; b < DEFAULT_BITS; b++) {
        let corr = 0;
        for (let c = 0; c < PN_SEQUENCE.length; c++) {
            for (let s = 0; s < spc; s++) {
                const idx = b * spb + c * spc + s;
                if (idx < n) corr += signal[idx] * PN_SEQUENCE[c] * Math.sin(omega * idx);
            }
        }
        const val = corr > 0 ? 1 : -1;
        const start = b * spb;
        const end = Math.min(n, start + spb);
        for (let i = start; i < end; i++) out[i] = val;
    }
    return out;
}

// --- FHSS ---

/**
 * FHSS modulator with BPSK encoding: bit value is encoded as ±sin at the hop frequency.
 * This ensures the demodulator can recover the bit (the original code didn't encode bits).
 */
export function modulateFHSS(n: number, sr: number, carrierFreq: number, bitStream: Uint8Array): Float32Array {
    const out = new Float32Array(n);
    const freqs = hopFreqs(carrierFreq);
    const spb = Math.floor(n / bitStream.length);

    for (let b = 0; b < bitStream.length; b++) {
        const w = 2 * Math.PI * freqs[b % freqs.length] / sr;
        const bitSign = bitStream[b] ? 1 : -1; // BPSK: +sin for 1, -sin for 0
        for (let s = 0; s < spb; s++) {
            const idx = b * spb + s;
            if (idx < n) out[idx] = bitSign * Math.sin(w * idx);
        }
    }
    return out;
}

/**
 * FHSS demodulator: correlate each slot with the known hop frequency reference.
 * Outputs ±1 stepped waveform (16-bit frame assumed).
 */
export function demodulateFHSS(signal: Float32Array, sr: number, carrierFreq: number): Float32Array {
    const n = signal.length;
    const freqs = hopFreqs(carrierFreq);
    const DEFAULT_BITS = 16;
    const spb = Math.floor(n / DEFAULT_BITS);
    const out = new Float32Array(n);

    for (let b = 0; b < DEFAULT_BITS; b++) {
        const w = 2 * Math.PI * freqs[b % freqs.length] / sr;
        const start = b * spb;
        const end = Math.min(n, start + spb);
        let corr = 0;
        for (let i = start; i < end; i++) corr += signal[i] * Math.sin(w * i);
        const val = corr > 0 ? 1 : -1;
        for (let i = start; i < end; i++) out[i] = val;
    }
    return out;
}
