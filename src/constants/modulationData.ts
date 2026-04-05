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
        formula: "s(t) = [Ac + m(t)] × sin(2πfct)",
        tips: [
            "Carrier-to-message ratio: keep fc ≥ 10× fm (default fc=1000, fm=100). Too close causes sidebands to overlap the carrier.",
            "Modulation index β (0–1): β=0 = unmodulated carrier, β=1 = 100% modulation (envelope just touches zero), β>1 = over-modulation (envelope crosses zero, causing distortion).",
            "Best demo: β=0.8, fm=100 Hz. Reduce SNR below 20 dB to see amplitude noise degrade the demodulated signal.",
            "Envelope detector works because carrier amplitude = 1 + β·m(t) ≥ 0 when β ≤ 1."
        ]
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
        formula: "s(t) = Ac × sin(2πfct + β×sin(2πfmt))",
        tips: [
            "Deviation Δf = β × fm. At β=5, fm=100 Hz: Δf=500 Hz. Carrier (fc=2000) must be > fc + Δf = 2500 Hz — already satisfied.",
            "β < 1 = narrowband FM (similar bandwidth to AM). β = 5 = wideband FM (broadcast quality, much better noise immunity).",
            "Carson's rule: 98% of FM power fits within BW = 2(β+1)×fm. At β=5, fm=100 Hz: BW = 1200 Hz.",
            "Reduce SNR to 10 dB — FM still recovers the signal clearly. Try AM at the same SNR to see FM's noise advantage firsthand.",
            "FM threshold effect: below ~8 dB SNR, demodulation breaks suddenly (cliff-edge). Above threshold, FM outperforms AM."
        ]
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
        formula: "s(t) = Ac × sin(2πfct + μ×m(t))",
        tips: [
            "Phase deviation β is in radians. β=1 rad = moderate PM, β=2 rad = wideband PM with clearly visible phase swings.",
            "Boundary condition: keep β ≤ π (3.14 rad). Above π, the atan2 demodulator encounters phase wrapping and the recovered signal becomes distorted.",
            "Unlike FM, PM phase shift is proportional to message amplitude (not its integral). A square wave causes abrupt phase jumps.",
            "Best demo: β=1–2 with a sine wave message. Compare to FM — they look similar but PM has no frequency offset at message peaks."
        ]
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
        formula: "s(t) = A×[0 or 1] × sin(2πfct)",
        tips: [
            "This demo uses 16 random bits per frame. Bit rate ≈ 160 Hz; carrier (fc=2000) must be >> bit rate.",
            "OOK (On-Off Keying): bit 1 = full amplitude carrier, bit 0 = silence. The envelope directly reveals the data.",
            "Highly susceptible to amplitude noise. SNR < 15 dB causes frequent errors. Compare to PSK at the same SNR — PSK needs ~3 dB less for equal reliability.",
            "The threshold for '1 vs 0' detection is set at 50% of peak envelope. Fading channels make this unstable."
        ]
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
        formula: "s(t) = A × sin(2π×[f1 or f2]×t)",
        tips: [
            "Two tone frequencies: fH = fc+500 Hz (bit 1), fL = fc−500 Hz (bit 0). Separation = 1000 Hz >> bit rate ≈ 160 Hz.",
            "The dual-frequency correlator compares energy at fH vs fL per symbol to decide the bit — no amplitude threshold needed.",
            "Much more noise-robust than ASK in amplitude-varying channels. Try SNR=10 dB: FSK recovers, ASK struggles.",
            "Bandwidth is wider than PSK by the frequency deviation amount (2×500 Hz = 1000 Hz extra here)."
        ]
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
        formula: "BPSK: s(t) = A × sin(2πfct + [0 or π])",
        tips: [
            "BPSK: bit 1 → 0° phase (sin), bit 0 → 180° phase (−sin). The two states are antipodal — maximum distance in signal space.",
            "Coherent detection correlates with the reference sin(ωct). Phase ambiguity of 180° exists without differential encoding.",
            "Best bandwidth efficiency of binary modulations (same as minimum BW = bit rate). 3 dB more noise-tolerant than ASK.",
            "At SNR=20 dB, PSK decodes perfectly. Reduce to 8 dB to see occasional bit errors, then to 5 dB for frequent errors."
        ]
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
        formula: "s(t) = A[I×cos(2πfct) + Q×sin(2πfct)]",
        tips: [
            "16-QAM packs 4 bits per symbol: 2 bits for I-axis (±1/√10, ±3/√10) and 2 bits for Q-axis. Gray coded to minimize bit errors.",
            "With 16 bits per frame there are only 4 symbols — each decoded symbol = one step in the waveform display.",
            "Very noise-sensitive: SNR < 25 dB causes decision errors visible as constellation points drifting from their ideal grid positions.",
            "Watch the constellation plot: at high SNR you see tight clusters at the 16 grid points; at low SNR the clusters smear and overlap.",
            "Symbol rate = bit rate / 4. To carry 1 Mbit/s with 16-QAM only needs 250 kHz bandwidth."
        ]
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
        formula: "s(t) = m(nT) × p(t - nT)",
        tips: [
            "Pulse rate = 500 Hz (2ms period). Message frequency must be < 250 Hz (Nyquist limit). Violating this causes aliasing.",
            "Best demo: fm=50 Hz — yields 10 pulses per message cycle, giving a clearly visible staircase approximation.",
            "The demodulated output is a sample-and-hold staircase. Each step holds the pulse amplitude for one period.",
            "PAM is the first step of ADC: sample the signal. The next steps (quantize + encode) produce PCM.",
            "Reduce SNR to 15 dB to see how noise corrupts individual pulse amplitudes — each step becomes noisy."
        ]
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
        formula: "Duty cycle D = (1 + m(t))/2",
        tips: [
            "Duty cycle D = (m+1)/2: message m=+1 → D=100% (always high), m=0 → D=50% (square wave), m=−1 → D=0% (always low).",
            "Pulse rate = 500 Hz. Demodulate by counting the fraction of positive samples per period.",
            "Best demo: fm=50 Hz sine or triangle wave — shows smooth duty cycle variation across the pulse train.",
            "Try a square wave message to see abrupt duty cycle jumps between two fixed levels.",
            "Real PWM for motor control runs at 20 kHz+ so the motor inductance naturally low-pass filters it."
        ]
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
        formula: "Pulse shift Δt ∝ m(t)",
        tips: [
            "Pulse position within a 2ms frame: m=+1 → pulse near right end, m=−1 → pulse near left end, m=0 → pulse at center.",
            "The 5-sample pulse can be placed in the first 80% of the frame (spb×0.8 = 70 positions). This guards against end-of-frame clipping.",
            "Frame rate = 500 Hz. Best demo: fm=50 Hz — 10 pulses per message cycle gives clearly visible position variation.",
            "Noise shifts the detected pulse position, appearing as amplitude error. Reduce SNR to 15 dB to see jitter effects.",
            "Used in optical systems because photodetectors measure timing more accurately than amplitude."
        ]
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
        formula: "Samples quantized to 2^n levels",
        tips: [
            "4-bit PCM: 16 quantization levels. Step size = full range / 15 ≈ 0.133. Maximum quantization error ≈ ±0.067 (half a step).",
            "Word rate = 501 Hz (0.5ms per bit × 4 bits). Message must be < 250 Hz. Best demo: fm=50 Hz gives 10 words per message cycle.",
            "The modulated signal is a binary ±1 pulse stream. Each group of 4 pulses (88 samples total) encodes one quantized sample.",
            "Try a square wave at fm=50 Hz: each half-cycle gets ~5 PCM words, clearly tracking the transitions.",
            "Real PCM audio (CD) samples at 44.1 kHz with 16 bits: 65536 levels vs this demo's 16. This simplification illustrates the concept.",
            "Reduce SNR to 15 dB: the binary pulses may be misread, causing bit errors that produce large amplitude jumps in the decoded output."
        ]
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
        formula: "s(t) = d(t) × PN(t) × cos(2πfct)",
        tips: [
            "PN code = [1,1,1,−1,−1,1,−1] (7 chips per bit). Processing gain = 10·log10(7) ≈ 8.5 dB.",
            "The 8.5 dB processing gain means DSSS can recover data at SNR=5 dB where non-spread methods (ASK/FSK) would fail.",
            "The modulated signal appears as wideband noise to a receiver that does not know the PN code.",
            "Default SNR=5 dB is intentionally very noisy to demonstrate DSSS's jam-resistance. Compare: try AM at SNR=5 dB.",
            "CDMA uses orthogonal PN codes to let multiple users share the same frequency band simultaneously."
        ]
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
        formula: "Freq(t) = f0 + Δf × PN[n]",
        tips: [
            "4 hop frequencies: fc−600, fc−200, fc+200, fc+600 Hz, cycling each bit slot. Spread = 1200 Hz total.",
            "Bit is BPSK-encoded within the hop (phase encodes the bit, frequency encodes the hop slot).",
            "Default SNR=10 dB: shows that FHSS recovers while narrowband interference on one hop only affects 1/4 of bits.",
            "The receiver must know the exact hop sequence (synchronized PN key). Without it, the signal appears as random frequency bursts.",
            "Bluetooth uses 79 channels hopping 1600 times/second. This demo uses 4 channels to keep the hops visible in the time plot."
        ]
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
    pam:  { carrierFreq: 1000, msgFreq: 50,   modIndex: 1,   snrDb: 35, sampleRate: 44 },
    pwm:  { carrierFreq: 1000, msgFreq: 50,   modIndex: 1,   snrDb: 35, sampleRate: 44 },
    ppm:  { carrierFreq: 1000, msgFreq: 50,   modIndex: 1,   snrDb: 35, sampleRate: 44 },
    pcm:  { carrierFreq: 1000, msgFreq: 50,   modIndex: 1,   snrDb: 40, sampleRate: 44 },
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
