import React, { useRef, useEffect, useState } from 'react';

interface Props {
  points: {I: number, Q: number}[];
  title: string;
}

interface Tooltip {
  x: number;
  y: number;
  bits: string;
  I: number;
  Q: number;
}

export const ConstellationDiagram: React.FC<Props> = ({ points, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

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

    const style = getComputedStyle(document.body);
    const bgPanel = style.getPropertyValue('--bg-panel').trim() || '#0a0a1a';
    const borderSub = style.getPropertyValue('--border-sub').trim() || 'rgba(0, 212, 255, 0.1)';
    const accent = style.getPropertyValue('--accent').trim() || '#00d4ff';

    ctx.fillStyle = bgPanel;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = borderSub;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, scale, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = accent;
    points.forEach(p => {
      const x = centerX + p.I * scale;
      const y = centerY - p.Q * scale;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [points]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = Math.min(rect.width, rect.height) * 0.4;

    let nearest = points[0];
    let minDist = Infinity;
    for (const p of points) {
      const px = centerX + p.I * scale;
      const py = centerY - p.Q * scale;
      const d = (px - mx) ** 2 + (py - my) ** 2;
      if (d < minDist) { minDist = d; nearest = p; }
    }

    const qamIdealI = [-3, -1, 1, 3].map(v => v / Math.sqrt(10));
    const qamIdealQ = [-3, -1, 1, 3].map(v => v / Math.sqrt(10));
    const grayCode = [0, 1, 3, 2];

    let bits = '?';
    if (points.length <= 4) {
      const angle = Math.atan2(nearest.Q, nearest.I);
      const normalized = ((angle / Math.PI) * 180 + 360) % 360;
      if (normalized < 90) bits = '00';
      else if (normalized < 180) bits = '01';
      else if (normalized < 270) bits = '11';
      else bits = '10';
    } else {
      let minQamDist = Infinity;
      let iIdx = 0, qIdx = 0;
      for (let qi = 0; qi < 4; qi++) {
        for (let ii = 0; ii < 4; ii++) {
          const d = (nearest.I - qamIdealI[ii]) ** 2 + (nearest.Q - qamIdealQ[qi]) ** 2;
          if (d < minQamDist) { minQamDist = d; iIdx = ii; qIdx = qi; }
        }
      }
      const iBits = grayCode[iIdx].toString(2).padStart(2, '0');
      const qBits = grayCode[qIdx].toString(2).padStart(2, '0');
      bits = iBits + qBits;
    }

    setTooltip({ x: mx, y: my, bits, I: nearest.I, Q: nearest.Q });
  };

  return (
    <div className="flex flex-col h-full border-2 rounded-xl overflow-hidden shadow-lg transition-colors duration-200"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}>
      <div className="px-4 py-2 border-b transition-colors duration-200"
        style={{ background: 'var(--bg-accent-sub)', borderColor: 'var(--border-sub)' }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{title}</span>
      </div>
      <div className="relative flex-1" onClick={() => setTooltip(null)}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" onClick={handleClick} />
        {tooltip && (
          <div
            className="absolute border rounded-lg px-3 py-2 text-xs font-mono pointer-events-none shadow-xl z-10 transition-colors duration-200"
            style={{ 
                left: tooltip.x + 10, 
                top: tooltip.y - 30, 
                transform: 'translateY(-100%)',
                background: 'var(--bg-surface)',
                borderColor: 'var(--accent)',
                color: 'var(--text-pri)'
            }}
          >
            <div style={{ color: 'var(--accent)' }}>Bits: {tooltip.bits}</div>
            <div>I: {tooltip.I.toFixed(3)}</div>
            <div>Q: {tooltip.Q.toFixed(3)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
