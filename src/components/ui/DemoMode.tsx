import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';

type ViewMode = 'time' | 'spectrum' | 'chain' | 'waterfall' | 'eye';

interface DemoStep {
    title: string;
    narration: string;
    viewMode: ViewMode;
    audio?: 'carrier' | 'modulated' | 'demodulated';
    highlight?: string;
}

const DEMO_STEPS: DemoStep[] = [
    {
        title: "Overview: What Is Radio Modulation?",
        narration: "Radio modulation encodes information onto a carrier wave for wireless transmission. Every radio station, WiFi signal, and cell phone uses modulation. Without it, baseband signals (voice, data) couldn't travel through the air — they'd interfere with each other and fade quickly.",
        viewMode: 'chain',
        highlight: "Chain view shows the full pipeline: Carrier → Message → Modulated → Ideal Recovery → Noisy Recovery. Each step is a transformation."
    },
    {
        title: "Step 1: The Carrier Wave",
        narration: "The carrier is a pure high-frequency sine wave — the 'vehicle' for your data. It oscillates thousands of times per second, allowing it to propagate as a radio wave. A carrier by itself carries no information; it's a blank slate waiting for modulation to imprint a message on it.",
        viewMode: 'time',
        audio: 'carrier',
        highlight: "In Time view, you're seeing the modulated waveform. Notice how the carrier shape changes depending on which modulation type is active."
    },
    {
        title: "Step 2: The Message Signal",
        narration: "The message signal is the information to transmit — voice, music, or data bits. Here we use a sine wave as a simple example. The message frequency must be much lower than the carrier frequency, ensuring the sidebands don't overlap. Try changing the Message Type to see how different waveforms look when modulated.",
        viewMode: 'spectrum',
        highlight: "Spectrum view: the spike at message frequency shows the information signal. After modulation, this energy moves to sidebands around the carrier."
    },
    {
        title: "Step 3: Modulation — Encoding the Message",
        narration: "Modulation impresses the message onto the carrier by changing one of its properties. AM varies amplitude, FM varies frequency (more noise-resistant), PSK flips phase (efficient for digital). The modulated signal is what gets transmitted over the air — it contains the message hidden within the carrier.",
        viewMode: 'spectrum',
        highlight: "Sidebands around the carrier spike are the encoded message. Increase Modulation Index to see them spread wider, consuming more bandwidth."
    },
    {
        title: "Step 4: Channel Noise & Recovery",
        narration: "Real channels add noise. The Recovery Comparison panel (orange) shows demodulation through a noisy channel; Ideal Recovery (green) shows perfect conditions. The Correlation % is your fidelity meter — 100% means perfect recovery, <50% means the noise is overwhelming the signal. Drag the SNR slider down to watch recovery degrade in real time.",
        viewMode: 'time',
        audio: 'demodulated',
        highlight: "Compare orange (noisy) vs green (ideal) recovery. Lower SNR = more divergence. Try FM vs AM at the same low SNR — FM holds up much better!"
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

    // Stable refs — avoids recreating applyStep/goToStep on every render
    const onViewChangeRef = useRef(onViewChange);
    const onPlayAudioRef  = useRef(onPlayAudio);
    useEffect(() => { onViewChangeRef.current = onViewChange; });
    useEffect(() => { onPlayAudioRef.current  = onPlayAudio; });

    const AUTO_ADVANCE_SECS = 8;

    // applyStep has stable identity ([] deps) — uses refs for callbacks
    const applyStep = useCallback((s: number) => {
        const demo = DEMO_STEPS[s];
        onViewChangeRef.current(demo.viewMode);
        if (demo.audio) {
            setTimeout(() => onPlayAudioRef.current?.(demo.audio!), 400);
        }
        setSecondsLeft(AUTO_ADVANCE_SECS);
    }, []);

    const goToStep = useCallback((s: number) => {
        const clamped = Math.max(0, Math.min(DEMO_STEPS.length - 1, s));
        setStep(clamped);
        applyStep(clamped);
    }, [applyStep]);

    // Apply step 0 when panel opens; reset auto-play
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setAutoPlay(false);
            applyStep(0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Auto-advance countdown — stable because goToStep is stable
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

    if (!isOpen) return null;

    const current = DEMO_STEPS[step];
    const progress = (step / (DEMO_STEPS.length - 1)) * 100;

    return (
        <div className="fixed bottom-0 left-80 right-96 z-40 p-4">
            <div className="bg-[#1a1a2e]/95 border border-[#00d4ff]/30 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-white/10">
                    <div className="h-full bg-[#00d4ff] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-[#00d4ff]/60 uppercase tracking-widest">
                                    Step {step + 1} / {DEMO_STEPS.length}
                                </span>
                                {autoPlay && (
                                    <span className="text-[10px] text-amber-400 font-mono">
                                        → next in {secondsLeft}s
                                    </span>
                                )}
                            </div>
                            <h3 className="text-sm font-bold text-white leading-tight">{current.title}</h3>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed mb-3">{current.narration}</p>

                    {current.highlight && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                            <p className="text-[11px] text-amber-300">👁 {current.highlight}</p>
                        </div>
                    )}

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

