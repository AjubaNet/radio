import React, { useState } from 'react';
import { useRadio } from './hooks/useRadio';
import { AdvancedVisualizer } from './components/visualization/AdvancedVisualizer';
import { ModulationGuide } from './components/educational/ModulationGuide';
import type { ModulationType, ModulationCategory } from './types/radio';
import { Radio, Settings2, Activity, Play, Download, Share2, Layers, BookOpen } from 'lucide-react';

const App: React.FC = () => {
    const {
        modulation, carrierFreq, msgFreq, modIndex, snr, signals, metrics,
        setCarrierFreq, setMsgFreq, setModIndex, setSnr,
        handleModulationChange, playSignal
    } = useRadio();

    const [activeTab, setActiveTab] = useState<ModulationCategory>('analog');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const categories: {id: ModulationCategory, label: string}[] = [
        { id: 'analog', label: 'Analog' },
        { id: 'digital', label: 'Digital' },
        { id: 'pulse', label: 'Pulse' },
        { id: 'spread', label: 'Spread' }
    ];

    const modsByCategory: Record<ModulationCategory, ModulationType[]> = {
        analog: ['am', 'fm', 'pm'],
        digital: ['ask', 'fsk', 'psk', 'qam'],
        pulse: ['pam', 'pwm', 'ppm', 'pcm'],
        spread: ['dsss', 'fhss']
    };

    return (
        <div className="flex h-screen bg-[#050510] text-gray-100 overflow-hidden font-sans">
            <aside className="w-80 flex flex-col border-r border-[#00d4ff]/20 bg-[#1a1a2e]/40 backdrop-blur-xl">
                <header className="p-6 border-b border-[#00d4ff]/20 bg-[#00d4ff]/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00d4ff] rounded-lg text-[#1a1a2e]">
                            <Radio size={24} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-white uppercase italic">RadioLab v2</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#00d4ff]/60 flex items-center gap-2">
                            <Layers size={12} /> Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                        activeTab === cat.id 
                                        ? 'bg-[#00d4ff] border-[#00d4ff] text-[#1a1a2e] shadow-lg shadow-[#00d4ff]/20' 
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#00d4ff]/60 flex items-center gap-2">
                            <Settings2 size={12} /> Modulation
                        </label>
                        <div className="flex flex-col gap-2">
                            {modsByCategory[activeTab].map(mod => (
                                <button
                                    key={mod}
                                    onClick={() => handleModulationChange(mod)}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border flex items-center justify-between ${
                                        modulation === mod 
                                        ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white' 
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {mod.toUpperCase()}
                                    {modulation === mod && <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-[#00d4ff]/10">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-400">Carrier Freq</span>
                                <span className="text-[#00d4ff] font-mono">{carrierFreq}Hz</span>
                            </div>
                            <input type="range" min="100" max="5000" step="100" value={carrierFreq} onChange={(e) => setCarrierFreq(parseInt(e.target.value))} className="w-full accent-[#00d4ff] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-400">Message Freq</span>
                                <span className="text-[#00d4ff] font-mono">{msgFreq}Hz</span>
                            </div>
                            <input type="range" min="1" max="500" step="1" value={msgFreq} onChange={(e) => setMsgFreq(parseInt(e.target.value))} className="w-full accent-[#00d4ff] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-400">Mod Index</span>
                                <span className="text-[#00d4ff] font-mono">{modIndex.toFixed(2)}</span>
                            </div>
                            <input type="range" min="0" max="5" step="0.05" value={modIndex} onChange={(e) => setModIndex(parseFloat(e.target.value))} className="w-full accent-[#00d4ff] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-400">Channel SNR</span>
                                <span className="text-[#00d4ff] font-mono">{snr}dB</span>
                            </div>
                            <input type="range" min="-10" max="40" step="1" value={snr} onChange={(e) => setSnr(parseInt(e.target.value))} className="w-full accent-[#00d4ff] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                        </div>
                    </div>
                </div>

                <footer className="p-6 bg-black/20 border-t border-[#00d4ff]/10 grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5">
                        <Download size={16} /> <span className="text-[10px] font-bold uppercase">Export</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5">
                        <Share2 size={16} /> <span className="text-[10px] font-bold uppercase">Share</span>
                    </button>
                </footer>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <div className="h-16 flex items-center justify-between px-8 border-b border-[#00d4ff]/10 bg-[#1a1a2e]/20 backdrop-blur-sm">
                    <div className="flex gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">Measured SNR</span>
                            <span className="text-sm font-mono font-bold text-white">{metrics.snr.toFixed(1)} dB</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">Occupied BW</span>
                            <span className="text-sm font-mono font-bold text-white">{(metrics.bandwidth / 1000).toFixed(2)} kHz</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">Bit Error Rate</span>
                            <span className="text-sm font-mono font-bold text-white">{metrics.ber.toFixed(2)} %</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => playSignal('modulated')} className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] text-xs font-bold hover:bg-[#00d4ff] hover:text-[#1a1a2e] transition-all">
                            <Play size={14} fill="currentColor" /> TX Signal
                        </button>
                        <button onClick={() => playSignal('demodulated')} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-xs font-bold hover:bg-green-500 hover:text-[#1a1a2e] transition-all">
                            <Activity size={14} /> RX Recovery
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="lg:col-span-2">
                        <AdvancedVisualizer 
                            title="Transmitted Modulated Waveform" 
                            layers={[{ data: signals.modulated, color: '#00d4ff', label: 'Modulated' }]} 
                        />
                    </div>
                    
                    <AdvancedVisualizer 
                        title="Recovery Comparison (Original vs Recovered)" 
                        layers={[
                            { data: signals.message, color: 'rgba(102, 153, 255, 0.5)', label: 'Message' },
                            { data: signals.demodulated, color: '#ff8844', label: 'Demodulated' }
                        ]} 
                    />

                    <AdvancedVisualizer 
                        title="Ideal Recovery (Perfect Channel)" 
                        layers={[
                            { data: signals.message, color: 'rgba(102, 153, 255, 0.5)', label: 'Message' },
                            { data: signals.demodIdeal, color: '#44ff88', label: 'Ideal' }
                        ]} 
                    />
                </div>
            </main>

            <aside className={`w-96 flex-shrink-0 transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
                <ModulationGuide type={modulation} />
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-[#1a1a2e] border border-[#00d4ff]/30 rounded-l-xl text-[#00d4ff]"
                >
                    <BookOpen size={20} />
                </button>
            </aside>
        </div>
    );
};

export default App;
