import React, { useRef, useEffect } from 'react';

interface SignalLayer {
    data: Float32Array;
    color: string;
    label: string;
}

interface VisualizerProps {
    layers: SignalLayer[];
    title: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ layers, title }) => {
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

        const centerY = height / 2;

        layers.forEach((layer) => {
            const signal = layer.data;
            if (signal.length === 0) return;

            ctx.strokeStyle = layer.color;
            ctx.lineWidth = 1.5;
            if (layer.label.includes('Ideal')) {
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }
            
            ctx.beginPath();

            let maxAmp = 0;
            for(let i=0; i<signal.length; i++) maxAmp = Math.max(maxAmp, Math.abs(signal[i]));
            maxAmp = maxAmp || 1;

            for (let i = 0; i < width; i++) {
                const signalIdx = Math.floor((i / width) * (signal.length - 1));
                const val = signal[signalIdx] / maxAmp;
                const x = i;
                const y = centerY - val * (height / 2.2);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // Reset dash for next render
        ctx.setLineDash([]);

    }, [layers]);

    return (
        <>
            <div className="canvas-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{title}</span>
                <div style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
                    {layers.map(l => (
                        <span key={l.label} style={{ color: l.color }}>■ {l.label}</span>
                    ))}
                </div>
            </div>
            <canvas ref={canvasRef} />
        </>
    );
};

export default Visualizer;
