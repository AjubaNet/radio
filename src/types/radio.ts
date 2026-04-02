export type ModulationType = 
  | 'am' | 'fm' | 'pm' 
  | 'ask' | 'fsk' | 'psk' | 'qam' 
  | 'pam' | 'pwm' | 'ppm' | 'pcm' 
  | 'dsss' | 'fhss';

export type ModulationCategory = 'analog' | 'digital' | 'pulse' | 'spread';

export interface ModulationInfo {
  name: string;
  abbreviation: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  applications: string[];
  bandwidth: string;
  efficiency: string;
  formula: string;
}

export interface RadioMetrics {
  snr: number;
  setSnr: number;
  peakPower: number;
  bandwidth: number;
  ber: number;
  spectralEfficiency: number;
  evm: number;
}

export interface RadioSignals {
  carrier: Float32Array;
  message: Float32Array;
  modulated: Float32Array;
  demodulated: Float32Array;
  demodIdeal: Float32Array;
  noise: Float32Array;
}

export type ViewMode = 'time' | 'freq' | 'constellation' | 'eye' | 'waterfall' | 'chain' | 'compare';
