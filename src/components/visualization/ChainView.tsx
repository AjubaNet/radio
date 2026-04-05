import React, { useRef, useEffect } from 'react';
import type { RadioSignals } from '../../types/radio';

interface Props {
  signals: RadioSignals;
}

interface MiniPanelProps {
  data: Float32Array;
  label: string;
  color: string;
}

const MiniPanel: React.FC<MiniPanelProps> = ({ data, label, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    let minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < data.length; i++) {
      if (data[i] < minV) minV = data[i];
      if (data[i] > maxV) maxV = data[i];
    }
    const range = maxV - minV || 1;
    const step = Math.max(1, Math.floor(data.length / W));

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i += step) {
      const x = (i / data.length) * W;
      const y = H - ((data[i] - minV) / range) * H * 0.9 - H * 0.05;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [data, color]);

  return (
    <div className="flex flex-col bg-[#1a1a2e]/60 border border-white/10 rounded-lg overflow-hidden" style={{ minHeight: 90 }}>
      <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider" style={{ color, backgroundColor: 'rgba(0,0,0,0.3)' }}>
        {label}
      </div>
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

export const ChainView: React.FC<Props> = ({ signals }) => {
  const panels = [
    { data: signals.carrier,    label: 'Carrier',        color: '#888888' },
    { data: signals.message,    label: 'Message',        color: '#6699ff' },
    { data: signals.modulated,  label: 'Modulated',      color: '#00d4ff' },
    { data: signals.demodIdeal, label: 'Ideal Recovery', color: '#44ff88' },
    { data: signals.demodulated,label: 'Noisy Recovery', color: '#ff8844' },
  ];

  return (
    <div className="flex flex-col h-full gap-3 p-4 bg-[#1a1a2e]/20 rounded-xl border border-[#00d4ff]/20 overflow-y-auto">
      <div className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]/60 mb-1">Signal Chain</div>
      {panels.map((p, i) => (
        <div key={i} className="flex-1" style={{ minHeight: 90 }}>
          <MiniPanel data={p.data} label={p.label} color={p.color} />
        </div>
      ))}
    </div>
  );
};
