import React, { useState } from 'react';
import { useRadio } from './hooks/useRadio';
import { AdvancedVisualizer } from './components/visualization/AdvancedVisualizer';
import { ConstellationDiagram } from './components/visualization/ConstellationDiagram';
import { SpectrumVisualizer } from './components/visualization/SpectrumVisualizer';
import { EyeDiagram } from './components/visualization/EyeDiagram';
import { WaterfallView } from './components/visualization/WaterfallView';
import { ChainView } from './components/visualization/ChainView';
import { BERCurveModal } from './components/ui/BERCurveModal';
import { ModulationGuide } from './components/educational/ModulationGuide';
import type { ModulationType, ModulationCategory } from './types/radio';
import { Radio, Settings2, Activity, Play, Download, Share2, Layers, BookOpen, Music, Link, Link2Off, Waves, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
    const {
        modulation, messageType, carrierFreq, msgFreq, modIndex, snr, sampleRate,
        signals, metrics, constellation,
        deterministicBits, setDeterministicBits,
        setCarrierFreq, setMsgFreq, setModIndex, setSnr, setMessageType,
        handleModulationChange, playSignal, playLongTrack,
        exportWAV, copyParams
    } = useRadio();

    const [activeTab, setActiveTab] = useState<ModulationCategory>('analog');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [syncView, setSyncView] = useState(true);
    const [sharedZoom, setSharedZoom] = useState(1);
    const [sharedOffset, setSharedOffset] = useState(0);
    const [viewMode, setViewMode] = useState<'time'|'spectrum'|'chain'|'waterfall'|'eye'>('time');
    const [berModalOpen, setBerModalOpen] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [copyToast, setCopyToast] = useState(false);

    const handleViewChange = (zoom: number, offset: number) => {
        setSharedZoom(zoom);
        setSharedOffset(offset);
    };

    const handleCopyParams = () => {
        copyParams();
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2000);
    };

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

    const messageTypes = [
        { id: 'sine', label: 'Sine' },
        { id: 'square', label: 'Square' },
        { id: 'sawtooth', label: 'Sawtooth' },
        { id: 'triangle', label: 'Triangle' },
        { id: 'noise', label: 'Noise' },
        { id: 'digital', label: 'Digital' }
    ];

    const isDigital = ['ask', 'fsk', 'psk', 'qam', 'dsss', 'fhss'].includes(modulation);

    const snrColor = snr >= 30 ? '#44ff88' : snr >= 15 ? '#ffaa44' : '#ff4444';
    const corrColor = metrics.correlation > 0.9 ? '#44ff88' : metrics.correlation > 0.6 ? '#ffaa44' : '#ff4444';

    const viewModes: {id: 'time'|'spectrum'|'chain'|'waterfall'|'eye', label: string, digitalOnly?: boolean}[] = [
        { id: 'time', label: 'Time' },
        { id: 'spectrum', label: 'Spectrum' },
        { id: 'chain', label: 'Chain' },
        { id: 'waterfall', label: 'Waterfall' },
        { id: 'eye', label: 'Eye', digitalOnly: true },
    ];

    const samplesPerSymbol = Math.max(1, Math.floor(sampleRate / (msgFreq * 16)));

    return (
        <div className="flex h-screen bg-[#050510] text-gray-100 overflow-hidden font-sans">
            {/* Left sidebar */}
            <aside className="w-80 flex flex-col border-r border-[#00d4ff]/20 bg-[#1a1a2e]/40 backdrop-blur-xl">
                <header className="p-6 border-b border-[#00d4ff]/20 bg-[#00d4ff]/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00d4ff] rounded-lg text-[#1a1a2e]">
                            <Radio size={24} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-white uppercase italic">RadioLab v2</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#00d4ff]/60 flex items-center gap-2">
                            <Waves size={12} /> Message Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {messageTypes.map(mt => (
                                <button
                                    key={mt.id}
                                    onClick={() => setMessageType(mt.id)}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${
                                        messageType === mt.id 
                                        ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white' 
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {mt.label}
                                </button>
                            ))}
                        </div>
                        {isDigital && (
                            <button
                                onClick={() => setDeterministicBits(!deterministicBits)}
                                className={`w-full px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                                    deterministicBits
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {deterministicBits ? '🔒 Deterministic Bits' : '🎲 Random Bits'}
                            </button>
                        )}
                    </div>

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
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-400">Channel SNR</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: snrColor}} />
                                    <span className="text-[#00d4ff] font-mono">{snr}dB</span>
                                    <button onClick={() => handleModulationChange(modulation)} className="text-[9px] font-bold text-[#00d4ff]/60 hover:text-[#00d4ff] uppercase tracking-wider transition-colors">⚡ Reset</button>
                                </div>
                            </div>
                            <input type="range" min="-10" max="40" step="1" value={snr} onChange={(e) => setSnr(parseInt(e.target.value))} className="w-full accent-[#00d4ff] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                        </div>
                    </div>
                </div>

                <footer className="p-6 bg-black/20 border-t border-[#00d4ff]/10 grid grid-cols-2 gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5"
                        >
                            <Download size={16} /> <span className="text-[10px] font-bold uppercase">Export</span>
                        </button>
                        {showExportMenu && (
                            <div className="absolute bottom-full mb-2 left-0 bg-[#1a1a2e] border border-[#00d4ff]/30 rounded-xl overflow-hidden shadow-xl z-10 w-52">
                                <button onClick={() => { exportWAV('demodulated'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-[#00d4ff]/10 hover:text-white transition-colors">
                                    🎵 Export WAV (demodulated)
                                </button>
                                <button onClick={() => { exportWAV('message'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-[#00d4ff]/10 hover:text-white transition-colors border-t border-white/5">
                                    🎵 Export WAV (message)
                                </button>
                                <button disabled className="w-full text-left px-4 py-3 text-xs text-gray-500 border-t border-white/5 opacity-40 cursor-not-allowed">
                                    🖼 Export PNG (soon)
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={handleCopyParams}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5"
                        >
                            <Share2 size={16} /> <span className="text-[10px] font-bold uppercase">{copyToast ? 'Copied!' : 'Share'}</span>
                        </button>
                    </div>
                </footer>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                {/* Metrics header */}
                <div className="flex items-center justify-between px-8 border-b border-[#00d4ff]/10 bg-[#1a1a2e]/20 backdrop-blur-sm" style={{minHeight: '4rem'}}>
                    <div className="flex gap-6 flex-wrap">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">Measured SNR</span>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: snrColor}} />
                                <span className="text-sm font-mono font-bold text-white">{metrics.snr.toFixed(1)} dB</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">Occupied BW</span>
                            <span className="text-sm font-mono font-bold text-white">{(metrics.bandwidth / 1000).toFixed(2)} kHz</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">BER</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {isDigital && isFinite(metrics.ber) ? metrics.ber.toExponential(2) : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">Peak Power</span>
                            <span className="text-sm font-mono font-bold text-white">{isFinite(metrics.peakPower) ? metrics.peakPower.toFixed(1) + ' dBm' : 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">Spec Eff</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {metrics.spectralEfficiency > 0 ? metrics.spectralEfficiency.toFixed(2) + ' b/Hz' : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#00d4ff]/60 uppercase tracking-tighter">EVM</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {modulation === 'qam' ? metrics.evm.toFixed(1) + '%' : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <button 
                                onClick={() => setSyncView(!syncView)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
                                    syncView 
                                    ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]' 
                                    : 'bg-white/5 border-white/10 text-gray-500'
                                }`}
                            >
                                {syncView ? <Link size={12} /> : <Link2Off size={12} />}
                                <span className="text-[10px] font-bold uppercase">Sync</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setBerModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-bold hover:bg-purple-500 hover:text-white transition-all">
                            <TrendingUp size={14} /> BER Curves
                        </button>
                        <button onClick={() => playLongTrack()} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-bold hover:bg-amber-500 hover:text-[#1a1a2e] transition-all">
                            <Music size={14} /> Play Demo Song
                        </button>
                        <button onClick={() => playSignal('modulated')} className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] text-xs font-bold hover:bg-[#00d4ff] hover:text-[#1a1a2e] transition-all">
                            <Play size={14} fill="currentColor" /> TX Signal
                        </button>
                        <button onClick={() => playSignal('demodulated')} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-xs font-bold hover:bg-green-500 hover:text-[#1a1a2e] transition-all">
                            <Activity size={14} /> RX Recovery
                        </button>
                    </div>
                </div>

                {/* View mode tabs */}
                <div className="flex items-center gap-1 px-8 py-2 border-b border-[#00d4ff]/10 bg-[#1a1a2e]/10">
                    {viewModes.map(vm => {
                        const disabled = vm.digitalOnly && !isDigital;
                        return (
                            <button
                                key={vm.id}
                                onClick={() => !disabled && setViewMode(vm.id)}
                                disabled={disabled}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    viewMode === vm.id
                                    ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white'
                                    : disabled
                                    ? 'bg-white/2 border-white/5 text-gray-600 cursor-not-allowed'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {vm.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main content */}
                <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
                    {viewMode === 'time' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            <div className={isDigital && constellation.length > 0 ? "lg:col-span-1 h-[300px]" : "lg:col-span-2 h-[300px]"}>
                                <AdvancedVisualizer
                                    title="Transmitted Modulated Waveform"
                                    layers={[{ data: signals.modulated, color: '#00d4ff', label: 'Modulated' }]}
                                    externalZoom={syncView ? sharedZoom : undefined}
                                    externalOffset={syncView ? sharedOffset : undefined}
                                    onViewChange={syncView ? handleViewChange : undefined}
                                />
                            </div>

                            {isDigital && constellation.length > 0 && (
                                <div className="lg:col-span-1 h-[300px]">
                                    <ConstellationDiagram points={constellation} title="Constellation Diagram (I/Q)" />
                                </div>
                            )}

                            <div className="relative h-[250px]">
                                <AdvancedVisualizer
                                    title="Recovery Comparison (Original vs Recovered)"
                                    layers={[
                                        { data: signals.message, color: 'rgba(102, 153, 255, 0.5)', label: 'Message' },
                                        { data: signals.demodulated, color: '#ff8844', label: 'Demodulated' }
                                    ]}
                                    externalZoom={syncView ? sharedZoom : undefined}
                                    externalOffset={syncView ? sharedOffset : undefined}
                                    onViewChange={syncView ? handleViewChange : undefined}
                                />
                                <div className="absolute top-10 right-4 text-xs font-mono font-bold" style={{color: corrColor}}>
                                    Corr: {(metrics.correlation * 100).toFixed(0)}%
                                </div>
                            </div>

                            <div className="h-[250px]">
                                <AdvancedVisualizer
                                    title="Ideal Recovery (Perfect Channel)"
                                    layers={[
                                        { data: signals.message, color: 'rgba(102, 153, 255, 0.5)', label: 'Message' },
                                        { data: signals.demodIdeal, color: '#44ff88', label: 'Ideal' }
                                    ]}
                                    externalZoom={syncView ? sharedZoom : undefined}
                                    externalOffset={syncView ? sharedOffset : undefined}
                                    onViewChange={syncView ? handleViewChange : undefined}
                                />
                            </div>
                        </div>
                    )}

                    {viewMode === 'spectrum' && (
                        <div className="h-[500px]">
                            <SpectrumVisualizer
                                spectrum={signals.spectrum}
                                sampleRate={sampleRate}
                                carrierFreq={carrierFreq}
                                msgFreq={msgFreq}
                                title="Frequency Spectrum (FFT)"
                            />
                        </div>
                    )}

                    {viewMode === 'chain' && (
                        <div className="h-full min-h-[500px]">
                            <ChainView signals={signals} />
                        </div>
                    )}

                    {viewMode === 'waterfall' && (
                        <div className="h-[500px]">
                            <WaterfallView spectrum={signals.spectrum} sampleRate={sampleRate} title="Waterfall Spectrogram" />
                        </div>
                    )}

                    {viewMode === 'eye' && isDigital && (
                        <div className="h-[500px]">
                            <EyeDiagram signal={signals.modulated} samplesPerSymbol={samplesPerSymbol} title="Eye Diagram" />
                        </div>
                    )}
                </div>
            </main>

            <aside className={`w-96 flex-shrink-0 transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
                <ModulationGuide type={modulation} />
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-[#1a1a2e] border border-[#00d4ff]/30 rounded-l-xl text-[#00d4ff] z-10"
                >
                    <BookOpen size={20} />
                </button>
            </aside>

            <BERCurveModal
                isOpen={berModalOpen}
                onClose={() => setBerModalOpen(false)}
                currentModulation={modulation}
                currentSnr={snr}
            />
        </div>
    );
};

export default App;
