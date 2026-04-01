import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
    signal: Float32Array;
    label: string;
    color?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ signal, label, color = '#00d4ff' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        // Clear
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += width / 10) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += height / 4) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        if (signal.length === 0) return;

        // Plot
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const centerY = height / 2;
        const step = Math.max(1, Math.floor(signal.length / width));
        
        let maxAmp = 0;
        for(let i=0; i<signal.length; i++) maxAmp = Math.max(maxAmp, Math.abs(signal[i]));
        maxAmp = maxAmp || 1;

        for (let i = 0; i < width; i++) {
            const signalIdx = Math.floor((i / width) * signal.length);
            const val = signal[signalIdx] / maxAmp;
            const x = i;
            const y = centerY - val * (height / 2.2);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

    }, [signal, color]);

    return (
        <div className="canvas-container">
            <div className="canvas-label">{label}</div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default Visualizer;
