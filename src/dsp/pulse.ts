/**
 * Pulse modulation/demodulation: PAM, PWM, PPM
 */

const PULSE_PERIOD_S = 0.005; // 5ms per pulse period
const PPM_PULSE_WIDTH = 5;    // samples per PPM pulse

// --- PAM ---

export function modulatePAM(n: number, sr: number, message: Float32Array): Float32Array {
    const out = new Float32Array(n);
    const spb = Math.floor(sr * PULSE_PERIOD_S);
    for (let i = 0; i < n; i++) {
        const pulseIdx = Math.floor(i / spb);
        const msgSample = message[Math.min(n - 1, pulseIdx * spb)];
        out[i] = (i % spb < spb * 0.5) ? msgSample : 0;
    }
    return out;
}

/**
 * PAM demodulator: sample near mid-point of active (first) half of each pulse.
 * Holds decoded value over the full period.
 */
export function demodulatePAM(signal: Float32Array, sr: number): Float32Array {
    const n = signal.length;
    const spb = Math.floor(sr * PULSE_PERIOD_S);
    const halfSpb = Math.floor(spb * 0.5);
    const out = new Float32Array(n);

    for (let p = 0; p * spb < n; p++) {
        const start = p * spb;
        // Sample the mid-point of the active half
        const midSample = Math.min(n - 1, start + Math.floor(halfSpb / 2));
        const val = signal[midSample];
        const end = Math.min(n, start + spb);
        for (let s = start; s < end; s++) out[s] = val;
    }
    return out;
}

// --- PWM ---

export function modulatePWM(n: number, sr: number, message: Float32Array): Float32Array {
    const out = new Float32Array(n);
    const spb = Math.floor(sr * PULSE_PERIOD_S);
    for (let i = 0; i < n; i++) {
        const pulseIdx = Math.floor(i / spb);
        const duty = (message[Math.min(n - 1, pulseIdx * spb)] + 1) / 2;
        out[i] = (i % spb < spb * duty) ? 1 : -1;
    }
    return out;
}

/**
 * PWM demodulator: measure positive-sample duty cycle per period.
 * Reconstructs: m(t) = 2·duty − 1
 */
export function demodulatePWM(signal: Float32Array, sr: number): Float32Array {
    const n = signal.length;
    const spb = Math.floor(sr * PULSE_PERIOD_S);
    const out = new Float32Array(n);

    for (let p = 0; p * spb < n; p++) {
        const start = p * spb;
        const end = Math.min(n, start + spb);
        let posCount = 0;
        for (let i = start; i < end; i++) if (signal[i] > 0) posCount++;
        const duty = posCount / (end - start);
        const val = 2 * duty - 1; // invert: m = 2·duty − 1
        for (let i = start; i < end; i++) out[i] = val;
    }
    return out;
}

// --- PPM ---

export function modulatePPM(n: number, sr: number, message: Float32Array): Float32Array {
    const out = new Float32Array(n);
    const spb = Math.floor(sr * PULSE_PERIOD_S);
    for (let i = 0; i < n; i += spb) {
        const normalized = (message[Math.min(n - 1, i)] + 1) / 2; // map [-1,1] → [0,1]
        const pulseStart = Math.floor(normalized * spb * 0.8);
        for (let s = 0; s < spb && (i + s) < n; s++) {
            out[i + s] = (s >= pulseStart && s < pulseStart + PPM_PULSE_WIDTH) ? 1 : 0;
        }
    }
    return out;
}

/**
 * PPM demodulator: find first rising-edge position within each frame.
 * Reconstructs normalized value → m(t).
 */
export function demodulatePPM(signal: Float32Array, sr: number): Float32Array {
    const n = signal.length;
    const spb = Math.floor(sr * PULSE_PERIOD_S);
    const out = new Float32Array(n);

    for (let p = 0; p * spb < n; p++) {
        const start = p * spb;
        const end = Math.min(n, start + spb);
        let pulsePos = -1;
        for (let s = 0; s < end - start; s++) {
            if (signal[start + s] > 0.5) { pulsePos = s; break; }
        }
        // Invert the normalization: normalized = pulsePos / (spb * 0.8), m = 2·norm − 1
        const normalized = pulsePos < 0 ? 0.5 : pulsePos / (spb * 0.8);
        const val = Math.max(-1, Math.min(1, 2 * normalized - 1));
        for (let i = start; i < end; i++) out[i] = val;
    }
    return out;
}
