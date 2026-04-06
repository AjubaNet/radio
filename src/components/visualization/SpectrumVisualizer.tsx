import React, { useRef, useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import type { ModulationType } from '../../types/radio';

interface Props {
  spectrum: Float32Array;
  sampleRate: number;
  carrierFreq: number;
  msgFreq: number;
  modulation?: ModulationType;
  modIndex?: number;
  title?: string;
}

function getSpectrumInfo(
  mod: ModulationType | undefined,
  carrierFreq: number,
  msgFreq: number,
  beta: number
): string {
  const fc = carrierFreq, fm = msgFreq;
  switch (mod) {
    case 'am':
      return `AM Spectrum: The tall spike at ${fc} Hz is the carrier. Two sidebands appear at ${fc - fm} Hz and ${fc + fm} Hz — those carry your message. Occupied BW = 2×fm = ${2*fm} Hz.`;
    case 'fm':
      return `FM Spectrum: Bessel-function sidebands spread symmetrically around ${fc} Hz. Carson's Rule: BW ≈ 2×(β+1)×fm = ${(2*(beta+1)*fm).toFixed(0)} Hz.`;
    default:
      return `Frequency Spectrum (FFT): Shows signal energy vs. frequency. Spikes represent dominant frequencies (carrier and sidebands).`;
  }
}

export const SpectrumVisualizer: React.FC<Props> = ({
  spectrum, sampleRate, carrierFreq, msgFreq,
  modulation, modIndex = 1, title = 'Spectrum'
}) => {
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
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const style = getComputedStyle(document.body);
    const bgPanel = style.getPropertyValue('--bg-panel').trim() || '#0a0a1a';
    const borderSub = style.getPropertyValue('--border-sub').trim() || 'rgba(0, 212, 255, 0.1)';
    const accent = style.getPropertyValue('--accent').trim() || '#00d4ff';
    const textSec = style.getPropertyValue('--text-sec').trim() || '#94a3b8';

    ctx.fillStyle = bgPanel;
    ctx.fillRect(0, 0, W, H);

    const nyquist = sampleRate / 2;
    const maxFreq = Math.min(5 * carrierFreq, 10000, nyquist);
    const maxBin = Math.floor(maxFreq / nyquist * spectrum.length);

    // Grid
    ctx.strokeStyle = borderSub;
    ctx.lineWidth = 1;
    for (let db = -80; db <= 0; db += 20) {
      const y = pad.top + plotH * (1 - (db + 80) / 80);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
      ctx.fillStyle = textSec;
      ctx.font = '9px monospace';
      ctx.fillText(`${db}`, pad.left - 28, y + 3);
    }

    // Filled spectrum
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    for (let bin = 0; bin < maxBin && bin < spectrum.length; bin++) {
      const x = pad.left + (bin / maxBin) * plotW;
      const mag = spectrum[bin];
      const db = Math.max(-80, 20 * Math.log10(mag + 1e-10));
      const y = pad.top + plotH * (1 - (db + 80) / 80);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = accent + '33'; 
    ctx.fill();
    
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let bin = 0; bin < maxBin && bin < spectrum.length; bin++) {
      const x = pad.left + (bin / maxBin) * plotW;
      const mag = spectrum[bin];
      const db = Math.max(-80, 20 * Math.log10(mag + 1e-10));
      const y = pad.top + plotH * (1 - (db + 80) / 80);
      bin === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Vertical markers
    const drawVLine = (freq: number, color: string, label: string) => {
      if (freq > maxFreq || freq < 0) return;
      const x = pad.left + (freq / maxFreq) * plotW;
      ctx.strokeStyle = color;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.fillText(label, x + 2, pad.top + 10);
    };
    drawVLine(carrierFreq, '#f59e0b', 'fc');

    ctx.fillStyle = textSec;
    ctx.font = '9px monospace';
    ctx.fillText('0', pad.left, pad.top + plotH + 15);
    ctx.fillText(`${(carrierFreq/1000).toFixed(1)}k`, pad.left + (carrierFreq/maxFreq)*plotW - 10, pad.top + plotH + 15);
    ctx.fillText(`${(maxFreq/1000).toFixed(1)}k`, pad.left + plotW - 15, pad.top + plotH + 15);

  }, [spectrum, sampleRate, carrierFreq, msgFreq]);

  return (
    <div className="flex-1 flex flex-col h-full border-2 rounded-xl overflow-hidden shadow-lg transition-colors duration-200"
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
          {getSpectrumInfo(modulation, carrierFreq, msgFreq, modIndex)}
        </div>
      )}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};
