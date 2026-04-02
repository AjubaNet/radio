import type { ModulationType, ModulationInfo } from '../types/radio';

export const MODULATION_INFO: Record<ModulationType, ModulationInfo> = {
    am: {
        name: "Amplitude Modulation",
        abbreviation: "AM",
        description: "Encodes information by varying the amplitude (strength) of a carrier wave in proportion to the message signal. The frequency remains constant. It was the first modulation method used for transmitting audio in radio broadcasting.",
        advantages: ["Simple to implement", "Low cost electronics", "Easy to detect with an envelope follower"],
        disadvantages: ["Susceptible to amplitude noise", "Low efficiency (50% for AM broadcast)", "Requires wider bandwidth than SSB"],
        applications: ["AM radio broadcasting (0.5-1.6 MHz)", "Aviation VHF navigation aids"],
        bandwidth: "BW = 2 × fm (twice the message frequency)",
        efficiency: "~1 bps/Hz (up to 50% power efficiency at 100% modulation)",
        formula: "s(t) = [Ac + m(t)] × sin(2πfct)"
    },
    fm: {
        name: "Frequency Modulation",
        abbreviation: "FM",
        description: "Encodes information by varying the frequency of the carrier wave. The amplitude remains constant, which provides excellent immunity to amplitude-based noise like lightning and engine interference.",
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
        description: "Encodes information by shifting the phase of the carrier wave. It is mathematically related to FM (FM is the integral of PM). PM is widely used in modern digital systems as the foundation for PSK.",
        advantages: ["Good noise immunity", "Constant envelope (efficient for non-linear amps)", "Constant power transmission"],
        disadvantages: ["Phase ambiguity in demodulation", "Requires coherent detection", "Complex circuitry"],
        applications: ["Satellite communications", "Telemetry systems", "Phase-locked loops"],
        bandwidth: "BW = 2(Δφ + fm), similar to FM bandwidth",
        efficiency: "~1-2 bps/Hz (trades bandwidth for better performance)",
        formula: "s(t) = Ac × sin(2πfct + μ×m(t))"
    },
    ask: {
        name: "Amplitude Shift Keying",
        abbreviation: "ASK",
        description: "Digital modulation where data is transmitted by switching the amplitude of a carrier between two or more levels. The simplest form is OOK (On-Off Keying).",
        advantages: ["Simple to implement", "Good bandwidth efficiency for low speeds", "Easy demodulation"],
        disadvantages: ["Sensitive to amplitude variations", "Poor noise performance", "Susceptible to fading"],
        applications: ["Fiber optic communications", "Wireless sensor networks", "Industrial remote controls"],
        bandwidth: "BW = 2 × bit rate (for binary ASK)",
        efficiency: "1 bps/Hz (at minimum bandwidth)",
        formula: "s(t) = A×[0 or 1] × sin(2πfct)"
    },
    fsk: {
        name: "Frequency Shift Keying",
        abbreviation: "FSK",
        description: "Digital modulation where binary data is represented by two or more distinct frequencies. It is very robust and was used in early computer modems.",
        advantages: ["Better noise immunity than ASK", "Simple demodulation with frequency discriminator", "Constant envelope signal"],
        disadvantages: ["Wider bandwidth than ASK/PSK", "Requires frequency tracking", "More complex transmitter than ASK"],
        applications: ["Modems (V.21, V.23)", "Frequency-hopping spread spectrum", "Caller ID", "Emergency beacons"],
        bandwidth: "BW ≈ 2 × (f2 - f1 + bit rate)",
        efficiency: "0.4-0.5 bps/Hz (trades bandwidth for robustness)",
        formula: "s(t) = A × sin(2π×[f1 or f2]×t)"
    },
    psk: {
        name: "Phase Shift Keying",
        abbreviation: "PSK",
        description: "Digital modulation where information is encoded by shifting the phase of the carrier. Most common forms are BPSK (2 phases) and QPSK (4 phases).",
        advantages: ["High bandwidth efficiency", "Better power efficiency than FSK", "Coherent detection provides high SNR"],
        disadvantages: ["Requires coherent detection", "Sensitive to phase noise", "More complex demodulation circuitry"],
        applications: ["Satellite communications", "WiFi (802.11b/g/n)", "4G/5G cellular networks"],
        bandwidth: "BW = 2 × bit rate (for BPSK)",
        efficiency: "1 bps/Hz (BPSK), 2 bps/Hz (QPSK)",
        formula: "BPSK: s(t) = A × sin(2πfct + [0 or π])"
    },
    qam: {
        name: "Quadrature Amplitude Modulation",
        abbreviation: "QAM",
        description: "Combines phase and amplitude modulation using two quadrature carriers. 16-QAM uses 4 bits per symbol, allowing for extremely high data rates in clean channels.",
        advantages: ["Very high bandwidth efficiency", "Industry standard for modern broadband", "Scalable (64-QAM, 256-QAM, etc.)"],
        disadvantages: ["Extremely sensitive to noise and non-linearity", "Requires linear amplifiers", "Complex IQ synchronization"],
        applications: ["Digital television (DVB-T)", "High-speed WiFi (802.11ac/ax)", "LTE/5G"],
        bandwidth: "BW = bit rate / log2(M)",
        efficiency: "2 bps/Hz (16-QAM), 4 bps/Hz (256-QAM)",
        formula: "s(t) = A[I×cos(2πfct) + Q×sin(2πfct)]"
    },
    pam: {
        name: "Pulse Amplitude Modulation",
        abbreviation: "PAM",
        description: "The amplitude of regularly timed pulses is varied in proportion to the message signal. It is the first step in converting an analog signal to digital (Sampling).",
        advantages: ["Simple to implement", "Baseband foundation for digital communications", "Easy to multiplex"],
        disadvantages: ["Sensitive to amplitude noise", "Requires precise pulse timing", "High bandwidth requirements"],
        applications: ["Ethernet (100Base-T, 1000Base-T)", "Internal digital signal paths", "Telephony"],
        bandwidth: "BW ≥ 2 × fsample (Nyquist sampling theorem)",
        efficiency: "1 bps/Hz (per amplitude level)",
        formula: "s(t) = m(nT) × p(t - nT)"
    },
    pwm: {
        name: "Pulse Width Modulation",
        abbreviation: "PWM",
        description: "The duration (width) of pulses is varied. Used heavily in power control and modern 'Class D' audio amplifiers because of its extreme power efficiency.",
        advantages: ["Extremely high power efficiency", "Simple demodulation (Low Pass Filter)", "High noise immunity"],
        disadvantages: ["Requires high switching frequency", "Generates significant EMI", "High bandwidth requirements"],
        applications: ["Motor speed control", "Class D audio amplifiers", "Switching power supplies"],
        bandwidth: "BW ≈ 2 × fcarrier",
        efficiency: "High power efficiency, lower spectral efficiency",
        formula: "Duty cycle D = (1 + m(t))/2"
    },
    ppm: {
        name: "Pulse Position Modulation",
        abbreviation: "PPM",
        description: "The position of a fixed-width pulse is shifted relative to a reference time. It is very efficient for optical systems where timing is easier to maintain than amplitude.",
        advantages: ["Better noise immunity than PAM/PWM", "Constant energy per symbol", "Highly power efficient"],
        disadvantages: ["Requires precise synchronization", "Sensitive to timing jitter", "Complex receiver clock recovery"],
        applications: ["Optical communication", "Infrared remote controls", "Radio-controlled models"],
        bandwidth: "BW ≈ bit rate",
        efficiency: "Better than PWM, comparable to PAM",
        formula: "Pulse shift Δt ∝ m(t)"
    },
    pcm: {
        name: "Pulse Code Modulation",
        abbreviation: "PCM",
        description: "The industry standard for digital audio. The signal is sampled, quantized to discrete levels, and then encoded into a stream of binary bits.",
        advantages: ["Perfect signal regeneration", "Robust against all noise types", "Easy to encrypt and compress"],
        disadvantages: ["Requires significant bandwidth", "Introduces quantization noise", "High complexity compared to PAM"],
        applications: ["CD Audio", "VOIP Telephony", "Digital recording"],
        bandwidth: "BW = n × fs (n=bits per sample, fs=sample rate)",
        efficiency: "n bps/Hz",
        formula: "Samples quantized to 2^n levels"
    },
    dsss: {
        name: "Direct Sequence Spread Spectrum",
        abbreviation: "DSSS",
        description: "The signal is spread over a wide bandwidth by XORing the data with a high-speed Pseudo-Random Noise (PN) code. This makes the signal look like noise to an unauthorized receiver.",
        advantages: ["Jamming resistance", "Low probability of intercept", "Multiple access (CDMA)"],
        disadvantages: ["Complex synchronization (PN code tracking)", "Requires wide bandwidth", "High processing power"],
        applications: ["GPS (Global Positioning System)", "2G/3G Cellular (CDMA)", "ZigBee"],
        bandwidth: "BW = chip rate (much wider than data rate)",
        efficiency: "Process gain G = chip_rate / data_rate",
        formula: "s(t) = d(t) × PN(t) × cos(2πfct)"
    },
    fhss: {
        name: "Frequency Hopping Spread Spectrum",
        abbreviation: "FHSS",
        description: "The carrier frequency 'hops' rapidly among many channels in a pseudo-random sequence known only to the transmitter and receiver.",
        advantages: ["Excellent interference avoidance", "Hard to intercept or jam", "High frequency diversity"],
        disadvantages: ["Requires fast frequency synthesizers", "Complexity in synchronization", "Hopping overhead"],
        applications: ["Bluetooth", "Military frequency-agile radio", "Legacy WiFi"],
        bandwidth: "BW = hop bandwidth × number of channels",
        efficiency: "Robustness over speed",
        formula: "Freq(t) = f0 + Δf × PN[n]"
    }
};

export const MODULATION_DEFAULTS: Record<ModulationType, any> = {
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
        frequencies: [262, 262, 392, 392, 440, 440, 392, 349, 349, 330, 330, 294, 294, 262],
        duration: 8
    },
    mary: {
        name: 'Mary Had a Little Lamb',
        frequencies: [330, 294, 262, 294, 330, 330, 330, 294, 294, 294, 330, 392, 392],
        duration: 7
    },
    baa: {
        name: 'Baa, Baa, Black Sheep',
        frequencies: [262, 262, 392, 392, 440, 440, 440, 440, 392],
        duration: 6
    }
};
