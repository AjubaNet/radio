import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';

type ViewMode = 'time' | 'spectrum' | 'chain' | 'waterfall' | 'eye';

interface DemoStep {
    title: string;
    narration: string;
    viewMode: ViewMode;
    /** Name of the Chain panel to visually spotlight (must match ChainView panel labels) */
    panelHighlight?: string;
    audio?: 'carrier' | 'modulated' | 'demodulated';
    tip?: string;
}

const DEMO_STEPS: DemoStep[] = [
    {
        title: "The Radio Signal Chain",
        narration: "Every radio communication follows the same pipeline: a carrier wave is generated, your message is encoded onto it (modulation), the signal travels through a noisy channel, and is decoded at the destination (demodulation). This Chain view shows all five stages simultaneously. Watch how each panel relates to the next as you explore different modulation types.",
        viewMode: 'chain',
        tip: "Switch modulation types (AM → FM → PSK) and watch all five panels update simultaneously. The chain never lies."
    },
    {
        title: "Stage 1: The Carrier Wave",
        narration: "The Carrier panel shows a pure, steady sine wave oscillating at the carrier frequency. This is the blank slate — it carries no information yet. In radio, carriers operate at MHz or GHz so they can propagate as electromagnetic waves. Our lab uses lower frequencies (hundreds of Hz) so the math is identical but the waveform is visible.",
        viewMode: 'chain',
        panelHighlight: 'Carrier',
        audio: 'carrier',
        tip: "Notice: no matter what Message signal or modulation you choose, the Carrier itself is always the same clean sine wave. Modulation changes the Modulated panel, not this one."
    },
    {
        title: "Stage 2: The Message Signal",
        narration: "The Message panel is your information — the data you want to transmit. For analog mods (AM/FM/PM) it's a continuous waveform. For digital mods it's a binary pulse train of ±1 values representing 0s and 1s. The message frequency must always be well below the carrier frequency; otherwise sidebands would overlap and the signal couldn't be recovered.",
        viewMode: 'chain',
        panelHighlight: 'Message',
        tip: "Try changing the Message Type (Sine → Square → Sawtooth → Digital) in the sidebar and watch only this panel change, then see how those changes ripple through to the Modulated panel."
    },
    {
        title: "Stage 3: The Modulated Signal",
        narration: "Modulation impresses the message onto the carrier. Look at the Modulated panel — in AM the outline (envelope) of the wave traces the message shape; in FM the wave squeezes and stretches as the frequency varies; in PSK the wave suddenly flips phase at each bit boundary. This is the signal actually transmitted over the air.",
        viewMode: 'chain',
        panelHighlight: 'Modulated',
        tip: "Increase the Modulation Index slider and watch the Modulated panel change dramatically. In AM, deeper modulation = wider envelope swing. In FM, wider frequency deviation = denser wave oscillations."
    },
    {
        title: "Stage 4: Recovery Through Noise",
        narration: "The bottom two panels show what the receiver hears. Ideal Recovery (green) is demodulation with zero noise — the theoretical best case. Noisy Recovery (orange) passes through a channel with the SNR you set. Lower the SNR slider to watch the orange trace diverge from green. The Correlation % quantifies how close they are — real radio systems use error correction (FEC, LDPC, Turbo codes) to push this toward 100% even at very low SNR.",
        viewMode: 'chain',
        panelHighlight: 'Noisy Recovery',
        audio: 'demodulated',
        tip: "Compare AM vs FM at SNR = 10 dB. FM's Noisy Recovery stays closer to the Ideal Recovery — that's FM's noise immunity advantage in action."
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

    // Stable refs — avoids recreating applyStep/goToStep on every render
    const onViewChangeRef    = useRef(onViewChange);
    const onPanelHighlightRef = useRef(onPanelHighlight);
    const onPlayAudioRef     = useRef(onPlayAudio);
    useEffect(() => { onViewChangeRef.current    = onViewChange; });
    useEffect(() => { onPanelHighlightRef.current = onPanelHighlight; });
    useEffect(() => { onPlayAudioRef.current     = onPlayAudio; });

    const AUTO_ADVANCE_SECS = 10;

    const applyStep = useCallback((s: number) => {
        const demo = DEMO_STEPS[s];
        onViewChangeRef.current(demo.viewMode);
        onPanelHighlightRef.current?.(demo.panelHighlight ?? null);
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

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setAutoPlay(false);
            applyStep(0);
        } else {
            // Clear highlight when closed
            onPanelHighlightRef.current?.(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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
                <div className="h-1 bg-white/10">
                    <div className="h-full bg-[#00d4ff] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-[#00d4ff]/60 uppercase tracking-widest">
                                    Stage {step + 1} / {DEMO_STEPS.length} — Chain View
                                </span>
                                {autoPlay && (
                                    <span className="text-[10px] text-amber-400 font-mono">→ next in {secondsLeft}s</span>
                                )}
                                {current.panelHighlight && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d4ff]/20 text-[#00d4ff]">
                                        ↑ {current.panelHighlight}
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

                    {current.tip && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                            <p className="text-[11px] text-amber-300">💡 Try: {current.tip}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-1.5">
                            {DEMO_STEPS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToStep(i)}
                                    title={s.title}
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

