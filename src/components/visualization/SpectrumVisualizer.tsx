import React, { useRef, useEffect, useState } from 'react';
import { Info } from 'lucide-react';

interface Props {
  spectrum: Float32Array;
  sampleRate: number;
  carrierFreq: number;
  msgFreq: number;
  title?: string;
}

export const SpectrumVisualizer: React.FC<Props> = ({ spectrum, sampleRate, carrierFreq, msgFreq, title = 'Spectrum' }) => {
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

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    const nyquist = sampleRate / 2;
    const maxFreq = Math.min(5 * carrierFreq, 10000, nyquist);
    const maxBin = Math.floor(maxFreq / nyquist * spectrum.length);

    // Grid
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 1;
    for (let db = -80; db <= 0; db += 20) {
      const y = pad.top + plotH * (1 - (db + 80) / 80);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,212,255,0.5)';
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
      bin === 0 ? ctx.lineTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,212,255,0.3)';
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
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
      ctx.font = '9px monospace';
      ctx.fillText(label, x + 2, pad.top + 10);
    };
    drawVLine(carrierFreq, '#ff8844', 'fc');
    drawVLine(carrierFreq - msgFreq, 'rgba(255,136,68,0.6)', 'fc-fm');
    drawVLine(carrierFreq + msgFreq, 'rgba(255,136,68,0.6)', 'fc+fm');

    // X axis labels
    ctx.fillStyle = 'rgba(0,212,255,0.7)';
    ctx.font = '9px monospace';
    ctx.fillText('0', pad.left, pad.top + plotH + 15);
    ctx.fillText(`${(carrierFreq/1000).toFixed(1)}k`, pad.left + (carrierFreq/maxFreq)*plotW - 10, pad.top + plotH + 15);
    ctx.fillText(`${(maxFreq/1000).toFixed(1)}k`, pad.left + plotW - 15, pad.top + plotH + 15);

  }, [spectrum, sampleRate, carrierFreq, msgFreq]);

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]/40 border-2 border-[#00d4ff]/30 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#00d4ff]/10 border-b border-[#00d4ff]/20">
        <span className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]">{title}</span>
        <button onClick={() => setShowInfo(v => !v)} className={`p-1 rounded transition-colors ${showInfo ? 'bg-[#00d4ff]/30 text-white' : 'text-[#00d4ff]/50 hover:bg-[#00d4ff]/20'}`}><Info size={13} /></button>
      </div>
      {showInfo && (
        <div className="px-4 py-3 bg-indigo-950/60 border-b border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
          <strong>Frequency Spectrum (FFT):</strong> Shows signal energy vs. frequency. The tall spike at the carrier frequency ({carrierFreq} Hz) is the carrier itself. The sidebands flanking it carry your message information. Wider sidebands = more bandwidth used. Increasing modulation index spreads sidebands further. The dashed lines mark key frequencies. Carson&apos;s Rule (BW ≈ 2(Δf + fm)) defines the occupied bandwidth for FM.
        </div>
      )}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};
