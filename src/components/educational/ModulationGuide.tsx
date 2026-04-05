import React, { useState } from 'react';
import type { ModulationType } from '../../types/radio';
import { MODULATION_INFO } from '../../constants/modulationData';
import { Info, CheckCircle2, AlertTriangle, Radio, BookOpen, Lightbulb, GraduationCap, ChevronDown } from 'lucide-react';
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

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={type}
            className="flex flex-col gap-6 p-6 h-full overflow-y-auto bg-[#1a1a2e]/60 border-l border-[#00d4ff]/20 backdrop-blur-md"
        >
            <div className="flex items-center gap-3 border-b border-[#00d4ff]/20 pb-4">
                <div className="p-2 bg-[#00d4ff]/20 rounded-lg text-[#00d4ff]">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{info.name}</h2>
                    <span className="text-xs font-mono text-[#00d4ff]/80 tracking-widest uppercase">{info.abbreviation}</span>
                </div>
            </div>

            <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#00d4ff] italic uppercase tracking-tighter">
                    <Info size={16} /> Overview
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{info.description}</p>
            </section>

            <div className="grid grid-cols-1 gap-4">
                <section className="bg-[#00d4ff]/5 p-4 rounded-xl border border-[#00d4ff]/10">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#00d4ff] uppercase mb-2">
                        <CheckCircle2 size={14} /> Advantages
                    </h3>
                    <ul className="text-xs space-y-1 text-gray-400">
                        {info.advantages.map((a, i) => <li key={i}>• {a}</li>)}
                    </ul>
                </section>

                <section className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase mb-2">
                        <AlertTriangle size={14} /> Disadvantages
                    </h3>
                    <ul className="text-xs space-y-1 text-gray-400">
                        {info.disadvantages.map((d, i) => <li key={i}>• {d}</li>)}
                    </ul>
                </section>
            </div>

            <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-bold text-[#00d4ff] uppercase">
                    <Radio size={14} /> Practical Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                    {info.applications.map((app, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-300">
                            {app}
                        </span>
                    ))}
                </div>
            </section>

            <section className="p-4 bg-black/40 rounded-xl border border-[#00d4ff]/20 font-mono">
                <h3 className="text-[10px] text-[#00d4ff]/60 uppercase mb-2">Mathematical Model</h3>
                <div className="text-sm text-[#00d4ff] text-center py-2">{info.formula}</div>
            </section>

            {info.tips && info.tips.length > 0 && (
                <section className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                        <Lightbulb size={14} /> Parameter Guide &amp; Boundary Conditions
                    </h3>
                    <ul className="space-y-2">
                        {info.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 text-xs text-gray-300 leading-relaxed bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                                <span className="text-amber-400 mt-0.5 shrink-0">▸</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Simplified Explanation */}
            <section className="border border-[#00d4ff]/20 rounded-xl overflow-hidden">
                <button
                    onClick={() => setAudienceOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0a20] hover:bg-[#0a0a30] transition-colors"
                >
                    <span className="flex items-center gap-2 text-xs font-bold text-[#00d4ff] uppercase tracking-wide">
                        <GraduationCap size={14} /> Simplified Explanation
                    </span>
                    <ChevronDown
                        size={14}
                        className={`text-[#00d4ff]/60 transition-transform duration-200 ${audienceOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {audienceOpen && (() => {
                    const content = getAudienceContent(type, audienceLevel);
                    return (
                        <div className="bg-[#0a0a20]">
                            {/* Tabs */}
                            <div className="flex border-b border-[#00d4ff]/20">
                                {AUDIENCE_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setAudienceLevel(tab.id)}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                            audienceLevel === tab.id
                                                ? 'text-[#00d4ff] bg-[#00d4ff]/10 border-b-2 border-[#00d4ff]'
                                                : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {tab.emoji} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                                <p className="text-sm text-gray-300 leading-relaxed">{content.overview}</p>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-[#00d4ff]/70 tracking-wide">How it works:</p>
                                    <p className="text-xs text-gray-300 leading-relaxed">{content.howItWorks}</p>
                                </div>

                                {content.analogy && (
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 space-y-1">
                                        <p className="text-[10px] font-bold uppercase text-amber-400/80 tracking-wide">Analogy:</p>
                                        <p className="text-xs text-gray-300 leading-relaxed">{content.analogy}</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-[#00d4ff]/70 tracking-wide">Key points:</p>
                                    <ul className="space-y-1">
                                        {content.keyPoints.map((pt, i) => (
                                            <li key={i} className="flex gap-2 text-xs text-gray-300 leading-relaxed">
                                                <span className="text-[#00d4ff] shrink-0 mt-0.5">▸</span>
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
        </motion.div>
    );
};
