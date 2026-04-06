import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ModulationType } from '../../types/radio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentModulation: ModulationType;
  currentSnr: number;
}

function erfc(x: number): number {
  const t = 1 / (1 + 0.3275911 * x);
  return t * Math.exp(-x * x) * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
}
function qFunc(x: number): number { return 0.5 * erfc(x / Math.sqrt(2)); }

const curves: { label: string; color: string; fn: (snrLin: number) => number; mod: string }[] = [
  { label: 'ASK',   color: '#94a3b8', fn: (s) => qFunc(Math.sqrt(s)),       mod: 'ask' },
  { label: 'FSK',   color: '#3b82f6', fn: (s) => 0.5 * Math.exp(-s / 2),   mod: 'fsk' },
  { label: 'BPSK',  color: '#22c55e', fn: (s) => qFunc(Math.sqrt(2 * s)),   mod: 'psk' },
  { label: 'QPSK',  color: '#0ea5e9', fn: (s) => qFunc(Math.sqrt(2 * s)),   mod: 'qam' },
  { label: '16-QAM',color: '#f59e0b', fn: (s) => (3/8) * erfc(Math.sqrt(2 * s / 5)), mod: 'qam16' },
];

export const BERCurveModal: React.FC<Props> = ({ isOpen, onClose, currentModulation, currentSnr }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 560 * dpr;
    canvas.height = 380 * dpr;
    ctx.scale(dpr, dpr);

    const W = 560, H = 380;
    const pad = { top: 20, right: 120, bottom: 40, left: 60 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const style = getComputedStyle(document.body);
    const bgPanel = style.getPropertyValue('--bg-panel').trim() || '#0a0a1a';
    const borderSub = style.getPropertyValue('--border-sub').trim() || 'rgba(255,255,255,0.1)';
    const textPri = style.getPropertyValue('--text-pri').trim() || '#ffffff';
    const textSec = style.getPropertyValue('--text-sec').trim() || '#94a3b8';

    ctx.fillStyle = bgPanel;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = borderSub;
    ctx.lineWidth = 1;
    for (let snrDb = 0; snrDb <= 30; snrDb += 5) {
      const x = pad.left + (snrDb / 30) * plotW;
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
      ctx.fillStyle = textSec;
      ctx.font = '10px monospace';
      ctx.fillText(`${snrDb}`, x - 5, pad.top + plotH + 15);
    }
    for (let exp = 0; exp >= -6; exp--) {
      const y = pad.top + plotH * (-exp / 6);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
      ctx.fillStyle = textSec;
      ctx.font = '9px monospace';
      ctx.fillText(`1e${exp}`, pad.left - 38, y + 3);
    }

    ctx.fillStyle = textPri;
    ctx.font = '11px monospace';
    ctx.fillText('SNR (dB)', pad.left + plotW / 2 - 30, H - 5);
    ctx.save(); ctx.translate(12, pad.top + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('BER', 0, 0); ctx.restore();

    for (const curve of curves) {
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let snrDb = 0; snrDb <= 30; snrDb += 0.5) {
        const snrLin = Math.pow(10, snrDb / 10);
        const ber = curve.fn(snrLin);
        if (ber <= 0 || !isFinite(ber)) continue;
        const logBer = Math.log10(ber);
        if (logBer < -6 || logBer > 0) continue;
        const x = pad.left + (snrDb / 30) * plotW;
        const y = pad.top + plotH * (-logBer / 6);
        snrDb === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const activeCurve = curves.find(c => c.mod === currentModulation) || curves[0];
    const snrLin = Math.pow(10, currentSnr / 10);
    const berVal = activeCurve.fn(snrLin);
    if (berVal > 0 && isFinite(berVal)) {
      const logBer = Math.log10(berVal);
      if (logBer >= -6 && logBer <= 0 && currentSnr >= 0 && currentSnr <= 30) {
        const cx = pad.left + (currentSnr / 30) * plotW;
        const cy = pad.top + plotH * (-logBer / 6);
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    curves.forEach((c, i) => {
      const lx = pad.left + plotW + 10;
      const ly = pad.top + 15 + i * 22;
      ctx.fillStyle = c.color;
      ctx.fillRect(lx, ly - 7, 18, 3);
      ctx.fillStyle = textSec;
      ctx.font = '10px monospace';
      ctx.fillText(c.label, lx + 22, ly);
    });
  }, [isOpen, currentModulation, currentSnr]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200" onClick={onClose}>
      <div className="relative border rounded-2xl overflow-hidden shadow-2xl w-[600px] transition-colors duration-200" 
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-acc)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b transition-colors duration-200" 
            style={{ borderColor: 'var(--border-sub)', background: 'var(--bg-card)' }}>
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>BER vs SNR Curves</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition-colors" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <canvas ref={canvasRef} style={{ width: 560, height: 380, display: 'block' }} />
        <div className="px-5 py-3 border-t text-[10px] leading-relaxed space-y-1 transition-colors duration-200"
            style={{ borderColor: 'var(--border-sub)', background: 'var(--bg-panel)', color: 'var(--text-sec)' }}>
          <p><span style={{ color: 'var(--accent)' }} className="font-bold">What is BER?</span> Probability a received bit is wrong. 10⁻³ = 1 bit in 1,000.</p>
          <p><span className="text-amber-600 font-bold">Log scale:</span> Y-axis is powers of 10. Each gridline is 10× improvement.</p>
          <p><span className="text-green-600 font-bold">Red dot</span> = your current setup. Move SNR slider to watch it travel.</p>
        </div>
      </div>
    </div>
  );
};
