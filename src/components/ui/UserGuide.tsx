import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const UserGuide: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const sectionStyle: React.CSSProperties = { background: 'var(--bg-card)', borderColor: 'var(--border-sub)' };
    const textSec: React.CSSProperties = { color: 'var(--text-sec)' };
    const rowBorder: React.CSSProperties = { borderColor: 'var(--border-sub)' };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-[92vw] max-w-6xl mx-4 border rounded-2xl shadow-2xl flex flex-col max-h-[92vh]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-pri)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-sub)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00d4ff]/10 rounded-lg text-[#00d4ff]">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-lg font-bold">RadioLab User Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6" style={textSec}>

                    {/* Section 1: Welcome */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Welcome</h3>
                        <p className="text-sm leading-relaxed">
                            RadioLab is an interactive radio modulation laboratory. Visualize, hear, and understand how information
                            travels wirelessly — from voice to WiFi, GPS to Bluetooth. Use the controls on the left to configure
                            your modulation experiment; observe results in the main visualization area.
                        </p>
                        <p className="text-sm leading-relaxed">
                            You can discover how a sine wave becomes a radio signal, how noise corrupts it, and how a demodulator
                            recovers the original information — all in real time. Every control change immediately recomputes the
                            entire chain so you see cause and effect instantly. Compare modulations side by side, listen to the
                            difference noise makes, and export your results as a PDF lab report.
                        </p>
                        <p className="text-sm leading-relaxed">
                            RadioLab is designed for <strong className="text-white">students</strong> encountering modulation for the
                            first time, <strong className="text-white">educators</strong> who want a live demo tool for lectures, and
                            <strong className="text-white"> engineers</strong> who want quick intuition about trade-offs without writing
                            code. Simplified Explanations in the right panel scale from middle-school analogies up to college-level
                            mathematics.
                        </p>
                    </section>

                    {/* Section 2: The Radio Chain */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">The Radio Chain</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#00d4ff]">
                            {['Source Signal', 'Modulator', 'Channel (noise)', 'Demodulator', 'Recovered Signal'].map((s, i, arr) => (
                                <React.Fragment key={s}>
                                    <span className="px-2 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded">{s}</span>
                                    {i < arr.length - 1 && <span className="text-gray-500">→</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <ul className="text-sm leading-relaxed space-y-3">
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Source Signal:</strong> The information you want to transmit — a voice, a bit stream, music, or sensor data. In this lab you choose from sine, square, sawtooth, triangle, noise, digital, or melody waveforms. This is the "message" signal, typically low frequency (audio-range).</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Modulator:</strong> Encodes the message onto a high-frequency carrier wave by varying the carrier's amplitude (AM), frequency (FM), or phase (PM/PSK). The modulated signal occupies a predictable frequency band centred on the carrier, making it suitable for antenna transmission.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Channel (noise):</strong> The real-world medium — air, cable, or fibre — always adds noise and distortion. This lab models it as Additive White Gaussian Noise (AWGN). The SNR slider lets you dial in from pristine (40 dB) to nearly unusable (&lt;5 dB).</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Demodulator:</strong> The mirror of the modulator. It removes the carrier and extracts the embedded message. The ideal demodulator assumes no noise; the noisy demodulator processes the noise-corrupted signal — showing you real-world degradation.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Output:</strong> The recovered signal, displayed alongside the original for direct comparison. The Correlation % metric quantifies how faithfully the message was recovered.</li>
                        </ul>
                        <p className="text-sm leading-relaxed">
                            <strong className="text-white">Why not just transmit baseband?</strong> Low-frequency signals (audio range) require
                            impractically large antennas (antenna length ≈ λ/4 = c/4f; at 1 kHz that's 75 km). Shifting to a carrier at,
                            say, 100 MHz makes the antenna just 75 cm. Higher frequencies also propagate better through the atmosphere
                            and can be focused by directional antennas.
                        </p>
                        <p className="text-sm leading-relaxed">
                            <strong className="text-white">Frequency Division Multiplexing (FDM):</strong> Because each station uses a
                            different carrier, many signals coexist in the spectrum simultaneously without colliding — exactly how AM/FM
                            radio, television, and cellular towers broadcast to millions of listeners in the same geographic area. The
                            radio receiver's tuner selects one carrier and rejects all others.
                        </p>
                    </section>

                    {/* Section 3: Left Sidebar Controls */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Left Sidebar — Controls</h3>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {[
                                    {
                                        name: 'Message Type',
                                        desc: (
                                            <span>Choose the information waveform to modulate:
                                                <ul className="mt-1 space-y-0.5 ml-2">
                                                    <li><strong className="text-white">Sine</strong> — single-frequency tone; the cleanest test signal. Produces two sidebands (f<sub>c</sub> ± f<sub>m</sub>) that are easy to identify in the spectrum view.</li>
                                                    <li><strong className="text-white">Square</strong> — rich in odd harmonics (3f, 5f, 7f…); stress-tests bandwidth requirements. A finite-bandwidth channel will round the edges.</li>
                                                    <li><strong className="text-white">Sawtooth</strong> — contains all harmonics; the hardest signal for bandwidth-limited channels. Good for demonstrating Gibbs phenomenon.</li>
                                                    <li><strong className="text-white">Triangle</strong> — softer than square; harmonic amplitudes decay as 1/n², so bandwidth needs are lower.</li>
                                                    <li><strong className="text-white">Noise</strong> — random Gaussian signal; reveals the noise floor and channel capacity limits.</li>
                                                    <li><strong className="text-white">Digital</strong> — binary ±1 NRZ pulse train at the selected bit rate. Use this for ASK, FSK, PSK, QAM, and spread-spectrum modulations so symbol boundaries are meaningful.</li>
                                                    <li><strong className="text-white">Melody</strong> — multi-note "Twinkle Twinkle" tune synthesized in real time. Hear how music survives (or doesn't) through different modulation and noise levels.</li>
                                                </ul>
                                            </span>
                                        )
                                    },
                                    {
                                        name: 'Category + Modulation',
                                        desc: (
                                            <span>
                                                Four families, each with distinct trade-offs:
                                                <ul className="mt-1 space-y-0.5 ml-2">
                                                    <li><strong className="text-white">Analog</strong> (AM, FM, PM) — continuous-value encoding; simple demodulators; naturally suited to audio. AM is simplest but worst noise immunity. FM provides 3–5 dB improvement over AM at the cost of extra bandwidth.</li>
                                                    <li><strong className="text-white">Digital</strong> (ASK, FSK, PSK, QPSK, 8PSK, 16QAM, 64QAM, PCM) — discrete symbols; exploits coding gain. Higher-order QAM packs more bits/symbol but requires higher SNR. PCM pulse-code-modulates the amplitude directly.</li>
                                                    <li><strong className="text-white">Pulse</strong> (PAM, PWM, PPM) — encodes information in pulse properties. PAM varies amplitude, PWM varies width, PPM varies position. All three require accurate timing recovery at the receiver.</li>
                                                    <li><strong className="text-white">Spread Spectrum</strong> (DSSS, FHSS) — deliberately spreads energy across a wide band. DSSS multiplies by a pseudorandom code (processing gain = 10 log₁₀(chips/bit) dB). FHSS rapidly hops carrier frequency, making it nearly impossible to jam or intercept without knowing the hop sequence. Both are used in GPS, Bluetooth, and Wi-Fi.</li>
                                                </ul>
                                            </span>
                                        )
                                    },
                                    {
                                        name: 'Carrier Frequency (Hz)',
                                        desc: 'The "radio station" frequency. Rule of thumb: carrier should be at least 10× the message frequency for AM/FM so sidebands are resolved clearly. In practice (radio, cellular) the carrier is millions of times higher than audio. Moving the carrier shifts the entire occupied band in the spectrum view.'
                                    },
                                    {
                                        name: 'Message Frequency (Hz)',
                                        desc: 'The fundamental pitch of the information signal. Nyquist: must be < sample rate / 2 or aliasing occurs. If you raise it above carrier / 10 in AM/FM, sidebands will start overlapping the carrier and distort. For digital message types, this has no effect — bit rate governs the signal instead.'
                                    },
                                    {
                                        name: 'Modulation Index (β or μ)',
                                        desc: 'Controls the "depth" of modulation: AM — μ: 0 = unmodulated, 0.5 = 50% depth, 1 = 100% (full modulation), >1 = overmodulation causing distortion and wasted sidebands. FM — β = Δf / f_m (deviation ratio); Carson\'s Rule bandwidth = 2(β + 1)f_m. Keep β < 5 for narrow-band FM. PM — β is peak phase deviation in radians. QAM/PSK — no index; constellation order determines bits per symbol.'
                                    },
                                    {
                                        name: 'Channel SNR (dB)',
                                        desc: 'Signal-to-Noise Ratio. Intuition: every 3 dB = 2× power ratio; every 10 dB = 10× power ratio. 40 dB = 10,000:1 (pristine); 20 dB = 100:1 (good); 10 dB = 10:1 (noisy); 3 dB = 2:1 (very noisy). Most analog modulations become unusable below 10 dB; DSSS can still recover at 0 dB or below due to spreading gain.'
                                    },
                                    {
                                        name: 'Bit Rate (bps)',
                                        desc: 'Digital/spread-spectrum only. Bits per second = symbol rate × bits per symbol. Shannon capacity: C = B log₂(1 + SNR), where B is bandwidth. You cannot exceed this rate without errors regardless of modulation scheme. Higher bit rate squeezes more symbols into the display window; if bit rate ≫ sample rate, symbols become indistinguishable.'
                                    },
                                    {
                                        name: 'Sample Rate (Hz)',
                                        desc: 'Nyquist–Shannon theorem: to perfectly reconstruct a signal of bandwidth B, you must sample at ≥ 2B samples/second. At 8 kHz (telephone quality) signals above 4 kHz are cut. At 44.1 kHz (CD quality) all audio up to 22 kHz is preserved. Lowering the sample rate in the lab will alias high-frequency content and degrade the displayed waveforms.'
                                    },
                                    {
                                        name: 'Deterministic Bits',
                                        desc: 'When ON, locks the pseudo-random bit pattern so every recalculation uses the same sequence — making results reproducible for demos and comparisons. When OFF, a new random pattern is drawn each update, adding randomness to BER estimates.'
                                    },
                                    {
                                        name: '⚡ Reset',
                                        desc: 'Reloads the recommended default parameters for the currently selected modulation type. Use this whenever a combination of settings produces unexpected results — it\'s the fastest way back to a known-good starting point.'
                                    },
                                ].map(row => (
                                    <tr key={row.name} className="border-b" style={rowBorder}>
                                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap align-top w-48">{row.name}</td>
                                        <td className="py-2 px-3 leading-relaxed" style={textSec}>{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Section 4: View Modes */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">View Modes</h3>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-2 px-3 text-left text-[#00d4ff]/80 font-bold">Tab</th>
                                    <th className="py-2 px-3 text-left text-[#00d4ff]/80 font-bold">What it shows &amp; what to look for</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    {
                                        tab: 'Time / Waveform',
                                        desc: 'Overlaid comparison of the original message, modulated signal, ideal recovery, and noisy recovery. Correlation % (top-right) tells you quantitatively how close ideal and noisy are. Try reducing SNR from 30 dB to 5 dB — watch the correlation drop. Zoom in with the range sliders to inspect individual symbol boundaries.'
                                    },
                                    {
                                        tab: 'Spectrum',
                                        desc: 'FFT magnitude plot. For AM with a sine message you\'ll see three spikes: carrier f_c, upper sideband f_c + f_m, and lower sideband f_c − f_m. Raise the modulation index to grow the sidebands. For FM, sidebands multiply (Bessel functions) and occupied bandwidth follows Carson\'s Rule: BW = 2(β + 1)f_m. Higher-order QAM shows a flat spectral lobe whose width equals the symbol rate.'
                                    },
                                    {
                                        tab: 'Chain',
                                        desc: 'All 5 stages stacked vertically: Carrier, Message, Modulated, Ideal Recovery, Noisy Recovery. Use the sync-zoom toggle to lock all panels to the same time window — invaluable for tracing how a single feature (a pulse edge, a frequency hop) propagates through the chain. Click ⓘ on any panel for a focused explanation.'
                                    },
                                    {
                                        tab: 'Waterfall',
                                        desc: 'Time-frequency spectrogram (frequency on x-axis, time scrolls down). FHSS appears as a series of diagonal or horizontal frequency hops — easy to spot. DSSS appears as a wide, uniform smear across the spectrum (the spreading effect). FM with high β shows a wide fuzzy band that narrows at low β. Great for classroom demonstrations of spread-spectrum techniques.'
                                    },
                                    {
                                        tab: 'Eye Diagram (digital)',
                                        desc: 'Overlays many symbol periods on top of each other. A wide open eye at the sampling instant means the receiver can reliably distinguish 0s from 1s. As SNR drops, the eye closes — trajectories blur toward the middle — and BER rises sharply. For multi-level modulations (16-QAM) multiple eye openings appear. Compare eye diagrams for QPSK vs 16-QAM at the same SNR to see the cost of higher spectral efficiency.'
                                    },
                                ].map(row => (
                                    <tr key={row.tab} className="border-b" style={rowBorder}>
                                        <td className="py-2 px-3 font-bold text-white align-top whitespace-nowrap w-36">{row.tab}</td>
                                        <td className="py-2 px-3 leading-relaxed" style={textSec}>{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click <span className="text-[#00d4ff]">ⓘ</span> on any panel header for a contextual explanation of that specific graph.</p>
                    </section>

                    {/* Section 5: Header Metrics Bar */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Header Metrics Bar</h3>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {[
                                    {
                                        name: 'SNR',
                                        desc: 'Signal-to-Noise Ratio in dB. Reflects the slider value. Formula: SNR_dB = 10 log₁₀(P_signal / P_noise). Typical values: 40 dB = excellent (fiber), 20 dB = good (Wi-Fi nearby), 10 dB = marginal (distant Wi-Fi), <5 dB = mostly noise.'
                                    },
                                    {
                                        name: 'Occupied BW',
                                        desc: 'Computed bandwidth. AM: 2f_m. FM (Carson\'s Rule): 2(β+1)f_m. DSSS: chip rate. QAM: symbol rate. This tells you how much spectrum your signal occupies — wider bandwidth costs more spectrum but can carry more data or provide noise immunity.'
                                    },
                                    {
                                        name: 'BER',
                                        desc: 'Theoretical Bit Error Rate at current SNR. Formulas: BPSK BER = Q(√(2 E_b/N_0)); 16-QAM BER ≈ (3/4)erfc(√(E_b/5N_0)). Typical targets: <10⁻³ (voice), <10⁻⁶ (data), <10⁻⁹ (storage). A 1 dB SNR improvement can halve the BER in the steep part of the BER curve.'
                                    },
                                    {
                                        name: 'Peak Power',
                                        desc: 'Maximum instantaneous signal amplitude in dBm. Formula: P_dBm = 10 log₁₀(P_mW). A peak power 3 dB above average means the waveform has a Peak-to-Average Power Ratio (PAPR) of 2 — important for amplifier design. OFDM and QAM have high PAPR; BPSK and FM have low PAPR.'
                                    },
                                    {
                                        name: 'Spectral Efficiency',
                                        desc: 'Bits/second per Hz of bandwidth. BPSK = 1 b/s/Hz; QPSK = 2 b/s/Hz; 16-QAM = 4 b/s/Hz; 64-QAM = 6 b/s/Hz; 256-QAM = 8 b/s/Hz. Shannon\'s limit sets the theoretical maximum for a given SNR. Degradation: if spectral efficiency approaches the Shannon limit, BER rises sharply with any small SNR drop.'
                                    },
                                    {
                                        name: 'EVM',
                                        desc: 'Error Vector Magnitude (QAM only). Measures the RMS distance between actual and ideal constellation points as a percentage of the ideal symbol distance. Formula: EVM% = (RMS error / RMS ideal) × 100. Typical limits: 16-QAM ≤ 12.5%, 64-QAM ≤ 8%, 256-QAM ≤ 3.5%. High EVM indicates noise, phase noise, or IQ imbalance.'
                                    },
                                ].map(row => (
                                    <tr key={row.name} className="border-b" style={rowBorder}>
                                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap align-top w-36">{row.name}</td>
                                        <td className="py-2 px-3 leading-relaxed" style={textSec}>{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Section 6: Header Buttons */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Header Buttons</h3>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {[
                                    {
                                        name: '📈 BER Curves',
                                        desc: 'Opens a modal comparing all 13 modulation types on a single BER vs E_b/N_0 chart. Each curve shows how quickly that modulation\'s error rate drops as SNR improves. A red dot marks your current operating point. Use this to decide which modulation gives the best BER for your target SNR without switching between views.'
                                    },
                                    {
                                        name: '▶ Demo',
                                        desc: 'Launches a 6-stage guided auto-advancing walkthrough. Each stage selects a preset configuration and highlights a specific concept: (1) clean AM, (2) AM with noise, (3) FM vs AM noise comparison, (4) digital PSK, (5) spread spectrum DSSS, (6) high-order QAM. Narrated text explains what to observe at each step. Ideal for classroom projection.'
                                    },
                                    {
                                        name: 'TX Signal',
                                        desc: 'Plays the modulated (transmitted) signal through your browser\'s audio output using the Web Audio API. Listen for the carrier tone for AM/FM, or the distinct data bursts for digital modulations. Use headphones for best results — you can actually hear the difference between AM and FM modulation.'
                                    },
                                    {
                                        name: 'RX Recovery',
                                        desc: 'Plays the demodulated (recovered) signal. At high SNR it sounds very close to the TX signal. As you lower SNR and press RX Recovery again, you\'ll hear noise artifacts, clicks, or distortion depending on the modulation type. The difference is most dramatic comparing FM (degrades gracefully) vs AM (degrades noisily).'
                                    },
                                    {
                                        name: '🎵 Melody',
                                        desc: 'Plays the Original, TX-modulated, and RX-recovered versions of a melody (Twinkle Twinkle Little Star) sequentially so you can hear all three back-to-back. Buttons are labelled Original / TX / RX. Great for demonstrating to a non-technical audience that yes, the "original tune" survives the radio chain — but noise changes the listening experience.'
                                    },
                                    {
                                        name: '☀ / 🌙 Theme',
                                        desc: 'Toggles between dark and light mode. All CSS variables update instantly; all charts, panels, and modals respect the theme. The theme is stored in local storage so it persists between sessions.'
                                    },
                                    {
                                        name: '🔗 Sync Time Window',
                                        desc: 'When active, the zoom and pan range of every waveform panel is locked together. Scrubbing one panel moves all others simultaneously — essential when you want to correlate the modulated signal with the noisy recovery at the exact same time instant.'
                                    },
                                ].map(row => (
                                    <tr key={row.name} className="border-b" style={rowBorder}>
                                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap align-top w-44">{row.name}</td>
                                        <td className="py-2 px-3 leading-relaxed" style={textSec}>{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Section 7: Export & Share */}
                    <section className="border rounded-xl p-4 space-y-2" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Export &amp; Share</h3>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">WAV exports:</strong> Save audio files of the modulated, message, or demodulated signal. WAV files are uncompressed 16-bit PCM at the selected sample rate. Load them into Audacity (free, open-source) to view the waveform, zoom into individual cycles, apply FFT analysis, or compare channels. MATLAB users can use audioread() to import and run their own analysis scripts.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">PDF Report:</strong> Generates a fully formatted academic lab report containing: title page with timestamp, all current parameters (carrier, message freq, SNR, modulation index, bit rate), computed metrics (BER, bandwidth, spectral efficiency, EVM), modulation theory section with formulas, and the key plots embedded as images. Suitable for submission as a lab assignment or teaching handout.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Copy Parameters:</strong> Copies the current complete settings as a JSON string to the clipboard. Share with colleagues so they can paste it back in (via the Load Parameters option) and reproduce your exact experiment — same modulation, same SNR, same message type, everything.</li>
                        </ul>
                    </section>

                    {/* Section 8: Right Panel — Modulation Guide */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Right Panel — Modulation Guide</h3>
                        <p className="text-sm leading-relaxed">
                            The right sidebar is a context-sensitive encyclopedia for the active modulation. It updates automatically when you switch modulation types. Each guide contains the following tabs/sections:
                        </p>
                        <ul className="text-sm leading-relaxed space-y-2">
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Overview:</strong> One-paragraph plain-English explanation of what the modulation does and why it exists.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Advantages / Disadvantages:</strong> Bullet lists in green/red panels. Covers noise immunity, bandwidth efficiency, hardware complexity, and typical deployment contexts.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Applications:</strong> Real-world deployments as tag chips — e.g., "Wi-Fi 5", "GPS L1", "FM Radio", "CDMA 2000".</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Formula:</strong> The mathematical signal model in a monospaced display. For AM: s(t) = [1 + μ·m(t)] cos(2πf_c·t). For FM: s(t) = A cos(2πf_c·t + 2πβ ∫m(τ)dτ).</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Parameter Tips:</strong> Amber-highlighted boundary conditions for the controls — e.g., what happens to FM when β exceeds 5, or why QAM needs SNR &gt; 20 dB.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Simplified Explanation (collapsible):</strong> Three audience tabs — Middle School (analogy-based), High School (conceptual with light maths), College (full signal-processing treatment). Choose your level and expand to get the right explanation depth.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Real-World Context (collapsible):</strong> Explains FEC, ARQ, interleaving, OFDM, and MIMO — the layers real radio systems add on top of raw modulation to achieve near-perfect recovery even in terrible channels.</li>
                        </ul>
                    </section>

                    {/* Section 9: Suggested Workflows */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Suggested Workflows</h3>
                        <ol className="text-sm leading-relaxed space-y-3 list-none">
                            {[
                                {
                                    title: 'First-time user',
                                    steps: 'Select AM → observe Time view → reduce SNR to 10 dB → watch recovery diverge → switch to Spectrum view → open BER Curves.'
                                },
                                {
                                    title: 'Noise immunity comparison',
                                    steps: 'Try AM vs FM at SNR = 15 dB → compare Correlation % in the Recovery panel. Note FM degrades far more gracefully than AM.'
                                },
                                {
                                    title: 'Digital deep-dive',
                                    steps: 'Switch to PSK → go to Eye Diagram → lower SNR to 5 dB → watch eye close → open BER Curves to compare PSK vs ASK. Notice PSK\'s eye stays open much longer.'
                                },
                                {
                                    title: 'DSSS noise resilience',
                                    steps: 'Set DSSS at SNR = 5 dB — signal recovers. Set AM at SNR = 5 dB — it fails. Compare Chain views. The 10 dB spreading gain of DSSS is visible in the chain stages.'
                                },
                                {
                                    title: 'Classroom demo',
                                    steps: 'Click the Demo button → auto-advances through 6 stages showing key modulation concepts. Works well on a projector — no interaction needed from the audience.'
                                },
                                {
                                    title: 'Lab report',
                                    steps: 'Set your modulation and parameters → click Export → PDF Report — generates a formatted academic report with all metrics and theory ready for submission.'
                                },
                                {
                                    title: 'Audio through radio',
                                    steps: 'Select Melody as Message Type → choose AM → play Chain view while listening to Melody → switch to FM at the same SNR (15 dB) → compare recovery quality. FM audio will sound noticeably cleaner even at the same noise level.'
                                },
                                {
                                    title: 'Full spectrum analysis',
                                    steps: 'Switch to Spectrum view → step through all 13 modulations using the dropdown → note how each family occupies bandwidth differently. Analog signals show distinct sidebands; QAM/PSK shows a rectangular lobe; DSSS shows a wide smear; FHSS shows a jumping spike.'
                                },
                            ].map((wf, i) => (
                                <li key={wf.title} className="flex gap-3">
                                    <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-[#00d4ff]/20 text-[#00d4ff] text-[10px] font-bold mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span>
                                        <strong className="text-white">{wf.title}:</strong>{' '}
                                        {wf.steps}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* Section 10: Why Real Radio Works Better */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Why Real Radio Works Better Than This Lab</h3>
                        <p className="text-xs leading-relaxed" style={textSec}>
                            In this simulator, you'll notice demodulated signals often don't perfectly match the original — especially at low SNR. Real-world radio systems layer several techniques on top of modulation to achieve near-perfect recovery even in terrible channels:
                        </p>

                        <div className="space-y-2">
                            <div className="bg-black/30 rounded-lg p-3 space-y-1">
                                <p className="text-[11px] font-bold text-yellow-400">🔒 Forward Error Correction (FEC)</p>
                                <p className="text-xs leading-relaxed" style={textSec}>Adds redundant bits before transmission so the receiver can detect and fix errors without retransmitting. Types: <span className="text-white">Hamming codes</span> (Wi-Fi legacy, simple single-bit correction), <span className="text-white">Reed-Solomon</span> (GPS, CDs, DVDs — corrects burst errors), <span className="text-white">Turbo Codes</span> (3G/CDMA — near Shannon limit), <span className="text-white">LDPC</span> (Wi-Fi 802.11n/ac/ax, 5G NR — very efficient, approaches Shannon limit within 0.1 dB).</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 space-y-1">
                                <p className="text-[11px] font-bold text-blue-400">🔄 ARQ — Automatic Repeat reQuest</p>
                                <p className="text-xs leading-relaxed" style={textSec}>If the receiver detects an uncorrectable error, it sends a NAK (negative acknowledgement) and the transmitter resends. Used in Wi-Fi MAC layer, Bluetooth, and TCP/IP. Stop-and-wait ARQ is simple; Go-Back-N and Selective Repeat are more efficient for high-latency links.</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 space-y-1">
                                <p className="text-[11px] font-bold text-green-400">🔀 Interleaving</p>
                                <p className="text-xs leading-relaxed" style={textSec}>Scrambles the bit order before transmission. A burst of noise (fading) hits consecutive bits — but after de-interleaving at the receiver, those damaged bits are spread far apart, making them individually correctable by the FEC code. Critical for mobile communications where signal fading creates burst errors.</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 space-y-1">
                                <p className="text-[11px] font-bold text-purple-400">📡 OFDM — Orthogonal Frequency Division Multiplexing</p>
                                <p className="text-xs leading-relaxed" style={textSec}>Splits the signal into thousands of narrow subcarriers (Wi-Fi, 4G LTE, 5G NR, DAB radio), each too narrow to experience frequency-selective fading. The subcarriers are mathematically orthogonal — they don't interfere with each other even though their spectra overlap. A <strong className="text-white">cyclic prefix (guard interval)</strong> — a copy of the end of each OFDM symbol prepended to its beginning — absorbs multipath echoes, eliminating inter-symbol interference as long as the echo delay is shorter than the guard interval.</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 space-y-1">
                                <p className="text-[11px] font-bold text-orange-400">📶 Diversity Techniques &amp; MIMO</p>
                                <p className="text-xs leading-relaxed" style={textSec}>Multiple independent paths for the same signal: <span className="text-white">Spatial diversity (MIMO)</span> — multiple antennas at TX and RX multiply capacity proportional to min(N_tx, N_rx). Wi-Fi 6 uses 8×8 MIMO; 5G uses massive MIMO with 64+ antennas. <span className="text-white">Frequency diversity</span> — FHSS hops so only some hops are affected by a narrowband fade. <span className="text-white">Time diversity</span> — ARQ retransmits when the first attempt failed.</p>
                            </div>
                        </div>

                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-1 px-2 text-[#00d4ff] font-bold">System</th>
                                        <th className="text-left py-1 px-2 text-[#00d4ff] font-bold">Modulation</th>
                                        <th className="text-left py-1 px-2 text-[#00d4ff] font-bold">Error Correction</th>
                                        <th className="text-left py-1 px-2 text-[#00d4ff] font-bold">Channel Technique</th>
                                    </tr>
                                </thead>
                                <tbody style={textSec}>
                                    {[
                                        ['Wi-Fi (802.11ax)', 'OFDM + 1024-QAM', 'LDPC', 'MIMO, beamforming'],
                                        ['Bluetooth 5', 'GFSK / FHSS', 'FEC + ARQ', '79-channel hopping'],
                                        ['4G LTE', 'OFDM + 64-QAM', 'Turbo codes', 'MIMO, ICIC'],
                                        ['5G NR', 'OFDM + 256-QAM', 'LDPC + Polar', 'Massive MIMO'],
                                        ['GPS L1', 'DSSS / BPSK', 'Reed-Solomon + Viterbi', 'Spread spectrum'],
                                        ['Digital Radio (DAB)', 'OFDM + QPSK', 'Convolutional + RS', 'OFDM guard interval'],
                                        ['FM Radio', 'FM (analog)', '(None — analog)', 'Pre-emphasis filter'],
                                    ].map(([sys, mod, ecc, ch]) => (
                                        <tr key={sys} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                            <td className="py-1.5 px-2 font-bold text-white">{sys}</td>
                                            <td className="py-1.5 px-2 text-[#00d4ff]/80">{mod}</td>
                                            <td className="py-1.5 px-2 text-green-400/80">{ecc}</td>
                                            <td className="py-1.5 px-2 text-purple-300/80">{ch}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
                            This lab demonstrates modulation/demodulation in isolation. Real systems combine all of the above to achieve extremely low BER (10⁻⁶ to 10⁻¹²) in practice.
                        </p>
                    </section>

                    {/* Section 11: Common Mistakes & Fixes */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Common Mistakes &amp; Fixes</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-2 px-3 text-[#00d4ff]/80 font-bold">Problem</th>
                                        <th className="text-left py-2 px-3 text-[#00d4ff]/80 font-bold">Likely Cause</th>
                                        <th className="text-left py-2 px-3 text-[#00d4ff]/80 font-bold">Fix</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            problem: "Ideal Recovery doesn't match message",
                                            cause: 'Wrong carrier freq or modulation index for the selected modulation',
                                            fix: 'Click ⚡ Reset Defaults to restore recommended parameters'
                                        },
                                        {
                                            problem: 'Noisy Recovery is completely flat',
                                            cause: 'SNR too low (< 5 dB) — signal is buried in noise',
                                            fix: 'Raise SNR slider above 15 dB and observe recovery improve'
                                        },
                                        {
                                            problem: 'Digital message looks like a sine wave',
                                            cause: 'Message Type was set to Sine instead of Digital',
                                            fix: 'Select Digital from Message Type — this produces the correct ±1 NRZ bit stream'
                                        },
                                        {
                                            problem: 'FM/PM demodulation looks distorted',
                                            cause: 'Modulation index β is too high, causing excessive frequency deviation',
                                            fix: 'Keep β < 5 for FM (Carson\'s Rule); reduce to β = 1–2 for narrow-band FM'
                                        },
                                        {
                                            problem: 'QAM shows random-looking recovery',
                                            cause: 'numBits not a multiple of 4 (16-QAM needs groups of 4 bits)',
                                            fix: 'Click ⚡ Reset; QAM automatically enforces correct bit grouping'
                                        },
                                        {
                                            problem: 'Waterfall shows nothing interesting',
                                            cause: 'Not enough spectral change over time (static sine, low β FM)',
                                            fix: 'Switch to FHSS (shows clear hops) or FM with β > 3 (shows wide spread)'
                                        },
                                    ].map(row => (
                                        <tr key={row.problem} className="border-b" style={rowBorder}>
                                            <td className="py-2 px-3 text-red-300 align-top">{row.problem}</td>
                                            <td className="py-2 px-3 align-top" style={textSec}>{row.cause}</td>
                                            <td className="py-2 px-3 text-green-300 align-top">{row.fix}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 12: Glossary */}
                    <section className="border rounded-xl p-4 space-y-3" style={sectionStyle}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Glossary</h3>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {[
                                    { term: 'Bandwidth', def: 'The range of frequencies a signal occupies or a channel can carry. Measured in Hz. Wider bandwidth = more data capacity but occupies more spectrum.' },
                                    { term: 'Baseband', def: 'A signal whose frequency range starts near 0 Hz — the original, unmodulated information signal (e.g., audio from a microphone). Not suitable for direct wireless transmission.' },
                                    { term: 'BER', def: 'Bit Error Rate. The fraction of received bits that are incorrect. BER = errors / total bits. A BER of 10⁻⁶ means 1 error per million bits.' },
                                    { term: 'Carrier', def: 'A high-frequency sinusoidal wave used as the "vehicle" for the information signal. The modulator encodes the message by modifying the carrier\'s amplitude, frequency, or phase.' },
                                    { term: "Carson's Rule", def: "Approximation for FM bandwidth: BW = 2(β + 1) × f_m, where β is the modulation index and f_m is the message frequency. Captures ~98% of the signal's power." },
                                    { term: 'Channel', def: 'The physical medium (air, cable, fibre) between transmitter and receiver, modelled here as AWGN (Additive White Gaussian Noise). Real channels also cause fading and multipath.' },
                                    { term: 'Demodulation', def: 'The process of extracting the original message from a modulated carrier signal. The demodulator is the mathematical inverse of the modulator.' },
                                    { term: 'FEC', def: 'Forward Error Correction. Redundant bits added before transmission that allow the receiver to detect and fix errors without retransmission. Examples: Hamming, Reed-Solomon, Turbo, LDPC.' },
                                    { term: 'FHSS', def: 'Frequency-Hopping Spread Spectrum. The carrier hops rapidly between frequencies according to a pseudorandom sequence known to both TX and RX. Used in Bluetooth and military radios for interference immunity.' },
                                    { term: 'ISI', def: 'Inter-Symbol Interference. When a symbol spreads into adjacent time slots, corrupting neighbouring symbols. Caused by multipath or insufficient channel bandwidth. OFDM guard intervals mitigate ISI.' },
                                    { term: 'LDPC', def: 'Low-Density Parity-Check codes. A near-Shannon-limit FEC code used in Wi-Fi 802.11n/ac/ax and 5G NR. Operates within 0.1 dB of the Shannon limit at practical block lengths.' },
                                    { term: 'Modulation Index', def: 'A dimensionless parameter controlling modulation depth. AM: μ (0–1 for linear, >1 overmodulated). FM: β = Δf / f_m. PM: β = peak phase deviation in radians.' },
                                    { term: 'Nyquist Theorem', def: 'To reconstruct a band-limited signal of maximum frequency f_max, you must sample at ≥ 2·f_max samples/second. Sampling below this rate causes aliasing — high-frequency components fold back as false low-frequency artefacts.' },
                                    { term: 'OFDM', def: 'Orthogonal Frequency Division Multiplexing. Divides the channel into many narrow orthogonal subcarriers, each carrying a low-rate symbol. Resilient to frequency-selective fading; used in Wi-Fi, 4G LTE, 5G, and DAB radio.' },
                                    { term: 'QAM', def: 'Quadrature Amplitude Modulation. Encodes bits by varying both amplitude and phase of two orthogonal carriers (I and Q). 16-QAM = 4 bits/symbol, 64-QAM = 6 bits/symbol, 256-QAM = 8 bits/symbol.' },
                                    { term: 'Shannon Limit', def: 'Maximum achievable data rate for a channel with bandwidth B and SNR: C = B log₂(1 + SNR) bits/second. No coding scheme can exceed this. The gap between practical and Shannon-limit performance is the "coding gap".' },
                                    { term: 'Sideband', def: 'Frequency components created by modulation that appear above and below the carrier frequency. AM with a single-tone message produces exactly two sidebands at f_c ± f_m. FM produces Bessel-function-weighted sidebands at f_c ± n·f_m.' },
                                    { term: 'SNR', def: 'Signal-to-Noise Ratio. SNR_dB = 10 log₁₀(P_signal / P_noise). Every 3 dB doubles the power ratio; every 10 dB multiplies it by 10. Higher SNR → lower BER → more reliable reception.' },
                                    { term: 'Symbol Rate', def: 'The number of distinct modulation states (symbols) transmitted per second, measured in baud. Bit rate = symbol rate × log₂(M), where M is the constellation size. 16-QAM at 1000 baud = 4000 bps.' },
                                ].map(row => (
                                    <tr key={row.term} className="border-b" style={rowBorder}>
                                        <td className="py-2 px-3 font-bold text-[#00d4ff] whitespace-nowrap align-top w-40">{row.term}</td>
                                        <td className="py-2 px-3 leading-relaxed" style={textSec}>{row.def}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                </div>
            </div>
        </div>
    );
};
