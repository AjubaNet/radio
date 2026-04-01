export const CONFIG = {
    defaultSampleRate: 44000,
    defaultCarrierFreq: 1000,
    defaultMessageFreq: 10,
    defaultModIndex: 0.5,
    defaultSNR: 20,
    bitDuration: 0.01, // 10ms per bit for digital mods
    canvasWidth: 800,
    canvasHeight: 300,
    timeWindow: 0.1, // 100ms display window
};

export const MODULATION_DEFAULTS = {
    am:   { carrierFreq: 1000, msgFreq: 100,  modIndex: 0.8, snrDb: 30, sampleRate: 44 },
    fm:   { carrierFreq: 2000, msgFreq: 100,  modIndex: 5,   snrDb: 30, sampleRate: 44 },
    pm:   { carrierFreq: 2000, msgFreq: 100,  modIndex: 2,   snrDb: 30, sampleRate: 44 },
    ask:  { carrierFreq: 2000, msgFreq: 100,  modIndex: 1,   snrDb: 30, sampleRate: 44 },
    fsk:  { carrierFreq: 2000, msgFreq: 100,  modIndex: 1,   snrDb: 30, sampleRate: 44 },
    psk:  { carrierFreq: 2000, msgFreq: 100,  modIndex: 1,   snrDb: 30, sampleRate: 44 },
    qam:  { carrierFreq: 3000, msgFreq: 100,  modIndex: 2,   snrDb: 35, sampleRate: 44 },
    pam:  { carrierFreq: 1000, msgFreq: 100,  modIndex: 1,   snrDb: 35, sampleRate: 44 },
    pwm:  { carrierFreq: 1000, msgFreq: 50,   modIndex: 1,   snrDb: 35, sampleRate: 44 },
    ppm:  { carrierFreq: 1000, msgFreq: 50,   modIndex: 1,   snrDb: 35, sampleRate: 44 },
    pcm:  { carrierFreq: 1000, msgFreq: 100,  modIndex: 1,   snrDb: 40, sampleRate: 44 },
    dsss: { carrierFreq: 2000, msgFreq: 100,  modIndex: 1,   snrDb: 5,  sampleRate: 44 },
    fhss: { carrierFreq: 2000, msgFreq: 100,  modIndex: 1,   snrDb: 10, sampleRate: 44 },
};

export const NURSERY_RHYMES = {
    twinkle: {
        name: 'Twinkle, Twinkle, Little Star',
        description: 'Classic lullaby with simple melody',
        frequencies: [262, 294, 330, 349, 392, 440, 494, 523],
        duration: 4
    },
    mary: {
        name: 'Mary Had a Little Lamb',
        description: 'Simple children\'s song',
        frequencies: [330, 294, 262, 294, 330, 330, 330],
        duration: 3.5
    },
    baa: {
        name: 'Baa, Baa, Black Sheep',
        description: 'Classic nursery rhyme',
        frequencies: [262, 262, 392, 392, 440, 440, 392],
        duration: 3
    },
    sine: {
        name: 'Pure Sine Wave',
        description: 'Simple 10 Hz test signal',
        frequencies: [10],
        duration: 0.1
    }
};

