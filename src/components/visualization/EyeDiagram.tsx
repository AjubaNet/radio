import React, { useRef, useEffect } from 'react';

interface Props {
  signal: Float32Array;
  samplesPerSymbol: number;
  title?: string;
}

export const EyeDiagram: React.FC<Props> = ({ signal, samplesPerSymbol, title = 'Eye Diagram' }) => {
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

    const W = rect.width;
    const H = rect.height;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    if (signal.length < samplesPerSymbol * 2) return;

    let minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < signal.length; i++) {
      if (signal[i] < minV) minV = signal[i];
      if (signal[i] > maxV) maxV = signal[i];
    }
    const range = maxV - minV || 1;

    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.stroke();

    const numTraces = Math.floor(signal.length / samplesPerSymbol) - 1;
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.lineWidth = 1;
    for (let t = 0; t < numTraces; t++) {
      const start = t * samplesPerSymbol;
      ctx.beginPath();
      for (let s = 0; s <= samplesPerSymbol; s++) {
        const idx = start + s;
        if (idx >= signal.length) break;
        const x = (s / samplesPerSymbol) * W;
        const y = H - ((signal[idx] - minV) / range) * H;
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = '#ffaa44';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [signal, samplesPerSymbol]);

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
