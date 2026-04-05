import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { RadioSignals } from '../../types/radio';
import { ZoomIn, ZoomOut, RotateCcw, Link, Link2Off, Info } from 'lucide-react';

interface Props {
    signals: RadioSignals;
    // Optional sync with Time view
    externalZoom?: number;
    externalOffset?: number;
    onViewChange?: (zoom: number, offset: number) => void;
}

const PANEL_INFO: Record<string, string> = {
    'Carrier':         'The pure high-frequency sine wave — the "vehicle" for your data. Compare this to the modulated output to see how the carrier is changed by modulation.',
    'Message':         'Your information signal — the data being transmitted. At digital bit rates, this is a ±1 binary pulse train. For analog mods, it\'s the continuous waveform (sine, square, etc.).',
    'Modulated':       'The transmitted signal. The message has been impressed onto the carrier. In AM you\'ll see the envelope follow the message; in FM the frequency visibly varies; in PSK the phase flips at bit boundaries.',
    'Ideal Recovery':  'Demodulated with zero noise — the theoretical best case. This should match the Message panel closely. Any mismatch reveals demodulator distortion or parameter issues.',
    'Noisy Recovery':  'Demodulated through the actual noisy channel. Compares to Ideal Recovery to show noise impact. Lower SNR = more divergence from message. The Correlation % in Time view quantifies this.',
};

interface PanelProps {
    data: Float32Array;
    label: string;
    color: string;
    zoom: number;
    offset: number;
    onViewChange?: (z: number, o: number) => void;
}

const ChainPanel: React.FC<PanelProps> = ({ data, label, color, zoom, offset, onViewChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [lastX, setLastX] = useState(0);

    const updateView = useCallback((newZoom: number, newOffset: number) => {
        const z = Math.max(1, Math.min(newZoom, 50));
        const o = Math.max(0, Math.min(newOffset, 1));
        onViewChange?.(z, o);
    }, [onViewChange]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            updateView(zoom * (e.deltaY > 0 ? 0.85 : 1.15), offset);
        } else {
            updateView(zoom, offset + e.deltaY * 0.001 / zoom);
        }
    }, [zoom, offset, updateView]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const W = rect.width;
        const H = rect.height;

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(0,212,255,0.08)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += W / 8) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

        // Signal
        const visibleSamples = Math.floor(data.length / zoom);
        const maxOffsetRange = data.length - visibleSamples;
        const startSample = Math.floor(offset * maxOffsetRange);

        let maxAbs = 0;
        for (let i = 0; i < data.length; i++) maxAbs = Math.max(maxAbs, Math.abs(data[i]));
        const scale = maxAbs > 0 ? 1 / maxAbs : 1;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < W; i++) {
            const idx = startSample + Math.floor((i / W) * visibleSamples);
            if (idx >= data.length) break;
            const y = H / 2 - data[idx] * scale * (H / 2.2);
            i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
        }
        ctx.stroke();
    }, [data, color, zoom, offset]);

    return (
        <div className="flex-1 flex flex-col min-h-[85px] bg-[#1a1a2e]/60 border border-white/10 rounded-lg overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/30">
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
                    {label}
                </span>
                <div className="flex items-center gap-1">
                    {zoom > 1 && (
                        <span className="text-[8px] font-mono text-white/30">{zoom.toFixed(1)}x</span>
                    )}
                    <button
                        onClick={() => setShowInfo(v => !v)}
                        className="p-0.5 rounded text-white/30 hover:text-white/70 transition-colors"
                    >
                        <Info size={10} />
                    </button>
                </div>
            </div>

            {/* Info overlay */}
            {showInfo && (
                <div className="absolute z-10 mt-6 mx-1 bg-[#0a0a20]/95 border border-[#00d4ff]/30 rounded-lg p-2 text-[10px] text-gray-300 leading-relaxed shadow-xl">
                    {PANEL_INFO[label] || ''}
                    <button onClick={() => setShowInfo(false)} className="block mt-1 text-[#00d4ff]/60 hover:text-[#00d4ff]">✕ close</button>
                </div>
            )}

            {/* Canvas */}
            <div
                className="relative flex-1 cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={(e) => { setIsDragging(true); setLastX(e.clientX); }}
                onMouseMove={(e) => {
                    if (!isDragging) return;
                    const dx = e.clientX - lastX;
                    setLastX(e.clientX);
                    updateView(zoom, offset - dx * 0.001 / zoom);
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
            >
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            </div>
        </div>
    );
};

export const ChainView: React.FC<Props> = ({ signals, externalZoom, externalOffset, onViewChange }) => {
    const [internalZoom, setInternalZoom] = useState(1);
    const [internalOffset, setInternalOffset] = useState(0);
    const [syncPanels, setSyncPanels] = useState(true);

    const zoom = externalZoom !== undefined ? externalZoom : internalZoom;
    const offset = externalOffset !== undefined ? externalOffset : internalOffset;

    const handleViewChange = useCallback((newZoom: number, newOffset: number) => {
        if (onViewChange) {
            onViewChange(newZoom, newOffset);
        } else {
            setInternalZoom(newZoom);
            setInternalOffset(newOffset);
        }
    }, [onViewChange]);

    const panels = [
        { data: signals.carrier,     label: 'Carrier',        color: '#888888' },
        { data: signals.message,     label: 'Message',        color: '#6699ff' },
        { data: signals.modulated,   label: 'Modulated',      color: '#00d4ff' },
        { data: signals.demodIdeal,  label: 'Ideal Recovery', color: '#44ff88' },
        { data: signals.demodulated, label: 'Noisy Recovery', color: '#ff8844' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#1a1a2e]/20 rounded-xl border border-[#00d4ff]/20 overflow-hidden">
            {/* Controls bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#00d4ff]/10 bg-[#00d4ff]/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00d4ff]/60">
                    Signal Chain — {zoom.toFixed(1)}x
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSyncPanels(v => !v)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                            syncPanels
                            ? 'bg-[#00d4ff]/20 border-[#00d4ff]/60 text-[#00d4ff]'
                            : 'bg-white/5 border-white/10 text-gray-500'
                        }`}
                    >
                        {syncPanels ? <Link size={9} /> : <Link2Off size={9} />}
                        Sync
                    </button>
                    <button onClick={() => handleViewChange(zoom * 1.5, offset)} className="p-1 rounded text-[#00d4ff]/60 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors">
                        <ZoomIn size={12} />
                    </button>
                    <button onClick={() => handleViewChange(zoom / 1.5, offset)} className="p-1 rounded text-[#00d4ff]/60 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors">
                        <ZoomOut size={12} />
                    </button>
                    <button onClick={() => handleViewChange(1, 0)} className="p-1 rounded text-[#00d4ff]/60 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors">
                        <RotateCcw size={12} />
                    </button>
                </div>
            </div>

            {/* Panels */}
            <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
                {panels.map((p, i) => (
                    <ChainPanel
                        key={i}
                        data={p.data}
                        label={p.label}
                        color={p.color}
                        zoom={zoom}
                        offset={offset}
                        onViewChange={syncPanels ? handleViewChange : undefined}
                    />
                ))}
                {zoom > 1 && (
                    <input
                        type="range" min="0" max="1" step="0.001"
                        value={offset}
                        onChange={(e) => handleViewChange(zoom, parseFloat(e.target.value))}
                        className="w-full h-1 accent-[#00d4ff] bg-white/10 rounded-full appearance-none cursor-pointer mt-1"
                    />
                )}
            </div>
        </div>
    );
};

