/**
 * Analog modulation/demodulation: AM, FM, PM
 */

// --- Internal helpers ---

/** Normalize signal to [-1, 1] so modulation index is applied correctly. */
function normalizeMsg(msg: Float32Array): Float32Array {
    let max = 0;
    for (let i = 0; i < msg.length; i++) max = Math.max(max, Math.abs(msg[i]));
    if (max < 1e-10) return msg.slice();
    const out = new Float32Array(msg.length);
    for (let i = 0; i < msg.length; i++) out[i] = msg[i] / max;
    return out;
}

/**
 * O(n) symmetric box (moving average) filter using prefix sums.
 * @param halfWin half-window size — total window is 2*halfWin+1 samples
 */
function boxFilter(input: Float32Array, halfWin: number): Float32Array {
    const n = input.length;
    const out = new Float32Array(n);
    const prefix = new Float32Array(n + 1);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + input[i];
    for (let i = 0; i < n; i++) {
        const lo = Math.max(0, i - halfWin);
        const hi = Math.min(n - 1, i + halfWin);
        out[i] = (prefix[hi + 1] - prefix[lo]) / (hi - lo + 1);
    }
    return out;
}

// --- AM ---

export function modulateAM(carrier: Float32Array, message: Float32Array, index: number): Float32Array {
    const n = carrier.length;
    const norm = normalizeMsg(message);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = (1 + index * norm[i]) * carrier[i];
    return out;
}

/**
 * AM envelope detector: rectify → LPF.
 * Facade post-processing (DC removal + normalize) completes the recovery.
 */
export function demodulateAM(signal: Float32Array, sr: number, carrierFreq: number): Float32Array {
    const n = signal.length;
    const rectified = new Float32Array(n);
    for (let i = 0; i < n; i++) rectified[i] = Math.abs(signal[i]);
    // LPF cutoff well below carrier: half-win = 2 carrier periods
    const halfWin = Math.max(2, Math.floor(sr / carrierFreq) * 2);
    return boxFilter(rectified, halfWin);
}

// --- FM ---

/**
 * FM modulation with correct deviation: Δf = msgFreq × modIndex (Carson/standard definition).
 * Message is normalized before modulation so modIndex is the true modulation index β.
 */
export function modulateFM(
    n: number,
    sr: number,
    carrierFreq: number,
    message: Float32Array,
    modIndex: number,
    msgFreq: number
): Float32Array {
    const norm = normalizeMsg(message);
    const deviation = msgFreq * modIndex; // Δf = fm × β
    const out = new Float32Array(n);
    let phase = 0;
    for (let i = 0; i < n; i++) {
        phase += 2 * Math.PI * (carrierFreq + deviation * norm[i]) / sr;
        out[i] = Math.sin(phase);
    }
    return out;
}

/**
 * FM coherent quadrature discriminator.
 * LPF null placed at 2fc (window = carrierPeriod/4) to kill the mixing image
 * while passing FM baseband up to ~fc/2.
 */
export function demodulateFM(signal: Float32Array, sr: number, carrierFreq: number): Float32Array {
    const n = signal.length;
    const omega = 2 * Math.PI * carrierFreq / sr;
    const carrierPeriod = Math.floor(sr / carrierFreq);
    // Half-win places box-filter null at sr/(2*halfWin) ≈ 2fc
    const halfWin = Math.max(2, Math.round(carrierPeriod / 4));

    const rawI = new Float32Array(n);
    const rawQ = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        rawI[i] = signal[i] * Math.cos(omega * i);
        rawQ[i] = -signal[i] * Math.sin(omega * i);
    }
    const I = boxFilter(rawI, halfWin);
    const Q = boxFilter(rawQ, halfWin);

    // Discriminator: d/dt[atan2(Q,I)] = (I·dQ - Q·dI)/(I²+Q²) ∝ m(t)
    const out = new Float32Array(n);
    for (let i = 1; i < n; i++) {
        const dI = I[i] - I[i - 1];
        const dQ = Q[i] - Q[i - 1];
        const mag2 = I[i] * I[i] + Q[i] * Q[i] + 1e-10;
        out[i] = (I[i] * dQ - Q[i] * dI) / mag2;
    }
    return out;
}

// --- PM ---

/**
 * PM modulation. Message normalized so modIndex is the true phase deviation (radians).
 */
export function modulatePM(
    carrier: Float32Array,
    message: Float32Array,
    modIndex: number,
    omega: number
): Float32Array {
    const n = carrier.length;
    const norm = normalizeMsg(message);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = Math.sin(omega * i + modIndex * norm[i]);
    return out;
}

/**
 * PM coherent quadrature demodulator.
 * After LPF: I = sin(β·m), Q = cos(β·m) → phase = atan2(I, Q) = β·m(t)
 */
export function demodulatePM(signal: Float32Array, sr: number, carrierFreq: number): Float32Array {
    const n = signal.length;
    const omega = 2 * Math.PI * carrierFreq / sr;
    const carrierPeriod = Math.floor(sr / carrierFreq);
    const halfWin = Math.max(2, Math.round(carrierPeriod / 4));

    const rawI = new Float32Array(n);
    const rawQ = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        rawI[i] = signal[i] * Math.cos(omega * i);
        rawQ[i] = -signal[i] * Math.sin(omega * i);
    }
    const I = boxFilter(rawI, halfWin);
    const Q = boxFilter(rawQ, halfWin);

    // I = A/2·sin(β·m), Q = A/2·cos(β·m) → atan2(I, Q) = β·m(t)
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = Math.atan2(I[i], Q[i]);
    return out;
}
