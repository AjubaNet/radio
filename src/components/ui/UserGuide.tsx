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

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-[92vw] max-w-6xl mx-4 border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] transition-colors duration-200"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-pri)', borderColor: 'var(--border-acc)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 transition-colors duration-200" 
                    style={{ borderColor: 'var(--border-sub)', background: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-lg font-bold">RadioLab User Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-12 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="border rounded-xl p-6 space-y-4" style={sectionStyle}>
                            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Quick Start</h3>
                            <p className="text-sm leading-relaxed" style={textSec}>
                                Welcome to the Radio Modulation Lab. This tool lets you explore how signals are encoded, transmitted, and recovered. Use the left panel to change modulation types and observe the signal chain in real-time.
                            </p>
                        </section>
                        <section className="border rounded-xl p-6 space-y-4" style={sectionStyle}>
                            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Visualizations</h3>
                            <p className="text-sm leading-relaxed" style={textSec}>
                                Toggle between Time, Spectrum, and Chain views. Use mouse drag to pan and scroll wheel to zoom on any graph. The 'Sync' button links all time windows for comparison.
                            </p>
                        </section>
                    </div>
                    <p className="text-center text-xs italic" style={{ color: 'var(--text-muted)' }}>Scroll for deep technical documentation...</p>
                </div>
            </div>
        </div>
    );
};
