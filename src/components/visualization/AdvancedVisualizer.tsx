import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

interface VisualizerLayer {
    data: Float32Array;
    color: string;
    label: string;
}

interface Props {
    layers: VisualizerLayer[];
    title: string;
    infoText?: string;
    externalZoom?: number;
    externalOffset?: number;
    onViewChange?: (zoom: number, offset: number) => void;
}

export const AdvancedVisualizer: React.FC<Props> = ({ 
    layers, title, infoText, externalZoom, externalOffset, onViewChange 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [internalZoom, setInternalZoom] = useState(1);
    const [internalOffset, setInternalOffset] = useState(0);
    const [isDragging, setIsPlaying] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    const zoom = externalZoom !== undefined ? externalZoom : internalZoom;
    const offset = externalOffset !== undefined ? externalOffset : internalOffset;

    const updateView = useCallback((newZoom: number, newOffset: number) => {
        const clampedZoom = Math.max(1, Math.min(newZoom, 100));
        const clampedOffset = Math.max(0, Math.min(newOffset, 1));
        if (onViewChange) {
            onViewChange(clampedZoom, clampedOffset);
        } else {
            setInternalZoom(clampedZoom);
            setInternalOffset(clampedOffset);
        }
    }, [onViewChange]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            updateView(zoom * factor, offset);
        } else {
            // Scroll (Pan)
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            const scrollSpeed = 0.001 / zoom;
            updateView(zoom, offset + delta * scrollSpeed);
        }
    }, [zoom, offset, updateView]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsPlaying(true);
        setLastX(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        setLastX(e.clientX);
        // Map pixel drag to offset change
        const dragSpeed = 1 / (zoom * 500); // Sensitivity
        updateView(zoom, offset - dx * dragSpeed);
    };

    const handleMouseUp = () => setIsPlaying(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += width / 10) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += height / 4) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        const centerY = height / 2;

        layers.forEach((layer) => {
            const signal = layer.data;
            if (!signal || signal.length === 0) return;

            ctx.strokeStyle = layer.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            const visibleSamples = Math.floor(signal.length / zoom);
            const maxOffsetRange = signal.length - visibleSamples;
            const startSample = Math.floor(offset * maxOffsetRange);

            for (let i = 0; i < width; i++) {
                const signalIdx = startSample + Math.floor((i / width) * visibleSamples);
                if (signalIdx >= signal.length) break;
                
                const val = signal[signalIdx];
                const x = i;
                const y = centerY - val * (height / 2.2);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

    }, [layers, zoom, offset]);

    return (
        <div className="flex flex-col h-full bg-[#1a1a2e]/40 border-2 border-[#00d4ff]/30 rounded-xl overflow-hidden shadow-lg shadow-primary/5 group">
            <div className="flex items-center justify-between px-4 py-2 bg-[#00d4ff]/10 border-b border-[#00d4ff]/20">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]">{title}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Zoom: {zoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-2 text-[#00d4ff]">
                    {infoText && (
                        <button
                            onClick={() => setShowInfo(v => !v)}
                            className={`p-1 rounded transition-colors ${showInfo ? 'bg-[#00d4ff]/30 text-white' : 'hover:bg-[#00d4ff]/20'}`}
                            title="What does this graph show?"
                        >
                            <Info size={13} />
                        </button>
                    )}
                    <button onClick={() => updateView(zoom * 1.5, offset)} className="p-1 hover:bg-[#00d4ff]/20 rounded"><ZoomIn size={14} /></button>
                    <button onClick={() => updateView(zoom / 1.5, offset)} className="p-1 hover:bg-[#00d4ff]/20 rounded"><ZoomOut size={14} /></button>
                    <button onClick={() => updateView(1, 0)} className="p-1 hover:bg-[#00d4ff]/20 rounded"><RotateCcw size={14} /></button>
                </div>
            </div>
            {showInfo && infoText && (
                <div className="px-4 py-3 bg-indigo-950/60 border-b border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                    {infoText}
                </div>
            )}
            <div 
                className="relative flex-1 min-h-[200px] cursor-grab active:cursor-grabbing select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                <div className="absolute bottom-4 left-4 text-[9px] text-primary/40 font-mono hidden group-hover:block">
                    DRAG TO PAN • WHEEL TO SCROLL • CTRL+WHEEL TO ZOOM
                </div>
                {zoom > 1 && (
                    <input 
                        type="range" min="0" max="1" step="0.001" 
                        value={offset} onChange={(e) => updateView(zoom, parseFloat(e.target.value))}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 accent-[#00d4ff] appearance-none bg-white/10 rounded-full cursor-pointer"
                    />
                )}
            </div>
        </div>
    );
};
