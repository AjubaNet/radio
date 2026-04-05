import React, { useState } from 'react';
import type { ModulationType } from '../../types/radio';
import { MODULATION_INFO } from '../../constants/modulationData';
import { X, GraduationCap, BookOpen, FlaskConical } from 'lucide-react';

type AudienceLevel = 'school' | 'high' | 'college';

interface AudienceContent {
    overview: string;
    howItWorks: string;
    analogy: string;
    keyPoints: string[];
}

function getAudienceContent(type: ModulationType, level: AudienceLevel): AudienceContent {
    const info = MODULATION_INFO[type];

    const school: Record<ModulationType, AudienceContent> = {
        am: {
            overview: "AM radio changes how loud (strong) the radio wave is to carry music or voice.",
            howItWorks: "Imagine waving your hand — the bigger the wave, the louder the sound. AM makes the radio wave bigger or smaller to match your voice.",
            analogy: "Like turning a dimmer switch up and down to signal messages with light brightness.",
            keyPoints: ["Used in old-time radio broadcasting", "Easy to tune in, but static-prone", "Your car radio below 1600 on the dial uses AM"]
        },
        fm: {
            overview: "FM radio squeezes and stretches the radio wave (changes its speed) to carry crystal-clear audio.",
            howItWorks: "Instead of changing how strong the wave is, FM changes how fast it wiggles back and forth. Fast wiggle = high note, slow wiggle = low note.",
            analogy: "Like stretching a slinky — squeeze it tight for one sound, spread it out for another.",
            keyPoints: ["Much clearer than AM — no static!", "Used for music stations (88–108 MHz)", "Works best over short distances"]
        },
        pm: { overview: "PM shifts the timing of the radio wave to carry information.", howItWorks: "The wave starts at a different point in its cycle depending on the message.", analogy: "Like shifting when you start clapping in a song — early or late clap encodes information.", keyPoints: ["Related to FM", "Used in some digital radios", "Changes timing, not speed or strength"] },
        ask: { overview: "ASK turns the carrier signal ON (for a 1 bit) or OFF (for a 0 bit).", howItWorks: "It's like Morse code — present signal = 1, no signal = 0.", analogy: "Flashing a flashlight: on = 1, off = 0.", keyPoints: ["Simple digital method", "Used in TV remotes", "Sensitive to interference"] },
        fsk: { overview: "FSK uses two different frequencies — one for '1' bits and one for '0' bits.", howItWorks: "High pitch = 1, low pitch = 0. The receiver listens for which pitch it hears.", analogy: "Like saying 'beep' for 1 and 'boop' for 0.", keyPoints: ["More reliable than ASK", "Used in old modems", "Two distinct tones"] },
        psk: { overview: "PSK flips the wave upside-down to signal a change between 1 and 0.", howItWorks: "When the bit changes, the wave suddenly jumps to its mirror image (180° flip).", analogy: "Like a coin — heads = 1, tails = 0, and you flip it for each bit.", keyPoints: ["Very efficient", "Used in WiFi and GPS", "Needs good timing to decode"] },
        qam: { overview: "QAM combines two signals to send 4 bits at once — like packing two lanes of data.", howItWorks: "Two waves (I and Q) each carry 2 bits by using 4 different amplitudes. Together they send 4 bits per symbol.", analogy: "Like two hands each showing 0–3 fingers — together they can show 0–15.", keyPoints: ["Very high data rate", "Used in cable TV and WiFi", "Needs clean signal to work"] },
        pam: { overview: "PAM samples your signal at regular moments and sends the height of each sample.", howItWorks: "Measure the signal every few milliseconds and send a pulse with that exact height.", analogy: "Taking snapshots of a wave every second — the height of each snapshot is the message.", keyPoints: ["Foundation of digital audio", "Like sampling for CDs", "More pulses = better quality"] },
        pwm: { overview: "PWM controls how long each pulse stays ON to encode the signal level.", howItWorks: "A strong signal makes a long ON pulse. A weak signal makes a short ON pulse.", analogy: "Like blinking a light — blink longer for bright, shorter for dim.", keyPoints: ["Used in motor speed control", "Very power-efficient", "Found in phone chargers"] },
        ppm: { overview: "PPM changes where (in time) each pulse appears to encode the signal.", howItWorks: "A pulse arriving early = one value; arriving late = another. Position = data.", analogy: "Like passing notes in class — early pass means yes, late pass means no.", keyPoints: ["Used in TV remotes", "Good at fighting noise", "Constant pulse energy"] },
        pcm: { overview: "PCM converts your signal into a stream of numbers and sends those numbers as pulses.", howItWorks: "Sample the signal, round to the nearest of 16 levels, then send 4 binary pulses (0 or 1) for each sample.", analogy: "Like describing a color using 4 paint buckets — each full or empty.", keyPoints: ["Foundation of CD audio", "Sends exact digital values", "Most noise-resistant of all pulse methods"] },
        dsss: { overview: "DSSS spreads one bit across 7 chips to hide the signal and resist jamming.", howItWorks: "Each bit is multiplied with a secret 7-chip code, spreading it across a wider frequency range.", analogy: "Like whispering a message across 7 people's shoulders — each hears a piece, together they reconstruct it.", keyPoints: ["Used in GPS and 3G phones", "Works through interference", "Looks like noise to outsiders"] },
        fhss: { overview: "FHSS hops between different frequencies really fast so jammers can't lock on.", howItWorks: "The signal jumps from one frequency to another following a secret pattern. Only the receiver knows the pattern.", analogy: "Like a secret game of musical chairs — both you and your friend know the order to sit in.", keyPoints: ["Used in Bluetooth", "Hard to intercept", "Immune to single-frequency interference"] }
    };

    const high: Record<ModulationType, AudienceContent> = {
        am: {
            overview: info.description,
            howItWorks: "The carrier wave amplitude is modulated: s(t) = [Ac + m(t)]·sin(2πfc·t). An envelope detector (diode + RC filter) recovers m(t) at the receiver.",
            analogy: "Carrier is a steady radio wave; message is like squeezing the wave proportionally.",
            keyPoints: ["Modulation index β = A_m/A_c; β=1 = 100% depth, β>1 = overmodulation", "Bandwidth = 2fm (double the audio frequency)", "Susceptible to amplitude noise — any interference directly corrupts the signal"]
        },
        fm: {
            overview: info.description,
            howItWorks: "The instantaneous frequency deviates from fc in proportion to m(t): s(t) = sin(2πfc·t + β·sin(2πfm·t)). FM demodulation uses a discriminator or PLL.",
            analogy: "Think of it as the speedometer of a car — message signal = how fast you press gas, carrier = the car's position.",
            keyPoints: ["Deviation ratio β = Δf/fm", "Carson's rule: BW = 2(β+1)·fm", "Noise immunity: +3dB SNR for every +1dB of SNR below threshold (capture effect)"]
        },
        pm: { overview: info.description, howItWorks: "Phase is shifted proportional to message amplitude: s(t) = sin(2πfc·t + β·m(t)). Demodulated with I/Q mixing and atan2.", analogy: "Like FM but the derivative is involved — message controls phase directly, not frequency.", keyPoints: ["Phase deviation β ≤ π to avoid wrapping", "Related to FM: PM of m(t) = FM of dm/dt", "Used in digital modems as BPSK/QPSK base"] },
        ask: { overview: info.description, howItWorks: "s(t) = A·bit·sin(2πfc·t). Receiver envelope-detects and threshold-compares. OOK (On-Off Keying) is a special case.", analogy: "", keyPoints: ["BER = Q(√SNR) — poor at low SNR", "Bandwidth = 2 × bit rate", "Simple hardware; used in RFID tags"] },
        fsk: { overview: info.description, howItWorks: "s(t) = sin(2π[fc ± Δf]·t). Receiver uses two bandpass filters centered at f1 and f2 and compares outputs.", analogy: "", keyPoints: ["BER = 0.5·exp(-SNR/2)", "BW = 2(Δf + bit_rate)", "Non-coherent detection possible; 3 dB worse than PSK"] },
        psk: { overview: info.description, howItWorks: "s(t) = sin(2πfc·t + π·bit). The two phases (0° and 180°) are antipodal, giving maximum separation. Coherent detection required.", analogy: "", keyPoints: ["BER = Q(√(2·SNR)) — best binary modulation", "BPSK: 1 bit/symbol; QPSK (4-PSK): 2 bits/symbol", "Used in GPS L1, CDMA2000, satellite comms"] },
        qam: { overview: info.description, howItWorks: "s(t) = I·cos(2πfc·t) − Q·sin(2πfc·t) where I,Q ∈ {±1/√10, ±3/√10} for 16-QAM. Gray coding minimizes bit errors.", analogy: "", keyPoints: ["16-QAM: 4 bits per symbol", "BER ≈ (3/8)·erfc(√(2SNR/5))", "Needs SNR > 25 dB; used in cable modems, WiFi 802.11a/g/n"] },
        pam: { overview: info.description, howItWorks: "Sample m(t) at rate fs > 2fm (Nyquist), hold each sample for one period. Demodulation: low-pass filter.", analogy: "", keyPoints: ["Nyquist criterion: sample rate > 2 × max message frequency", "Step 1 of PCM (sampling before quantization)", "Hold circuit creates staircase approximation"] },
        pwm: { overview: info.description, howItWorks: "Duty cycle D = (1 + m(t))/2. The pulse trains are integrated by a low-pass filter to recover m(t).", analogy: "", keyPoints: ["100% efficient for power control", "Used in Class-D amplifiers and DC motor drives", "Demod by counting the fraction of ON time per period"] },
        ppm: { overview: info.description, howItWorks: "Pulse position within a fixed-length frame is proportional to m(t). Receiver measures arrival time relative to frame start.", analogy: "", keyPoints: ["Constant envelope — each pulse has same energy", "Better noise immunity than PAM and PWM", "Used in infrared remotes and optical fiber links"] },
        pcm: { overview: info.description, howItWorks: "Quantize m(t) to 2^n levels, encode each level as n binary pulses. Decoder reconstructs levels from received bits.", analogy: "", keyPoints: ["4-bit quantization here: 16 levels, step size ≈ 0.133", "Quantization error ≤ step/2 = 0.067", "CD audio: 16-bit (65536 levels), 44.1 kHz — 96 dB dynamic range"] },
        dsss: { overview: info.description, howItWorks: "XOR data with a PN code (7-chip Barker code here). At receiver, correlate with same PN — signal adds coherently, noise averages out.", analogy: "", keyPoints: ["Processing gain = 10·log₁₀(chips/bit) = 8.5 dB", "Can operate at SNR < 0 dB", "GPS uses 1023-chip Gold codes; CDMA uses 128-chip Walsh codes"] },
        fhss: { overview: info.description, howItWorks: "Frequency synthesizer hops to f0 + Δf·PN[n] each symbol. Both TX and RX follow the same PN sequence. Each hop carries one BPSK symbol.", analogy: "", keyPoints: ["4 channels here; Bluetooth uses 79 channels at 1600 hops/sec", "Narrowband interference affects only 1/4 of symbols", "LPI (Low Probability of Intercept) — looks like wideband noise"] }
    };

    const college: Record<ModulationType, AudienceContent> = {
        am: {
            overview: `${info.description} In the frequency domain: S(f) = (Ac/2)[δ(f−fc) + δ(f+fc)] + (1/2)[M(f−fc) + M(f+fc)].`,
            howItWorks: "DSB-LC (Double Sideband Large Carrier). Efficiency η = P_sideband / P_total = β²/(2+β²). For β=1, η=33%. SSB removes one sideband, doubling efficiency but requiring carrier synchronization at receiver.",
            analogy: "",
            keyPoints: [`Modulation index: β = A_m/A_c. Envelope E(t) = Ac(1+β·m(t)) ≥ 0 requires β ≤ 1 for envelope detection`, `SNR_{demod} = β²S / (1 + β²S) where S = received SNR (baseband)`, `For DSB-SC: SNR = 2·SNR_channel — 3 dB gain over AM-LC`, `Spectral efficiency: 0.33 bits/Hz for AM-LC; 1 bit/Hz for SSB`]
        },
        fm: {
            overview: `${info.description} FM can be viewed as angle modulation: φ(t) = 2π·kf·∫m(τ)dτ.`,
            howItWorks: "Carson's rule: BT = 2(Δf + fm) = 2fm(β+1). Wideband FM (β>>1): BT ≈ 2Δf. Narrowband FM (β<<1): BT ≈ 2fm. Demodulator gain: SNR_FM = 3β²(β+1)·SNR_baseband. Discriminator: differentiate then envelope detect.",
            analogy: "",
            keyPoints: [`β = kf·Am/fm = Δf/fm; Δf = kf·Am (frequency deviation)`, `FM threshold: SNR > (β+1) required for capture effect`, `Wideband FM SNR improvement: 3β²(β+1)/2 relative to AM`, `Pre-emphasis τ=75μs (broadcast) or τ=50μs (European) flattens noise PSD`]
        },
        pm: { overview: `${info.description} Phase modulation φ(t) = β·m(t) where β = kp·Am is the phase deviation in radians.`, howItWorks: "PM and FM are duals: PM of m(t) ≡ FM of dm/dt. Demodulation: I/Q mixing then atan2(Q,I) yields φ(t). Phase unwrapping needed if β > π.", analogy: "", keyPoints: ["Phase deviation β ≤ π/2 for unambiguous atan2 demodulation", "Carson's rule for PM: BT = 2(β+1)·fm", "PM is the basis of BPSK/QPSK (β = 0 or π)", "Differential encoding avoids phase ambiguity: encode transitions, not absolute phases"] },
        ask: { overview: info.description, howItWorks: "OOK: s(t) = A·b(t)·cos(2πfc·t), b(t) ∈ {0,1}. Optimal receiver: matched filter (correlator) with threshold at A/2. BER = Q(√(Eb/N0)) = Q(√SNR).", analogy: "", keyPoints: ["Pe = Q(√(Eb/N0)) — requires 13.5 dB Eb/N0 for BER=10⁻⁶", "Matched filter maximizes SNR: h(t) = s(T-t), output at t=T", "Bandwidth (first null): B = 2Rb (double-sided) or Rb one-sided", "Non-coherent ASK: Pe = 0.5·exp(-SNR/2) — 3dB worse"] },
        fsk: { overview: info.description, howItWorks: "Noncoherent BFSK: two envelope detectors at f1, f2. Pe = 0.5·exp(-Eb/2N0). Coherent BFSK (orthogonal): Pe = Q(√(Eb/N0)). MSK (Minimum Shift Keying) uses Δf = Rb/2 for orthogonality.", analogy: "", keyPoints: ["Orthogonality: ∫s1(t)·s2(t)dt = 0 requires |f1-f2| ≥ Rb/2", "Non-coherent BER: 0.5·exp(-Eb/2N0) = Q(√SNR) for coherent", "MSK spectral efficiency: 1 bit/Hz, 99% power in BW = 0.5Rb", "GMSK (Bluetooth): Gaussian filter reduces sidelobe energy"] },
        psk: { overview: info.description, howItWorks: "BPSK: antipodal signaling, dmin = 2A. BER = Q(√(2Eb/N0)) — best possible for binary. QPSK: 2 bits/symbol, same BER per bit as BPSK but double spectral efficiency. 8-PSK: 3 bits/symbol.", analogy: "", keyPoints: ["BPSK BER = Q(√(2Eb/N0)); min Eb/N0 for BER=10⁻⁶: 10.5 dB", "QPSK: Es/N0 = 2Eb/N0 (same BER as BPSK per bit)", "Gray coding minimizes bit error probability for symbol errors", "Carrier phase synchronization required: Costas loop or pilot tone"] },
        qam: { overview: info.description, howItWorks: "Rectangular 16-QAM: {±1, ±3} × {±1, ±3} / √10 normalized. BER ≈ (3/2)·(1-1/√M)·erfc(√(3Eb/[(M-1)·2N0])). EVM = RMS(error vectors) / RMS(ideal points).", analogy: "", keyPoints: ["16-QAM: 4 bits/symbol, BER ≈ (3/8)·erfc(√(2SNR/5))", "Gray coding: adjacent points differ by 1 bit", "EVM < 3% for DVB-C; < 5% for LTE 64-QAM", "Dual-channel nature enables Hilbert transform analysis"] },
        pam: { overview: info.description, howItWorks: "Nyquist sampling theorem: fs ≥ 2W. Practical: raised cosine filter with excess bandwidth α. S/H introduces sinc(f/fs) roll-off in spectrum. Ideal reconstruction: m(t) = Σ m(nTs)·sinc((t-nTs)/Ts).", analogy: "", keyPoints: ["Nyquist rate: fs = 2W; common practice: fs = 2.5W–3W", "Aperture effect: held sample spreads spectrum by sinc(f/fs)", "ISI (Inter-Symbol Interference) avoided with Nyquist pulse shaping", "Multi-level PAM (PAM-4, PAM-8) used in 400G Ethernet"] },
        pwm: { overview: info.description, howItWorks: "Natural sampling: pulse width ∝ m(nTs). Spectrum contains m(t) components plus harmonics at nfs ± fm. LPF below fs recovers m(t). Power efficiency: 100% for ideal switches.", analogy: "", keyPoints: ["Switching frequency fs >> fm to ease LPF requirements", "Dead time needed between high/low transitions (shoot-through prevention)", "Delta-sigma modulation is a 1-bit quantized form of PWM", "THD (Total Harmonic Distortion) inversely proportional to fs/fm ratio"] },
        ppm: { overview: info.description, howItWorks: "In optical PPM: M-ary PPM sends log₂M bits per slot, pulse in one of M time slots. Spectral efficiency: log₂M/(M·Ts) bits/s/Hz. Optimal for photon-counting channels.", analogy: "", keyPoints: ["M-PPM bandwidth: B = M / (log₂M · Tb)", "Power efficiency improves with M: Eb/N0 → ln(2) as M→∞", "Synchronization critical: slot timing error → decoding failure", "Used in deep-space optical comms (Mars rovers)"] },
        pcm: { overview: info.description, howItWorks: "Uniform quantizer: Q levels, step Δ = 2A/(Q-1). Quantization noise: P_q = Δ²/12. SQNR = 6.02n + 1.76 dB for n-bit. Non-uniform (μ-law, A-law) quantization for speech.", analogy: "", keyPoints: ["SQNR = 6.02n + 1.76 dB for n bits; 4-bit → 25.8 dB, 16-bit → 98.1 dB", "μ-law: u(x) = sgn(x)·ln(1+μ|x|)/ln(1+μ), used in North America/Japan", "Line coding: NRZ, Manchester, 8B/10B encode bits for DC balance", "Bandwidth: 2n·fs (Nyquist for baseband) or n·fs with Nyquist shaping"] },
        dsss: { overview: info.description, howItWorks: "PN code c(t) with chip rate Rc = Nc·Rb. Spreading gain Gp = Rc/Rb = Nc chips/bit. Correlator: ∫r(t)c(t-τ)dt peaks at correct delay τ. Near-far problem solved by power control.", analogy: "", keyPoints: ["Processing gain: Gp = 10·log₁₀(Nc) = 10·log₁₀(7) = 8.5 dB here", "RAKE receiver: coherently combines multipath components", "Capacity: N simultaneous users if Gp >> N (CDMA)", "Gold codes: preferred PN sequences with three-valued cross-correlation"] },
        fhss: { overview: info.description, howItWorks: "Frequency synthesizer hops to fi = f0 + Δf·PN[i] each hop interval Th. Spread bandwidth Wss = N·Δf (N = number of hop channels). Jamming margin: JM = Gp - (Eb/N0)_min.", analogy: "", keyPoints: ["Slow FHSS: Th > Ts (multiple bits per hop); Fast FHSS: Th < Ts (multiple hops per bit)", "Jamming margin: JM = 10·log₁₀(Wss/W_data)", "IEEE 802.11 (original): 79 channels, 1 MHz spacing, 1600 hops/sec", "Frequency diversity: each hop occupies new portion of spectrum"] }
    };

    if (level === 'school') return school[type];
    if (level === 'high') return high[type];
    return college[type];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    modulation: ModulationType;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose, modulation }) => {
    const [level, setLevel] = useState<AudienceLevel>('high');

    if (!isOpen) return null;

    const content = getAudienceContent(modulation, level);
    const info = MODULATION_INFO[modulation];

    const levels: { id: AudienceLevel; label: string; icon: React.ReactNode; desc: string }[] = [
        { id: 'school', label: 'Middle School', icon: <BookOpen size={14} />, desc: 'Simple analogies' },
        { id: 'high', label: 'High School', icon: <GraduationCap size={14} />, desc: 'Technical concepts' },
        { id: 'college', label: 'College', icon: <FlaskConical size={14} />, desc: 'Math & theory' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[85vh] bg-[#1a1a2e] border border-[#00d4ff]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#00d4ff]/20 bg-[#00d4ff]/5">
                    <div>
                        <h2 className="text-lg font-bold text-white">{info.name} — How It Works</h2>
                        <p className="text-xs text-[#00d4ff]/60 mt-0.5">Select your level for a tailored explanation</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Audience selector */}
                <div className="flex gap-2 px-6 pt-4 pb-2">
                    {levels.map(l => (
                        <button
                            key={l.id}
                            onClick={() => setLevel(l.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                level === l.id
                                ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {l.icon} {l.label}
                            <span className={`text-[9px] font-normal hidden sm:inline ${level === l.id ? 'text-[#00d4ff]/70' : 'text-gray-600'}`}>
                                — {l.desc}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <section className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-[#00d4ff] tracking-wider">Overview</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">{content.overview}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-[#00d4ff] tracking-wider">How It Works</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">{content.howItWorks}</p>
                    </section>

                    {content.analogy && (
                        <section className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                            <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider mb-2">💡 Analogy</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">{content.analogy}</p>
                        </section>
                    )}

                    <section className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-[#00d4ff] tracking-wider">Key Points</h3>
                        <ul className="space-y-2">
                            {content.keyPoints.map((pt, i) => (
                                <li key={i} className="flex gap-2 text-sm text-gray-300 leading-relaxed">
                                    <span className="text-[#00d4ff] shrink-0 mt-0.5">▸</span>
                                    <span className={level === 'college' ? 'font-mono text-xs' : ''}>{pt}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-black/40 rounded-xl p-4 border border-[#00d4ff]/20">
                        <h3 className="text-[10px] text-[#00d4ff]/60 uppercase mb-2 font-bold tracking-wider">Formula</h3>
                        <div className="text-sm text-[#00d4ff] font-mono text-center">{info.formula}</div>
                    </section>
                </div>
            </div>
        </div>
    );
};
