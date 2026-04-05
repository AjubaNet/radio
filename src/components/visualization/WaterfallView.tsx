import React, { useRef, useEffect, useState } from 'react';
import { Info } from 'lucide-react';

interface Props {
  spectrum: Float32Array;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sampleRate: number;
  title?: string;
}

const MAX_ROWS = 64;
const DISPLAY_BINS = 512;

export const WaterfallView: React.FC<Props> = ({ spectrum, title = 'Waterfall' }) => {
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
          data[idx]     = 0;
          data[idx + 1] = Math.floor(db * 212);
          data[idx + 2] = Math.floor(db * 255);
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [spectrum]);

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]/40 border-2 border-[#00d4ff]/30 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#00d4ff]/10 border-b border-[#00d4ff]/20">
        <span className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]">{title}</span>
        <button onClick={() => setShowInfo(v => !v)} className={`p-1 rounded transition-colors ${showInfo ? 'bg-[#00d4ff]/30 text-white' : 'text-[#00d4ff]/50 hover:bg-[#00d4ff]/20'}`}><Info size={13} /></button>
      </div>
      {showInfo && (
        <div className="px-4 py-3 bg-indigo-950/60 border-b border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
          <strong>Waterfall Spectrogram:</strong> Frequency runs left-right; time flows downward; brightness/color represents signal power. Each horizontal row is one spectrum snapshot. FHSS shows diagonal hopping lines as the carrier jumps between frequencies. DSSS shows a wide, diffuse smear across the spectrum. AM shows sharp vertical lines (carrier + sidebands). FM shows a symmetric fan of sidebands.
        </div>
      )}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};
