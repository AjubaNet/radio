import React, { useState } from 'react';
import type { ModulationType } from '../../types/radio';
import { MODULATION_INFO } from '../../constants/modulationData';
import { Info, CheckCircle2, AlertTriangle, Radio, BookOpen, Lightbulb, GraduationCap, ChevronDown, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAudienceContent } from '../../constants/audienceContent';
import type { AudienceLevel } from '../../constants/audienceContent';

interface Props {
    type: ModulationType;
}

const AUDIENCE_TABS: { id: AudienceLevel; label: string; emoji: string }[] = [
    { id: 'school', label: 'Middle School', emoji: '🏫' },
    { id: 'high',   label: 'High School',   emoji: '📚' },
    { id: 'college', label: 'College',      emoji: '🎓' },
];

export const ModulationGuide: React.FC<Props> = ({ type }) => {
    const info = MODULATION_INFO[type];
    const [audienceOpen, setAudienceOpen] = useState(false);
    const [audienceLevel, setAudienceLevel] = useState<AudienceLevel>('high');
    const [realWorldOpen, setRealWorldOpen] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={type}
            className="flex flex-col gap-6 p-6 h-full overflow-y-auto border-l transition-colors duration-200"
            style={{ background: 'var(--bg-surface)', borderLeftColor: 'var(--border-sub)' }}
        >
            <div className="flex items-center gap-3 border-b pb-4 transition-colors duration-200" style={{ borderColor: 'var(--border-sub)' }}>
                <div className="p-2 rounded-lg transition-colors duration-200" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-pri)' }}>{info.name}</h2>
                    <span className="text-xs font-mono tracking-widest uppercase opacity-80" style={{ color: 'var(--accent)' }}>{info.abbreviation}</span>
                </div>
            </div>

            <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-bold italic uppercase tracking-tighter" style={{ color: 'var(--accent)' }}>
                    <Info size={16} /> Overview
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sec)' }}>{info.description}</p>
            </section>

            <div className="grid grid-cols-1 gap-4">
                <section className="p-4 rounded-xl border transition-colors duration-200" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}>
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase mb-2" style={{ color: 'var(--accent)' }}>
                        <CheckCircle2 size={14} /> Advantages
                    </h3>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--text-sec)' }}>
                        {info.advantages.map((a, i) => <li key={i}>• {a}</li>)}
                    </ul>
                </section>

                <section className="p-4 rounded-xl border border-red-500/20 transition-colors duration-200" style={{ background: 'var(--bg-card)' }}>
                    <h3 className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase mb-2">
                        <AlertTriangle size={14} /> Disadvantages
                    </h3>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--text-sec)' }}>
                        {info.disadvantages.map((d, i) => <li key={i}>• {d}</li>)}
                    </ul>
                </section>
            </div>

            <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase" style={{ color: 'var(--accent)' }}>
                    <Radio size={14} /> Practical Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                    {info.applications.map((app, i) => (
                        <span key={i} className="px-2 py-1 border rounded text-[10px] transition-colors duration-200" 
                            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-sub)', color: 'var(--text-sec)' }}>
                            {app}
                        </span>
                    ))}
                </div>
            </section>

            <section className="p-4 rounded-xl border font-mono transition-colors duration-200" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}>
                <h3 className="text-[10px] uppercase mb-2 opacity-60" style={{ color: 'var(--accent)' }}>Mathematical Model</h3>
                <div className="text-sm text-center py-2 font-bold" style={{ color: 'var(--accent)' }}>{info.formula}</div>
            </section>

            {info.tips && info.tips.length > 0 && (
                <section className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase">
                        <Lightbulb size={14} /> Parameter Guide
                    </h3>
                    <ul className="space-y-2">
                        {info.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 text-xs leading-relaxed border rounded-lg p-3 transition-colors duration-200" 
                                style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--text-sec)' }}>
                                <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Simplified Explanation */}
            <section className="border rounded-xl overflow-hidden transition-colors duration-200" style={{ borderColor: 'var(--border-sub)' }}>
                <button
                    onClick={() => setAudienceOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors"
                    style={{ background: 'var(--bg-panel)' }}
                >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
                        <GraduationCap size={14} /> Simplified Explanation
                    </span>
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${audienceOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--text-muted)' }}
                    />
                </button>

                {audienceOpen && (() => {
                    const content = getAudienceContent(type, audienceLevel);
                    return (
                        <div style={{ background: 'var(--bg-surface)' }}>
                            {/* Tabs */}
                            <div className="flex border-b" style={{ borderColor: 'var(--border-sub)' }}>
                                {AUDIENCE_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setAudienceLevel(tab.id)}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                            audienceLevel === tab.id
                                                ? 'border-b-2'
                                                : 'opacity-60 hover:opacity-100'
                                        }`}
                                        style={{ 
                                            color: audienceLevel === tab.id ? 'var(--accent)' : 'var(--text-sec)',
                                            borderColor: audienceLevel === tab.id ? 'var(--accent)' : 'transparent',
                                            background: audienceLevel === tab.id ? 'var(--bg-accent-sub)' : 'transparent'
                                        }}
                                    >
                                        {tab.emoji} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sec)' }}>{content.overview}</p>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wide opacity-70" style={{ color: 'var(--accent)' }}>How it works:</p>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sec)' }}>{content.howItWorks}</p>
                                </div>

                                {content.analogy && (
                                    <div className="border rounded-lg p-3 space-y-1 transition-colors duration-200" 
                                        style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                                        <p className="text-[10px] font-bold uppercase text-amber-600 tracking-wide">Analogy:</p>
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sec)' }}>{content.analogy}</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wide opacity-70" style={{ color: 'var(--accent)' }}>Key points:</p>
                                    <ul className="space-y-1">
                                        {content.keyPoints.map((pt, i) => (
                                            <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-sec)' }}>
                                                <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>▸</span>
                                                <span>{pt}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </section>

            {/* Real-World Context */}
            <section className="border border-purple-500/20 rounded-xl overflow-hidden transition-colors duration-200">
                <button
                    onClick={() => setRealWorldOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors"
                    style={{ background: 'var(--bg-panel)' }}
                >
                    <span className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wide">
                        <Wifi size={14} /> Real-World Context
                    </span>
                    <ChevronDown
                        size={14}
                        className={`text-purple-500/60 transition-transform duration-200 ${realWorldOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {realWorldOpen && (
                    <div className="p-4 space-y-3 transition-colors duration-200" style={{ background: 'var(--bg-surface)' }}>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sec)' }}>
                            Real radio systems add layers on top of modulation so the received signal is nearly perfect even in noisy channels. This lab shows modulation alone.
                        </p>
                        <ul className="space-y-2 text-xs" style={{ color: 'var(--text-sec)' }}>
                            <li className="flex gap-2 leading-relaxed"><span className="text-yellow-600 shrink-0">▸</span><span><strong className="text-yellow-600">FEC (Forward Error Correction):</strong> adds redundant bits so errors can be fixed without retransmitting. Reed-Solomon (GPS/CDs), Turbo (3G), LDPC (Wi-Fi 6, 5G).</span></li>
                            <li className="flex gap-2 leading-relaxed"><span className="text-blue-600 shrink-0">▸</span><span><strong className="text-blue-600">ARQ:</strong> receiver requests retransmission of corrupted frames. Used in Wi-Fi MAC, Bluetooth, TCP.</span></li>
                            <li className="flex gap-2 leading-relaxed"><span className="text-green-600 shrink-0">▸</span><span><strong className="text-green-600">Interleaving:</strong> scrambles bit order before TX so burst errors hit spread-out bits — FEC can then fix each one.</span></li>
                            <li className="flex gap-2 leading-relaxed"><span className="text-purple-600 shrink-0">▸</span><span><strong className="text-purple-600">OFDM:</strong> splits signal into thousands of narrow subcarriers (Wi-Fi, 4G LTE, 5G, DAB radio), each immune to multipath fading.</span></li>
                            <li className="flex gap-2 leading-relaxed"><span className="text-orange-600 shrink-0">▸</span><span><strong className="text-orange-600">MIMO:</strong> multiple TX/RX antennas multiply capacity proportionally. Wi-Fi 6 uses 8×8 MIMO; 5G uses massive MIMO (64+ antennas).</span></li>
                        </ul>
                    </div>
                )}
            </section>
        </motion.div>
    );
};
