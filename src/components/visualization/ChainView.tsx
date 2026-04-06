import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { RadioSignals } from '../../types/radio';
import { ZoomIn, ZoomOut, RotateCcw, Link, Link2Off, Info } from 'lucide-react';

interface Props {
    signals: RadioSignals;
    theme?: string;
    highlightedPanel?: string | null;
    externalZoom?: number;
    externalOffset?: number;
    onViewChange?: (zoom: number, offset: number) => void;
}

const PANEL_INFO: Record<string, string> = {
    'Carrier':         'The pure high-frequency sine wave — the "vehicle" for your data.',
    'Message':         'Your information signal — the data being transmitted.',
    'Modulated':       'The transmitted signal. The message has been impressed onto the carrier.',
    'Ideal Recovery':  'Demodulated with zero noise — the theoretical best case.',
    'Noisy Recovery':  'Demodulated through the actual noisy channel.',
};

interface PanelProps {
    data: Float32Array;
    label: string;
    color: string;
    zoom: number;
    offset: number;
    theme?: string;
    onViewChange?: (z: number, o: number) => void;
}

const ChainPanel: React.FC<PanelProps> = ({ data, label, color, zoom, offset, theme, onViewChange }) => {
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
        if (!e.currentTarget.contains(e.target as Node)) return;
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            updateView(zoom * (e.deltaY > 0 ? 0.85 : 1.15), offset);
        } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            updateView(zoom, offset + e.deltaX * 0.001 / zoom);
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

        const style = getComputedStyle(document.body);
        const bgPanel = style.getPropertyValue('--bg-panel').trim();
        const borderSub = style.getPropertyValue('--border-sub').trim();

        ctx.fillStyle = bgPanel || (theme === 'light' ? '#f8fafc' : '#0a0a1a');
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = borderSub || 'rgba(128, 128, 128, 0.1)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += W / 8) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

        const visibleSamples = Math.floor(data.length / zoom);
        const maxOffsetRange = data.length - visibleSamples;
        const startSample = Math.floor(offset * maxOffsetRange);

        let maxAbs = 0;
        for (let i = 0; i < data.length; i++) maxAbs = Math.max(maxAbs, Math.abs(data[i]));
        const scaleY = (maxAbs > 0 ? 1 / maxAbs : 1) * (H / 2.2);
        const samplesPerPixel = visibleSamples / W;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let pathStarted = false;

        for (let i = 0; i < W; i++) {
            const sStart = startSample + Math.floor(i * samplesPerPixel);
            const sEnd = startSample + Math.floor((i + 1) * samplesPerPixel);
            if (sStart >= data.length) break;

            if (sEnd <= sStart + 1 || samplesPerPixel < 1.5) {
                const val = data[Math.min(sStart, data.length - 1)];
                const y = H / 2 - val * scaleY;
                if (!pathStarted) { ctx.moveTo(i, y); pathStarted = true; }
                else ctx.lineTo(i, y);
            } else {
                let minV = Infinity, maxV = -Infinity;
                const limit = Math.min(sEnd, data.length);
                for (let j = sStart; j < limit; j++) {
                    if (data[j] < minV) minV = data[j];
                    if (data[j] > maxV) maxV = data[j];
                }
                const yHi = H / 2 - maxV * scaleY;
                const yLo = H / 2 - minV * scaleY;
                if (!pathStarted) { ctx.moveTo(i, (yHi + yLo) / 2); pathStarted = true; }
                ctx.lineTo(i, yHi);
                ctx.lineTo(i, yLo);
            }
        }
        ctx.stroke();
    }, [data, color, zoom, offset, theme]);

    return (
        <div className="flex-1 flex flex-col min-h-[85px] border rounded-lg overflow-hidden transition-colors duration-200"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-sub)' }}
        >
            <div className="flex items-center justify-between px-2 py-1 transition-colors duration-200" style={{ background: 'var(--bg-card)' }}>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
                    {label}
                </span>
                <div className="flex items-center gap-1">
                    {zoom > 1 && (
                        <span className="text-[8px] font-mono opacity-40" style={{ color: 'var(--text-pri)' }}>{zoom.toFixed(1)}x</span>
                    )}
                    <button onClick={() => setShowInfo(v => !v)} className="p-0.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <Info size={10} />
                    </button>
                </div>
            </div>

            {showInfo && (
                <div className="absolute z-10 mt-6 mx-1 border rounded-lg p-2 text-[10px] leading-relaxed shadow-xl"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--accent)', color: 'var(--text-sec)' }}>
                    {PANEL_INFO[label] || ''}
                    <button onClick={() => setShowInfo(false)} className="block mt-1 font-bold" style={{ color: 'var(--accent)' }}>✕ close</button>
                </div>
            )}

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

