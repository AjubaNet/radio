import React, { useRef, useEffect, useState } from 'react';
import { Info } from 'lucide-react';

interface Props {
  spectrum: Float32Array;
  sampleRate: number;
  theme?: string;
  title?: string;
}

const MAX_ROWS = 64;
const DISPLAY_BINS = 512;

export const WaterfallView: React.FC<Props> = ({ spectrum, theme, title = 'Waterfall' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rowsRef = useRef<Float32Array[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (spectrum.length === 0) return;
    const row = spectrum.slice(0, DISPLAY_BINS);
    rowsRef.current.push(row);
    if (rowsRef.current.length > MAX_ROWS) rowsRef.current.shift();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const W = rect.width;
    const H = rect.height;

    const rows = rowsRef.current;
    const rowH = H / MAX_ROWS;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    const style = getComputedStyle(document.body);
    const accent = style.getPropertyValue('--accent').trim() || '#00d4ff';
    const rMatch = accent.match(/[0-9a-f]{2}/gi);
    const accR = rMatch ? parseInt(rMatch[0], 16) : 0;
    const accG = rMatch ? parseInt(rMatch[1], 16) : 212;
    const accB = rMatch ? parseInt(rMatch[2], 16) : 255;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const yBase = Math.floor((MAX_ROWS - rows.length + r) * rowH);
      for (let x = 0; x < W; x++) {
        const bin = Math.floor((x / W) * DISPLAY_BINS);
        const mag = bin < row.length ? row[bin] : 0;
        const db = Math.max(0, Math.min(1, (20 * Math.log10(mag + 1e-10) + 80) / 80));
        const pixelY = yBase + Math.floor(rowH / 2);
        if (pixelY < 0 || pixelY >= H) continue;
        for (let dy = 0; dy < Math.max(1, Math.ceil(rowH)); dy++) {
          const py = pixelY + dy - Math.floor(rowH / 2);
          if (py < 0 || py >= H) continue;
          const idx = (py * W + x) * 4;
          data[idx]     = Math.floor(db * accR * 0.2);
          data[idx + 1] = Math.floor(db * accG);
          data[idx + 2] = Math.floor(db * accB);
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [spectrum, theme]);

  return (
    <div className="flex flex-col h-full border-2 rounded-xl overflow-hidden shadow-lg transition-colors duration-200"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b transition-colors duration-200"
        style={{ background: 'var(--bg-accent-sub)', borderColor: 'var(--border-sub)' }}
      >
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
          <strong>Waterfall Spectrogram:</strong> Frequency runs left-right; time flows downward; brightness represents signal power.
        </div>
      )}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};
