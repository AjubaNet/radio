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
  bitRate?: number;
  title?: string;
}

function getSpectrumInfo(
  mod: ModulationType | undefined,
  carrierFreq: number,
  msgFreq: number,
  beta: number,
  bitRate: number
): string {
  const fc = carrierFreq, fm = msgFreq;
  switch (mod) {
    case 'am':
      return `AM Spectrum: The tall spike at ${fc} Hz is the carrier. Two sidebands appear at ${fc - fm} Hz and ${fc + fm} Hz — those carry your message. Occupied BW = 2×fm = ${2*fm} Hz. Increasing Modulation Index (β) raises the sideband amplitude relative to the carrier; β>1 causes overmodulation (sidebands exceed carrier height → distortion).`;
    case 'fm':
      return `FM Spectrum: Bessel-function sidebands spread symmetrically around ${fc} Hz. Unlike AM, there are multiple sideband pairs, not just one. The number of significant pairs ≈ β+1. Higher β (Modulation Index) = wider spread = more bandwidth. Carson's Rule: BW ≈ 2×(β+1)×fm = 2×(${beta}+1)×${fm} = ${(2*(beta+1)*fm).toFixed(0)} Hz. FM occupies much more bandwidth than AM but gains noise immunity in return.`;
    case 'pm':
      return `PM Spectrum: Similar to FM — Bessel-function sidebands appear around ${fc} Hz. The difference: PM sidebands scale with message frequency (higher-pitched signals spread wider), while FM sidebands scale with deviation. Carson's Rule applies: BW ≈ 2×(β+1)×fm. PM is closely related to FM and is the basis for BPSK/QPSK in digital systems.`;
    case 'ask':
      return `ASK Spectrum: A sinc-shaped main lobe centered at ${fc} Hz. The null-to-null bandwidth = 2×bit_rate = ${2*bitRate} Hz. OOK (On-Off Keying) is a special case — when the bit is '0' the carrier is absent, when '1' it's present. The lobe width is directly proportional to bit rate — faster data = wider spectrum.`;
    case 'fsk':
      return `FSK Spectrum: Two separate carrier spikes — one for bit '1' and one for bit '0' — each with their own sinc lobes. The frequency separation (2×Δf) is controlled by the Modulation Index. Wider spacing = easier to distinguish at the receiver, but more bandwidth consumed. Minimum-shift keying (MSK) is the optimal FSK variant used in Bluetooth.`;
    case 'psk':
      return `PSK Spectrum: A single sinc-shaped lobe at ${fc} Hz. Phase shifts don't add extra spectral lines — PSK is spectrally efficient. Null-to-null BW = 2×bit_rate = ${2*bitRate} Hz. BPSK (binary) uses the full lobe width; QPSK (4-PSK) achieves the same BW with 2× the data rate. This efficiency makes PSK the basis of GPS, WiFi, and cellular systems.`;
    case 'qam':
      return `QAM Spectrum: A sinc lobe at ${fc} Hz. Because QAM encodes 4 bits per symbol, the symbol rate = bit_rate/4 = ${(bitRate/4).toFixed(0)} symbols/sec, so the null-to-null BW = 2×(bit_rate/4) = ${(bitRate/2).toFixed(0)} Hz — much narrower than ASK/PSK for the same data rate. This is why 256-QAM is used in cable TV and 1024-QAM in Wi-Fi 6.`;
    case 'pcm':
      return `PCM Spectrum: Rectangular pulse spectrum with a wide main lobe and harmonics at multiples of the bit rate. PCM converts the analog signal to digital numbers first, then transmits those bits — so it looks like a digital signal spectrally. The occupied BW depends on the bit rate of the encoded bitstream.`;
    case 'pam':
      return `PAM Spectrum: The sampled pulses generate a sinc-shaped envelope with harmonics spaced at the pulse repetition rate. The main lobe extends to the pulse bandwidth. Higher pulse rate (more samples) = wider spectrum but better reconstruction fidelity. Nyquist theorem governs: sample at ≥ 2× the highest message frequency.`;
    case 'pwm':
      return `PWM Spectrum: A carrier fundamental at ${fc} Hz plus strong harmonics at integer multiples. The duty cycle determines which harmonics dominate. In audio applications these harmonics are filtered out; only the baseband message (encoded in duty cycle) is recovered. Used extensively in motor control and switching amplifiers.`;
    case 'ppm':
      return `PPM Spectrum: Similar to PWM — a carrier-frequency fundamental with harmonics. The pulse position shifts encode the message. PPM is spectrally similar to PWM but the message information is in timing rather than width. Constant pulse energy makes PPM power-efficient for optical communications.`;
    case 'dsss':
      return `DSSS Spectrum: The message bit is multiplied with a high-rate PN (pseudo-noise) chip sequence, spreading the signal's energy across a wide band. The result looks like flat noise from here — that's intentional. The processing gain = chip_rate / bit_rate. To an eavesdropper or jammer, DSSS is indistinguishable from background noise. GPS and CDMA mobile phones use DSSS.`;
    case 'fhss':
      return `FHSS Spectrum: The carrier jumps between different frequencies following a secret sequence — so at any moment you see a narrow spike, but its position changes every hop interval. The total occupied bandwidth is the span of all possible hop frequencies. Switch to Waterfall view to see the hopping pattern over time. Bluetooth uses FHSS across 79 channels in the 2.4 GHz band.`;
    default:
      return `Frequency Spectrum (FFT): Shows signal energy vs. frequency. The tall spike at ${fc} Hz is the carrier. Sidebands carry message information. Wider sidebands = more bandwidth used. Increasing Modulation Index spreads sidebands further.`;
  }
}

export const SpectrumVisualizer: React.FC<Props> = ({
  spectrum, sampleRate, carrierFreq, msgFreq,
  modulation, modIndex = 1, bitRate = 1600, title = 'Spectrum'
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
          {getSpectrumInfo(modulation, carrierFreq, msgFreq, modIndex, bitRate)}
        </div>
      )}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};
