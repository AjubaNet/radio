import React, { useState, useEffect, useCallback } from 'react';
import type { ModulationType } from '../../types/radio';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';

type ViewMode = 'time' | 'spectrum' | 'chain' | 'waterfall' | 'eye';

interface DemoStep {
    title: string;
    narration: string;
    viewMode: ViewMode;
    mod?: ModulationType;
    audio?: 'carrier' | 'modulated' | 'demodulated';
    highlight?: string;
}

const DEMO_STEPS: DemoStep[] = [
    {
        title: "Overview: What Is Radio Modulation?",
        narration: "Radio modulation is the process of encoding information onto a carrier wave for transmission. The carrier wave is a high-frequency sine wave that can travel long distances through the air or cables. Without modulation, we couldn't transmit audio, video, or data wirelessly. Every radio station, WiFi signal, and cell phone uses some form of modulation.",
        viewMode: 'chain',
        highlight: "Look at the Chain view — you'll see the signal pipeline from left to right: Carrier → Message → Modulated → Ideal Recovery → Noisy Recovery."
    },
    {
        title: "Step 1: The Carrier Wave",
        narration: "The carrier wave is a pure, high-frequency sine wave. It's the 'vehicle' that will carry our information. By itself, a carrier wave carries no information — it just oscillates at a fixed frequency. We'll encode our message by changing one of its properties: amplitude, frequency, or phase.",
        viewMode: 'time',
        audio: 'carrier',
        highlight: "In Time view, look at the 'Transmitted Modulated Waveform' — this is what the carrier looks like after modulation."
    },
    {
        title: "Step 2: The Message Signal",
        narration: "The message signal is the information we want to transmit. It could be audio (voice or music), data bits, or any analog signal. Here we're using a sine wave as our message, but try switching to Square, Sawtooth, or Digital message types to see how they affect the modulated output.",
        viewMode: 'spectrum',
        highlight: "In Spectrum view, notice the spike at the message frequency. After modulation, this spike moves to appear as sidebands around the carrier frequency."
    },
    {
        title: "Step 3: Modulation — Encoding the Message",
        narration: "Modulation combines the carrier with the message. Depending on the technique: AM changes the carrier's amplitude, FM changes its frequency, PSK flips its phase. The modulated signal contains all the original message information, but now it rides on the carrier at the transmission frequency.",
        viewMode: 'spectrum',
        highlight: "In Spectrum view, you can see sidebands appearing around the carrier frequency — those are the encoded message components!"
    },
    {
        title: "Step 4: Channel Noise & Recovery",
        narration: "In the real world, signals pass through noisy channels. The orange 'Recovery Comparison' shows demodulation with noise, while the green 'Ideal Recovery' shows perfect channel conditions. The Correlation % tells you how faithfully the message was recovered. Higher SNR = better recovery. Try dragging the SNR slider down to see the signal degrade!",
        viewMode: 'time',
        audio: 'demodulated',
        highlight: "Compare the orange (noisy) and green (ideal) recovery signals. The Correlation % in the corner shows recovery quality."
    }
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onViewChange: (mode: ViewMode) => void;
    onPlayAudio?: (type: 'carrier' | 'modulated' | 'demodulated') => void;
}

export const DemoMode: React.FC<Props> = ({ isOpen, onClose, onViewChange, onPlayAudio }) => {
    const [step, setStep] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(8);

    const AUTO_ADVANCE_SECS = 8;

    const applyStep = useCallback((s: number) => {
        const demo = DEMO_STEPS[s];
        onViewChange(demo.viewMode);
        if (demo.audio && onPlayAudio) {
            setTimeout(() => onPlayAudio(demo.audio!), 300);
        }
        setSecondsLeft(AUTO_ADVANCE_SECS);
    }, [onViewChange, onPlayAudio]);

    const goToStep = useCallback((s: number) => {
        const clamped = Math.max(0, Math.min(DEMO_STEPS.length - 1, s));
        setStep(clamped);
        applyStep(clamped);
    }, [applyStep]);

    // Auto-advance timer
    useEffect(() => {
        if (!autoPlay || !isOpen) return;
        if (secondsLeft <= 0) {
            if (step < DEMO_STEPS.length - 1) {
                goToStep(step + 1);
            } else {
                setAutoPlay(false);
            }
            return;
        }
        const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [autoPlay, secondsLeft, step, isOpen, goToStep]);

    // Apply step on open
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            applyStep(0);
        }
    }, [isOpen, applyStep]);

    if (!isOpen) return null;

    const current = DEMO_STEPS[step];
    const progress = ((step) / (DEMO_STEPS.length - 1)) * 100;

    return (
        <div className="fixed bottom-0 left-80 right-96 z-40 p-4">
            <div className="bg-[#1a1a2e]/95 border border-[#00d4ff]/30 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-white/10">
                    <div className="h-full bg-[#00d4ff] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-[#00d4ff]/60 uppercase tracking-widest">
                                    Step {step + 1} / {DEMO_STEPS.length}
                                </span>
                                {autoPlay && (
                                    <span className="text-[10px] text-amber-400 font-mono">
                                        Auto-advancing in {secondsLeft}s
                                    </span>
                                )}
                            </div>
                            <h3 className="text-sm font-bold text-white leading-tight">{current.title}</h3>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Narration */}
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">{current.narration}</p>

                    {/* Highlight tip */}
                    {current.highlight && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                            <p className="text-[11px] text-amber-300">👁 {current.highlight}</p>
                        </div>
                    )}

                    {/* Step dots + navigation */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-1.5">
                            {DEMO_STEPS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToStep(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        i === step ? 'bg-[#00d4ff] scale-125' : 'bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAutoPlay(p => !p)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                    autoPlay
                                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                }`}
                            >
                                {autoPlay ? <Pause size={10} /> : <Play size={10} />}
                                {autoPlay ? 'Pause' : 'Auto'}
                            </button>
                            <button
                                onClick={() => goToStep(step - 1)}
                                disabled={step === 0}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => goToStep(step + 1)}
                                disabled={step === DEMO_STEPS.length - 1}
                                className="p-1.5 rounded-lg bg-[#00d4ff]/20 border border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#1a1a2e] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
