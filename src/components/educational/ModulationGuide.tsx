import React from 'react';
import type { ModulationType } from '../../types/radio';
import { MODULATION_INFO } from '../../constants/modulationData';
import { Info, CheckCircle2, AlertTriangle, Radio, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    type: ModulationType;
}

export const ModulationGuide: React.FC<Props> = ({ type }) => {
    const info = MODULATION_INFO[type];

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
        </motion.div>
    );
};
