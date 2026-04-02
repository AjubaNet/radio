import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VisualizerLayer {
    data: Float32Array;
    color: string;
    label: string;
}

interface Props {
    layers: VisualizerLayer[];
    title: string;
}

export const AdvancedVisualizer: React.FC<Props> = ({ layers, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState(0);

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
            const startSample = Math.floor(offset * (signal.length - visibleSamples));

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
        <div className="flex flex-col h-full bg-[#1a1a2e]/40 border-2 border-[#00d4ff]/30 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#00d4ff]/10 border-b border-[#00d4ff]/20">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]">{title}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(prev => Math.min(prev * 1.5, 20))} className="p-1 hover:bg-[#00d4ff]/20 rounded text-[#00d4ff]"><ZoomIn size={14} /></button>
                    <button onClick={() => setZoom(prev => Math.max(prev / 1.5, 1))} className="p-1 hover:bg-[#00d4ff]/20 rounded text-[#00d4ff]"><ZoomOut size={14} /></button>
                    <button onClick={() => { setZoom(1); setOffset(0); }} className="p-1 hover:bg-[#00d4ff]/20 rounded text-[#00d4ff]"><RotateCcw size={14} /></button>
                </div>
            </div>
            <div className="relative flex-1 min-h-[200px]">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
                {zoom > 1 && (
                    <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={offset} onChange={(e) => setOffset(parseFloat(e.target.value))}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 accent-[#00d4ff] appearance-none bg-white/10 rounded-full"
                    />
                )}
            </div>
        </div>
    );
};
