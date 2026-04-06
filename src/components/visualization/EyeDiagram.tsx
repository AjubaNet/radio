import React, { useRef, useEffect, useState } from 'react';
import { Info } from 'lucide-react';

interface Props {
  signal: Float32Array;
  samplesPerSymbol: number;
  title?: string;
}

export const EyeDiagram: React.FC<Props> = ({ signal, samplesPerSymbol, title = 'Eye Diagram' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInfo, setShowInfo] = useState(false);

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

    const style = getComputedStyle(document.body);
    const bgPanel = style.getPropertyValue('--bg-panel').trim() || '#0a0a1a';
    const borderSub = style.getPropertyValue('--border-sub').trim() || 'rgba(0, 212, 255, 0.1)';
    const accent = style.getPropertyValue('--accent').trim() || '#00d4ff';

    ctx.fillStyle = bgPanel;
    ctx.fillRect(0, 0, W, H);

    if (signal.length < samplesPerSymbol * 2) return;

    let minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < signal.length; i++) {
      if (signal[i] < minV) minV = signal[i];
      if (signal[i] > maxV) maxV = signal[i];
    }
    const range = maxV - minV || 1;

    ctx.strokeStyle = borderSub;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.stroke();

    const numTraces = Math.floor(signal.length / samplesPerSymbol) - 1;
    ctx.strokeStyle = accent + '33'; // low opacity
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

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [signal, samplesPerSymbol]);

  return (
    <div className="flex flex-col h-full border-2 rounded-xl overflow-hidden shadow-lg transition-colors duration-200"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b transition-colors duration-200"
        style={{ background: 'var(--bg-accent-sub)', borderColor: 'var(--border-sub)' }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{title}</span>
        <button onClick={() => setShowInfo(v => !v)} className="p-1 rounded transition-colors"
            style={{ 
                background: showInfo ? 'var(--accent-soft)' : 'transparent',
                color: showInfo ? 'var(--accent)' : 'var(--text-muted)'
            }}
        >
            <Info size={13} />
        </button>
      </div>
      {showInfo && (
        <div className="px-4 py-3 border-b text-xs leading-relaxed transition-colors duration-200" 
            style={{ background: 'var(--bg-accent-sub)', borderColor: 'var(--border-sub)', color: 'var(--text-sec)' }}>
          <strong>Eye Diagram:</strong> All symbol periods overlaid on top of each other. A wide-open &ldquo;eye&rdquo; in the center means symbols are distinguishable.
        </div>
      )}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};