export const MODULATION_INFO = {
    am: {
        name: "Amplitude Modulation",
        abbreviation: "AM",
        description: "Encodes information by varying the amplitude (strength) of a carrier wave in proportion to the message signal. The frequency remains constant.",
        advantages: ["Simple to implement", "Low cost electronics", "Easy to detect"],
        disadvantages: ["Susceptible to amplitude noise", "Low efficiency (50% for AM broadcast)", "Requires wider bandwidth"],
        applications: ["AM radio broadcasting (0.5-1.6 MHz)", "Aviation VHF navigation aids"],
        bandwidth: "BW = 2 × fm (twice the message frequency)",
        efficiency: "~1 bps/Hz (up to 50% power efficiency at 100% modulation)",
        formula: "s(t) = [Ac + m(t)] × sin(2πfct)"
    },
    fm: {
        name: "Frequency Modulation",
        abbreviation: "FM",
        description: "Encodes information by varying the frequency of the carrier wave. Amplitude remains constant, providing better noise immunity than AM.",
        advantages: ["High noise immunity", "Better SNR performance", "Higher fidelity audio"],
        disadvantages: ["Requires wider bandwidth", "More complex circuitry", "Higher power consumption"],
        applications: ["FM radio broadcasting (88-108 MHz)", "Land mobile radio systems", "Microwave links"],
        bandwidth: "BW = 2(Δf + fm) = 2fm(β + 1), where β = Δf/fm (Carson's Rule)",
        efficiency: "~1-2 bps/Hz (trades bandwidth for noise immunity)",
        formula: "s(t) = Ac × sin(2πfct + β×sin(2πfmt))"
    },
    pm: {
        name: "Phase Modulation",
        abbreviation: "PM",
        description: "Encodes information by shifting the phase of the carrier wave. Related to FM but with instantaneous phase modulation instead of frequency modulation.",
        advantages: ["Good noise immunity", "Constant envelope", "Constant power transmission"],
        disadvantages: ["Phase ambiguity in demodulation", "Requires coherent detection", "Complex circuitry"],
        applications: ["Satellite communications", "Telemetry systems", "Phase-locked loops"],
        bandwidth: "BW = 2(Δφ + fm), similar to FM bandwidth",
        efficiency: "~1-2 bps/Hz (trades bandwidth for better performance)",
        formula: "s(t) = Ac × sin(2πfct + μ×m(t))"
    },
    ask: {
        name: "Amplitude Shift Keying",
        abbreviation: "ASK",
        description: "Digital modulation where data is transmitted by switching the amplitude of a carrier between two or more levels. Binary '1' = carrier on, '0' = carrier off.",
        advantages: ["Simple to implement", "Good bandwidth efficiency for low speeds", "Easy demodulation"],
        disadvantages: ["Sensitive to amplitude variations", "Poor noise performance", "Susceptible to fading"],
        applications: ["Fiber optic communications", "Wireless sensor networks", "FSK/ASK keying in industrial systems"],
        bandwidth: "BW = 2 × bit rate (for binary ASK)",
        efficiency: "1 bps/Hz (at minimum bandwidth)",
        formula: "s(t) = A×[0 or 1] × sin(2πfct)"
    },
    fsk: {
        name: "Frequency Shift Keying",
        abbreviation: "FSK",
        description: "Digital modulation where binary data is represented by two or more frequencies. Binary '1' uses frequency f1, '0' uses frequency f2.",
        advantages: ["Better noise immunity than ASK", "Simple demodulation with frequency discriminator", "Works well with non-linear amplifiers"],
        disadvantages: ["Wider bandwidth than ASK/PSK", "Requires frequency tracking", "More complex transmitter"],
        applications: ["Modems (early telephone systems)", "Frequency-hopping spread spectrum", "Emergency beacons (ELT/PLB)"],
        bandwidth: "BW ≈ 2 × (f2 - f1 + bit rate)",
        efficiency: "0.4-0.5 bps/Hz (trades bandwidth for robustness)",
        formula: "s(t) = A × sin(2π×[f1 or f2]×t)"
    },
    psk: {
        name: "Phase Shift Keying",
        abbreviation: "PSK",
        description: "Digital modulation where information is encoded by shifting the phase of the carrier. Most common: BPSK (2 phases) and QPSK (4 phases).",
        advantages: ["Bandwidth efficient", "Better power efficiency than FSK/ASK", "Coherent detection provides better SNR"],
        disadvantages: ["Requires coherent detection", "Sensitive to phase noise", "More complex demodulation"],
        applications: ["Satellite communications", "Deep space communications", "Wireless networks (WiFi, 4G/5G)"],
        bandwidth: "BW = 2 × bit rate (for BPSK, theoretically minimum)",
        efficiency: "1 bps/Hz (BPSK), 2 bps/Hz (QPSK)",
        formula: "BPSK: s(t) = A × sin(2πfct + [0 or π])"
    },
    qam: {
        name: "Quadrature Amplitude Modulation",
        abbreviation: "QAM",
        description: "Combines phase and amplitude modulation using two quadrature carriers (I and Q). 16-QAM uses 4 bits per symbol, 64-QAM uses 6 bits.",
        advantages: ["Very bandwidth efficient", "Higher spectral efficiency than PSK", "Excellent for modern wireless systems"],
        disadvantages: ["Sensitive to non-linear distortion", "Requires linear amplifiers", "Sensitive to phase/frequency errors"],
        applications: ["Digital television (DVB-T)", "4G/5G cellular networks", "WiFi (802.11a/g/n/ac/ax)"],
        bandwidth: "BW = bit rate / log2(M), where M = constellation size",
        efficiency: "2 bps/Hz (16-QAM), 3 bps/Hz (64-QAM), 4 bps/Hz (256-QAM)",
        formula: "s(t) = A[I×cos(2πfct) + Q×sin(2πfct)]"
    },
    pam: {
        name: "Pulse Amplitude Modulation",
        abbreviation: "PAM",
        description: "Information is encoded by varying the amplitude of regularly-timed pulses. The pulse repetition rate is twice the message bandwidth.",
        advantages: ["Simple to implement", "Easy to multiplex", "Low power consumption"],
        disadvantages: ["Sensitive to amplitude noise", "Requires careful timing recovery", "Limited distance"],
        applications: ["Telephony (PCM in T-carrier systems)", "Cable television (video transmission)", "Instrumentation"],
        bandwidth: "BW ≥ 2 × fsample (Nyquist sampling theorem)",
        efficiency: "1 bps/Hz (per amplitude level)",
        formula: "s(t) = m(nT) × p(t - nT), where p(t) is the pulse"
    },
    pwm: {
        name: "Pulse Width Modulation",
        abbreviation: "PWM",
        description: "Information is encoded by varying the duration (width) of regular pulses. The pulse frequency is constant, but width varies with message.",
        advantages: ["Efficient power transmission", "Simple demodulation with LPF", "No phase ambiguity"],
        disadvantages: ["Requires clock recovery", "Wider bandwidth than PAM", "Sensitive to duty cycle errors"],
        applications: ["Motor speed control", "Class D audio amplifiers", "Switching power supplies"],
        bandwidth: "BW ≈ 2 × fcarrier (much wider than PAM/PPM)",
        efficiency: "Lower spectral efficiency, but efficient power use",
        formula: "Duty cycle D = (1 + m(t))/2, where m(t) is normalized message"
    },
    ppm: {
        name: "Pulse Position Modulation",
        abbreviation: "PPM",
        description: "Information is encoded by shifting the position of pulses relative to a fixed reference time. Pulse width is constant.",
        advantages: ["Better noise immunity than PAM/PWM", "Constant energy per symbol", "Good for optical systems"],
        disadvantages: ["Requires precise timing", "Sensitive to timing jitter", "Complex synchronization"],
        applications: ["Optical communication (free-space laser)", "Infrared remote controls", "Low probability intercept systems"],
        bandwidth: "BW ≈ bit rate (more efficient than PWM)",
        efficiency: "Better than PWM, comparable to PAM",
        formula: "Pulse shifted by Δt ∝ m(t), constant pulse width"
    },
    pcm: {
        name: "Pulse Code Modulation",
        abbreviation: "PCM",
        description: "Message signal is sampled, quantized to discrete levels, and encoded as binary digits. Foundation for all digital communication systems.",
        advantages: ["Robust noise immunity", "Easy encryption", "Standard for digital telephony", "Excellent regeneration"],
        disadvantages: ["Requires high bandwidth", "Quantization noise", "Requires precise timing"],
        applications: ["Telephony (T-carrier, E-carrier)", "Digital audio (CD, DAT)", "Video/image transmission"],
        bandwidth: "BW = n × fs, where n = bits per sample, fs = sampling rate",
        efficiency: "n bps/Hz (n-bit samples)",
        formula: "Samples quantized to levels: 0 to 2^n - 1"
    },
    dsss: {
        name: "Direct Sequence Spread Spectrum",
        abbreviation: "DSSS",
        description: "Signal is spread over wide bandwidth using a pseudo-random (PN) sequence. Data bits are XORed with high-rate PN chips before transmission.",
        advantages: ["Excellent jamming resistance", "Low probability of intercept", "Multiple access (CDMA)", "Privacy"],
        disadvantages: ["Complex receiver", "Lower data rate efficiency", "Higher transmit power needed"],
        applications: ["Military communications", "GPS", "CDMA cellular networks (2G/3G)", "Secure military radar"],
        bandwidth: "BW = chip rate (much wider than data rate)",
        efficiency: "Lower than conventional, but better interference rejection",
        formula: "s(t) = d(t) × PN(t) × cos(2πfct)"
    },
    fhss: {
        name: "Frequency Hopping Spread Spectrum",
        abbreviation: "FHSS",
        description: "Carrier frequency changes (hops) rapidly according to a pseudo-random sequence. Each data bit or symbol uses a different frequency.",
        advantages: ["Frequency diversity", "Jamming avoidance", "Multiple access", "Low probability intercept"],
        disadvantages: ["Complex synchronization", "Requires frequency agility", "Hopping overhead reduces data rate"],
        applications: ["Military communications (Bluetooth uses civilian version)", "Frequency agile radars", "Anti-jamming systems"],
        bandwidth: "BW = hop bandwidth × number of hops",
        efficiency: "Lower data efficiency, but excellent spectrum sharing",
        formula: "Frequency = f0 + Δf × PN[n], where n = hop index"
    }
};
