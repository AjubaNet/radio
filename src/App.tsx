import React, { useState } from 'react';
import { useRadio } from './hooks/useRadio';
import { useTheme } from './hooks/useTheme';
import { AdvancedVisualizer } from './components/visualization/AdvancedVisualizer';
import { ConstellationDiagram } from './components/visualization/ConstellationDiagram';
import { SpectrumVisualizer } from './components/visualization/SpectrumVisualizer';
import { EyeDiagram } from './components/visualization/EyeDiagram';
import { WaterfallView } from './components/visualization/WaterfallView';
import { ChainView } from './components/visualization/ChainView';
import { BERCurveModal } from './components/ui/BERCurveModal';
import { UserGuide } from './components/ui/UserGuide';
import { DemoMode } from './components/ui/DemoMode';
import { ModulationGuide } from './components/educational/ModulationGuide';
import type { ModulationType, ModulationCategory } from './types/radio';
import { Radio, Settings2, Play, Download, Share2, Layers, BookOpen, Music, Link, Link2Off, Waves, TrendingUp, HelpCircle, Presentation, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const {
        modulation, messageType, carrierFreq, msgFreq, modIndex, snr, sampleRate, bitRate,
        signals, metrics, constellation,
        deterministicBits, setDeterministicBits,
        setCarrierFreq, setMsgFreq, setModIndex, setSnr, setMessageType, setSampleRate, setBitRate,
        handleModulationChange, playSignal, playMelody,
        exportWAV, copyParams, exportPDF
    } = useRadio();

    const [activeTab, setActiveTab] = useState<ModulationCategory>('analog');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [syncView, setSyncView] = useState(true);
    const [sharedZoom, setSharedZoom] = useState(1);
    const [sharedOffset, setSharedOffset] = useState(0);
    const [viewMode, setViewMode] = useState<'time'|'spectrum'|'chain'|'waterfall'|'eye'>('time');
    const [berModalOpen, setBerModalOpen] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [demoOpen, setDemoOpen] = useState(false);
    const [demoPanelHighlight, setDemoPanelHighlight] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [copyToast, setCopyToast] = useState(false);
    const [selectedMelody, setSelectedMelody] = useState<'twinkle'|'mary'|'baa'|null>(null);
    const [showMelodyPanel, setShowMelodyPanel] = useState(false);

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
        { id: 'sine',     label: 'Sine',     title: 'Continuous sine wave' },
        { id: 'square',   label: 'Square',   title: 'Square wave (±1 at message freq)' },
        { id: 'sawtooth', label: 'Sawtooth', title: 'Sawtooth/ramp wave' },
        { id: 'triangle', label: 'Triangle', title: 'Triangle wave' },
        { id: 'noise',    label: 'Noise',    title: 'White Gaussian noise as message' },
        { id: 'digital',  label: 'Digital',  title: 'Binary ±1 pulse train (NRZ bit stream)' },
        { id: 'melody',   label: '🎵 Melody', title: 'Multi-note melody (Twinkle) as message' },
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

    const samplesPerSymbol = Math.max(1, Math.floor(sampleRate / bitRate));

    return (
        <div className={`flex h-screen text-gray-100 overflow-hidden font-sans theme-app ${theme === 'light' ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
            style={{ background: 'var(--bg-app)', color: 'var(--text-pri)' }}
        >
            {/* Left sidebar */}
            <aside className="w-80 flex flex-col border-r backdrop-blur-xl theme-surface"
                style={{ borderColor: 'var(--border-sub)', background: 'var(--bg-surface)' }}
            >
                <header className="p-6 border-b" style={{ borderColor: 'var(--border-acc)', background: 'var(--bg-card)' }}>
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
                                    title={mt.title}
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

                        {isDigital && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400">Bit Rate</span>
                                    <span className="text-[#00d4ff] font-mono">{bitRate} bps</span>
                                </div>
                                <input type="range" min="100" max="3200" step="100" value={bitRate} onChange={(e) => setBitRate(parseInt(e.target.value))} className="w-full accent-[#00d4ff] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-400">Sample Rate</span>
                                <span className="text-[#00d4ff] font-mono">{(sampleRate / 1000).toFixed(1)} kHz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {[8000, 22050, 44100].map(sr => (
                                    <button key={sr} onClick={() => setSampleRate(sr)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${sampleRate === sr ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                                        {sr === 8000 ? '8k' : sr === 22050 ? '22k' : '44k'}
                                    </button>
                                ))}
                            </div>
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
                                <button onClick={() => { exportPDF(); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-purple-500/10 hover:text-white transition-colors border-t border-white/5">
                                    📄 Export PDF Report
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
                <div className="flex items-center justify-between px-8 backdrop-blur-sm border-b" style={{minHeight: '4rem', background: 'var(--bg-surface)', borderColor: 'var(--border-sub)'}}>
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
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all bg-white/5 border-white/10 hover:bg-white/10"
                            style={{ color: 'var(--text-sec)' }}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                        <button onClick={() => setBerModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-bold hover:bg-purple-500 hover:text-white transition-all">
                            <TrendingUp size={14} /> BER Curves
                        </button>
                        <button onClick={() => setDemoOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400 text-xs font-bold hover:bg-teal-500 hover:text-white transition-all">
                            <Presentation size={14} /> Demo
                        </button>
                        <button onClick={() => setHelpModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 text-xs font-bold hover:bg-indigo-500 hover:text-white transition-all">
                            <HelpCircle size={14} /> Help
                        </button>
                        <button
                            onClick={() => setShowMelodyPanel(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                                showMelodyPanel
                                ? 'bg-amber-500/30 border-amber-500/60 text-amber-300'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-[#1a1a2e]'
                            }`}
                        >
                            <Music size={14} /> Melody
                        </button>
                    </div>
                </div>

                {/* Melody selector panel */}
                {showMelodyPanel && (
                    <div className="px-8 py-3 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-4">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap">🎵 Signal Source</span>
                        <div className="flex items-center gap-2">
                            {([
                                { key: null,       label: 'Tone (continuous)' },
                                { key: 'twinkle',  label: 'Twinkle, Twinkle' },
                                { key: 'mary',     label: 'Mary Had a Little Lamb' },
                                { key: 'baa',      label: 'Baa, Baa, Black Sheep' },
                            ] as const).map(m => (
                                <button
                                    key={m.key ?? 'none'}
                                    onClick={() => setSelectedMelody(m.key)}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                        selectedMelody === m.key
                                        ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-amber-500/40 hover:text-amber-300'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        {selectedMelody && (
                            <div className="flex items-center gap-2 ml-2">
                                <button
                                    onClick={() => playMelody(selectedMelody, 'original')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/40 transition-all"
                                >
                                    <Play size={10} fill="currentColor" /> Original
                                </button>
                                <button
                                    onClick={() => playMelody(selectedMelody, 'modulated')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-[#00d4ff]/20 border border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/40 transition-all"
                                >
                                    <Play size={10} fill="currentColor" /> TX (modulated)
                                </button>
                                <button
                                    onClick={() => playMelody(selectedMelody, 'demodulated')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/40 transition-all"
                                >
                                    <Play size={10} fill="currentColor" /> RX (recovered)
                                </button>
                                <span className="text-[10px] text-gray-500">← Compare quality!</span>
                            </div>
                        )}
                    </div>
                )}

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
                                    infoText="The carrier wave has been modified (modulated) to carry your message. In AM, the amplitude envelope follows the message. In FM, the frequency visibly varies with the message. In digital mods, look for phase flips or amplitude changes at symbol boundaries. Compare this to the Message and Carrier panels in Chain view."
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
                                    infoText="Blue = original message signal. Orange = demodulated signal through the noisy channel. Ideally these overlap perfectly. Reduce SNR on the slider to watch the orange trace diverge from blue — that divergence is noise-induced distortion. The Correlation % (top right) quantifies alignment: 100% = perfect, <80% = noticeable degradation, <50% = poor."
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
                                    infoText="Same demodulation algorithm, but zero noise applied. This is the theoretical best-case output. Comparing this to the Recovery Comparison panel isolates noise impact from demodulator distortion. If Ideal Recovery doesn't match the message, the demodulator or parameters need adjustment. If it matches but noisy recovery doesn't — that's pure noise degradation."
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
                                modulation={modulation}
                                modIndex={modIndex}
                                bitRate={bitRate}
                                title="Frequency Spectrum (FFT)"
                            />
                        </div>
                    )}

                    {viewMode === 'chain' && (
                        <div className="h-full min-h-[500px]">
                            <ChainView
                                signals={signals}
                                highlightedPanel={demoPanelHighlight}
                                externalZoom={syncView ? sharedZoom : undefined}
                                externalOffset={syncView ? sharedOffset : undefined}
                                onViewChange={syncView ? handleViewChange : undefined}
                            />
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

            <UserGuide
                isOpen={helpModalOpen}
                onClose={() => setHelpModalOpen(false)}
            />

            <DemoMode
                isOpen={demoOpen}
                onClose={() => { setDemoOpen(false); setDemoPanelHighlight(null); }}
                onViewChange={(mode) => setViewMode(mode)}
                onPanelHighlight={(panel) => setDemoPanelHighlight(panel)}
                onPlayAudio={(type) => playSignal(type)}
            />
        </div>
    );
};

export default App;
