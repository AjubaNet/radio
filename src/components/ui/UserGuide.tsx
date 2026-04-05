import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const UserGuide: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-3xl mx-4 bg-[#0a0a1e] border border-[#00d4ff]/20 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#00d4ff]/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00d4ff]/10 rounded-lg text-[#00d4ff]">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">RadioLab User Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 text-gray-300">

                    {/* Section 1: Welcome */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Welcome</h3>
                        <p className="text-sm leading-relaxed">
                            RadioLab is an interactive radio modulation laboratory. Visualize, hear, and understand how information
                            travels wirelessly — from voice to WiFi, GPS to Bluetooth. Use the controls on the left to configure
                            your modulation experiment; observe results in the main visualization area.
                        </p>
                    </section>

                    {/* Section 2: The Radio Chain */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">The Radio Chain</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#00d4ff]">
                            {['Source Signal', 'Modulator', 'Channel (noise)', 'Demodulator', 'Recovered Signal'].map((s, i, arr) => (
                                <React.Fragment key={s}>
                                    <span className="px-2 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded">{s}</span>
                                    {i < arr.length - 1 && <span className="text-gray-500">→</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <ul className="text-sm leading-relaxed space-y-1">
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Why a carrier?</strong> Baseband signals attenuate quickly over distance; shifting to a high carrier frequency allows long-range transmission.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">What modulation does:</strong> Encodes message information onto the carrier by varying its amplitude (AM), frequency (FM), or phase (PM/PSK).</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Multiple stations:</strong> Each station uses a different carrier frequency so they coexist without interference.</li>
                        </ul>
                    </section>

                    {/* Section 3: Left Sidebar Controls */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Left Sidebar — Controls</h3>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {[
                                    {
                                        name: 'Message Type',
                                        desc: 'Sine/Square/Sawtooth/Triangle/Noise/Digital — what each waveform represents as the information source. Digital generates a binary bit stream for digital and spread-spectrum modulations.'
                                    },
                                    {
                                        name: 'Category + Modulation',
                                        desc: '4 families: Analog (AM/FM/PM), Digital (ASK/FSK/PSK/QAM/PCM), Pulse (PAM/PWM/PPM), Spread Spectrum (DSSS/FHSS).'
                                    },
                                    {
                                        name: 'Carrier Frequency (Hz)',
                                        desc: 'The "radio station" frequency. Must be >> message frequency for meaningful modulation; determines which spectrum band is occupied.'
                                    },
                                    {
                                        name: 'Message Frequency (Hz)',
                                        desc: 'The information rate; for audio this is pitch. Nyquist criterion: must be < carrier/2 for proper modulation.'
                                    },
                                    {
                                        name: 'Modulation Index (β or μ)',
                                        desc: 'AM: 0 = unmodulated, 1 = 100% depth, >1 = overmodulation/distortion. FM: β × fm = frequency deviation in Hz. PM: phase deviation in radians.'
                                    },
                                    {
                                        name: 'Channel SNR (dB)',
                                        desc: 'Signal-to-Noise Ratio. 30+ dB = clean channel, 15–30 dB = light noise, <10 dB = very noisy. Watch recovery degrade below 15 dB for most modulations.'
                                    },
                                    {
                                        name: 'Bit Rate (bps)',
                                        desc: '(Digital/spread only) Bits per second. Higher bit rate = more symbols per second = more bandwidth required. Should be matched to sample rate for proper symbol detection.'
                                    },
                                    {
                                        name: 'Sample Rate (Hz)',
                                        desc: 'Nyquist theorem — must be ≥ 2× the highest signal frequency. Lower rates (8 kHz) can alias high-frequency content.'
                                    },
                                    {
                                        name: 'Deterministic Bits',
                                        desc: 'When ON, locks the pseudo-random bit pattern so every recalculation uses the same bits — useful for reproducible demos and comparisons.'
                                    },
                                    {
                                        name: '⚡ Reset',
                                        desc: 'Reloads the recommended default parameters for the currently selected modulation type.'
                                    },
                                ].map(row => (
                                    <tr key={row.name} className="border-b border-white/5">
                                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap align-top w-44">{row.name}</td>
                                        <td className="py-2 px-3 text-gray-300 leading-relaxed">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Section 4: View Modes */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">View Modes</h3>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-2 px-3 text-left text-[#00d4ff]/80 font-bold">Tab</th>
                                    <th className="py-2 px-3 text-left text-[#00d4ff]/80 font-bold">What it shows</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { tab: 'Time', desc: 'Modulated waveform + recovery comparison + ideal recovery. Use zoom/pan to inspect symbols.' },
                                    { tab: 'Spectrum', desc: 'FFT showing carrier spike and sidebands. Widen modulation index to spread sidebands.' },
                                    { tab: 'Chain', desc: 'All 5 stages: Carrier → Message → Modulated → Ideal → Noisy recovery. Sync zoom across all panels.' },
                                    { tab: 'Waterfall', desc: 'Time-frequency spectrogram. FHSS shows hopping lines; DSSS shows a wide smear.' },
                                    { tab: 'Eye (digital)', desc: 'Symbol period overlays. Wide open eye = reliable decoding; closing eye = high BER.' },
                                ].map(row => (
                                    <tr key={row.tab} className="border-b border-white/5">
                                        <td className="py-2 px-3 font-bold text-white align-top whitespace-nowrap">{row.tab}</td>
                                        <td className="py-2 px-3 text-gray-300 leading-relaxed">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-400">Click <span className="text-[#00d4ff]">ⓘ</span> on any panel header for a contextual explanation of that specific graph.</p>
                    </section>

                    {/* Section 5: Header Metrics Bar */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Header Metrics Bar</h3>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {[
                                    { name: 'SNR', desc: 'Signal-to-Noise Ratio you set via slider.' },
                                    { name: 'Occupied BW', desc: "Bandwidth computed from Carson's Rule or modulation formula." },
                                    { name: 'BER', desc: 'Theoretical bit error rate at current SNR — lower is better.' },
                                    { name: 'Peak Power', desc: 'Maximum signal amplitude in dBm.' },
                                    { name: 'Spectral Efficiency', desc: 'Bits transmitted per Hz of bandwidth.' },
                                    { name: 'EVM', desc: 'Error Vector Magnitude for QAM — deviation of constellation points from ideal positions; lower = better.' },
                                ].map(row => (
                                    <tr key={row.name} className="border-b border-white/5">
                                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap align-top w-36">{row.name}</td>
                                        <td className="py-2 px-3 text-gray-300 leading-relaxed">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Section 6: Header Buttons */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Header Buttons</h3>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {[
                                    { name: '📈 BER Curves', desc: 'Compare all 13 modulation types on one performance graph. Red dot = your current operating point.' },
                                    { name: '▶ Demo', desc: '5-step guided auto-advancing walkthrough narrated for newcomers.' },
                                    { name: 'TX Signal', desc: 'Play the modulated (transmitted) signal through your speaker.' },
                                    { name: 'RX Recovery', desc: 'Play the demodulated (recovered) signal through your speaker.' },
                                    { name: '🎵 Play Demo Song', desc: 'Runs a nursery rhyme melody through the modulation chain — hear noise artifacts!' },
                                    { name: '🔗 Sync Time Window', desc: 'Lock zoom/pan across all waveform panels simultaneously.' },
                                ].map(row => (
                                    <tr key={row.name} className="border-b border-white/5">
                                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap align-top w-36">{row.name}</td>
                                        <td className="py-2 px-3 text-gray-300 leading-relaxed">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Section 7: Export & Share */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Export &amp; Share</h3>
                        <ul className="text-sm leading-relaxed space-y-1">
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">WAV exports:</strong> Save audio files of the modulated, message, or demodulated signal for external analysis in Audacity or MATLAB.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">PDF Report:</strong> Generates an academic lab report with all parameters, metrics, formulas, and modulation theory.</li>
                            <li><span className="text-[#00d4ff]">▸</span> <strong className="text-white">Copy Parameters:</strong> Copies current settings as JSON for sharing or reproducing an exact experiment.</li>
                        </ul>
                    </section>

                    {/* Section 8: Right Panel — Modulation Guide */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Right Panel — Modulation Guide</h3>
                        <p className="text-sm leading-relaxed">
                            The right sidebar explains the currently active modulation type in depth: Overview, Advantages/Disadvantages,
                            Applications, Formula, and Parameter Tips.
                        </p>
                        <p className="text-sm leading-relaxed">
                            The <strong className="text-white">Simplified Explanation</strong> section at the bottom provides three audience levels
                            (Middle School / High School / College) that explain the same concept at different depths.
                            Toggle the section open and choose your audience level.
                        </p>
                    </section>

                    {/* Section 9: Suggested Workflows */}
                    <section className="bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Suggested Workflows</h3>
                        <ol className="text-sm leading-relaxed space-y-3 list-none">
                            {[
                                {
                                    title: 'First-time user',
                                    steps: 'Select AM → observe Time view → reduce SNR to 10 dB → watch recovery diverge → switch to Spectrum view → open BER Curves.'
                                },
                                {
                                    title: 'Noise immunity comparison',
                                    steps: 'Try AM vs FM at SNR=15 dB → compare Correlation % in the Recovery panel.'
                                },
                                {
                                    title: 'Digital deep-dive',
                                    steps: 'Switch to PSK → go to Eye Diagram → lower SNR to 5 dB → watch eye close → open BER Curves to compare PSK vs ASK.'
                                },
                                {
                                    title: 'DSSS noise resilience',
                                    steps: 'Set DSSS at SNR=5 dB — signal recovers. Set AM at SNR=5 dB — it fails. Compare Chain views.'
                                },
                                {
                                    title: 'Classroom demo',
                                    steps: 'Click the Demo button → auto-advances through 5 steps showing modulation concepts.'
                                },
                                {
                                    title: 'Lab report',
                                    steps: 'Set your modulation and parameters → click Export → PDF Report — generates a formatted academic report.'
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

                </div>
            </div>
        </div>
    );
};