export const ChainView: React.FC<Props> = ({ signals, theme, highlightedPanel, externalZoom, externalOffset, onViewChange }) => {
    const [internalZoom, setInternalZoom] = useState(1);
    const [internalOffset, setInternalOffset] = useState(0);
    const [syncPanels, setSyncPanels] = useState(true);

    const zoom = externalZoom !== undefined ? externalZoom : internalZoom;
    const offset = externalOffset !== undefined ? externalOffset : internalOffset;

    const handleViewChange = useCallback((newZoom: number, newOffset: number) => {
        if (onViewChange) onViewChange(newZoom, newOffset);
        else { setInternalZoom(newZoom); setInternalOffset(newOffset); }
    }, [onViewChange]);

    const panels = [
        { data: signals.carrier,     label: 'Carrier',        color: '#94a3b8' },
        { data: signals.message,     label: 'Message',        color: '#3b82f6' },
        { data: signals.modulated,   label: 'Modulated',      color: theme === 'light' ? '#0284c7' : '#00d4ff' },
        { data: signals.demodIdeal,  label: 'Ideal Recovery', color: '#22c55e' },
        { data: signals.demodulated, label: 'Noisy Recovery', color: '#f59e0b' },
    ];

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden transition-colors duration-200"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b transition-colors duration-200"
                style={{ background: 'var(--bg-accent-sub)', borderColor: 'var(--border-sub)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-sec)' }}>
                    Signal Chain — {zoom.toFixed(1)}x
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSyncPanels(v => !v)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border transition-all"
                        style={{
                            borderColor: syncPanels ? 'var(--accent)' : 'var(--border-sub)',
                            backgroundColor: syncPanels ? 'var(--accent-soft)' : 'var(--bg-input)',
                            color: syncPanels ? 'var(--accent)' : 'var(--text-muted)'
                        }}
                    >
                        {syncPanels ? <Link size={9} /> : <Link2Off size={9} />}
                        Sync
                    </button>
                    <button onClick={() => handleViewChange(zoom * 1.5, offset)} className="p-1 rounded hover:bg-black/5" style={{ color: 'var(--accent)' }}><ZoomIn size={12} /></button>
                    <button onClick={() => handleViewChange(zoom / 1.5, offset)} className="p-1 rounded hover:bg-black/5" style={{ color: 'var(--accent)' }}><ZoomOut size={12} /></button>
                    <button onClick={() => handleViewChange(1, 0)} className="p-1 rounded hover:bg-black/5" style={{ color: 'var(--accent)' }}><RotateCcw size={12} /></button>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto scrollbar-hide">
                {panels.map((p, i) => (
                    <div
                        key={i}
                        className={`relative transition-all duration-500 ${
                            highlightedPanel === p.label
                                ? 'rounded-lg ring-2 ring-amber-400 ring-offset-1'
                                : ''
                        }`}
                    >
                        {highlightedPanel === p.label && (
                            <div className="absolute -top-4 left-2 z-10 text-[9px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">
                                ▼ Look here
                            </div>
                        )}
                        <ChainPanel
                            data={p.data}
                            label={p.label}
                            color={highlightedPanel === p.label ? '#f59e0b' : p.color}
                            zoom={zoom}
                            offset={offset}
                            theme={theme}
                            onViewChange={syncPanels ? handleViewChange : undefined}
                        />
                    </div>
                ))}
                {zoom > 1 && (
                    <input
                        type="range" min="0" max="1" step="0.001"
                        value={offset}
                        onChange={(e) => handleViewChange(zoom, parseFloat(e.target.value))}
                        className="w-full h-1 bg-black/10 rounded-full appearance-none cursor-pointer mt-1"
                        style={{ accentColor: 'var(--accent)' }}
                    />
                )}
            </div>
        </div>
    );
};
