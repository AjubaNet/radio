import React, { useRef, useEffect } from 'react';

interface Props {
    points: {I: number, Q: number}[];
    title: string;
}

export const ConstellationDiagram: React.FC<Props> = ({ points, title }) => {
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
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) * 0.4;

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, width, height);

        // Axes
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
        ctx.stroke();

        // Unit circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, scale, 0, 2 * Math.PI);
        ctx.stroke();

        // Points
        ctx.fillStyle = '#00d4ff';
        points.forEach(p => {
            const x = centerX + p.I * scale;
            const y = centerY - p.Q * scale;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

    }, [points]);

    return (
        <div className="flex flex-col h-full bg-[#1a1a2e]/40 border-2 border-[#00d4ff]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-[#00d4ff]/10 border-b border-[#00d4ff]/20">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]">{title}</span>
            </div>
            <div className="relative flex-1">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </div>
        </div>
    );
};
