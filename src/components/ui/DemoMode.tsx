import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, X, Play, Pause } from 'lucide-react';

type ViewMode = 'time' | 'spectrum' | 'chain' | 'waterfall' | 'eye';

interface DemoStep {
    title: string;
    narration: string;
    viewMode: ViewMode;
    panelHighlight?: string;
    audio?: 'carrier' | 'modulated' | 'demodulated';
    tip?: string;
}

const DEMO_STEPS: DemoStep[] = [
    {
        title: "The Radio Signal Chain",
        narration: "Every radio communication follows the same pipeline: a carrier wave is generated, your message is encoded onto it (modulation), the signal travels through a noisy channel, and is decoded at the destination (demodulation).",
        viewMode: 'chain',
        tip: "Switch modulation types and watch all five panels update simultaneously."
    }
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onViewChange: (mode: ViewMode) => void;
    onPanelHighlight?: (panel: string | null) => void;
    onPlayAudio?: (type: 'carrier' | 'modulated' | 'demodulated') => void;
}

export const DemoMode: React.FC<Props> = ({ isOpen, onClose, onViewChange, onPanelHighlight, onPlayAudio }) => {
    const [step, setStep] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(10);

    const applyStep = useCallback((s: number) => {
        const demo = DEMO_STEPS[s];
        onViewChange(demo.viewMode);
        onPanelHighlight?.(demo.panelHighlight ?? null);
        if (demo.audio) {
            setTimeout(() => onPlayAudio?.(demo.audio!), 400);
        }
        setSecondsLeft(10);
    }, [onViewChange, onPanelHighlight, onPlayAudio]);

    const goToStep = useCallback((s: number) => {
        const clamped = Math.max(0, Math.min(DEMO_STEPS.length - 1, s));
        setStep(clamped);
        applyStep(clamped);
    }, [applyStep]);

    useEffect(() => {
        if (isOpen) {
            setStep(0); setAutoPlay(false); applyStep(0);
        } else {
            onPanelHighlight?.(null);
        }
    }, [isOpen, applyStep, onPanelHighlight]);

    useEffect(() => {
        if (!autoPlay || !isOpen) return;
        if (secondsLeft <= 0) {
            if (step < DEMO_STEPS.length - 1) goToStep(step + 1);
            else setAutoPlay(false);
            return;
        }
        const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [autoPlay, secondsLeft, step, isOpen, goToStep]);

    if (!isOpen) return null;

    const current = DEMO_STEPS[step] || DEMO_STEPS[0];
    const progress = (step / (DEMO_STEPS.length - 1)) * 100;

    return (
        <div className="fixed bottom-0 left-80 right-96 z-40 p-4 transition-all duration-300">
            <div className="border rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-colors duration-200"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-acc)' }}>
                <div className="h-1 bg-black/5">
                    <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                </div>

                <div className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                                    Step {step + 1} / {DEMO_STEPS.length}
                                </span>
                                {autoPlay && (
                                    <span className="text-[10px] text-amber-600 font-mono">→ next in {secondsLeft}s</span>
                                )}
                            </div>
                            <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-pri)' }}>{current.title}</h3>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
                            <X size={16} />
                        </button>
                    </div>

                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-sec)' }}>{current.narration}</p>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: 'var(--border-sub)' }}>
                        <div className="flex gap-1.5">
                            {DEMO_STEPS.map((_, i) => (
                                <button key={i} onClick={() => goToStep(i)} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'scale-125' : 'opacity-20 hover:opacity-40'}`}
                                    style={{ background: i === step ? 'var(--accent)' : 'var(--text-pri)' }} />
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setAutoPlay(!autoPlay)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                                style={{ 
                                    background: autoPlay ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)', 
                                    borderColor: autoPlay ? '#f59e0b' : 'var(--border-sub)', 
                                    color: autoPlay ? '#f59e0b' : 'var(--text-sec)' 
                                }}>
                                {autoPlay ? <Pause size={10} /> : <Play size={10} />}
                                {autoPlay ? 'Pause' : 'Auto'}
                            </button>
                            <button onClick={() => goToStep(step + 1)} disabled={step === DEMO_STEPS.length - 1} className="p-1.5 rounded-lg border transition-all disabled:opacity-30 shadow-sm"
                                style={{ background: 'var(--accent-soft)', borderColor: 'var(--border-acc)', color: 'var(--accent)' }}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
