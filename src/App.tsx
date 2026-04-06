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

    // Dynamic colors based on theme
    const snrColor = snr >= 30 ? '#22c55e' : snr >= 15 ? '#f59e0b' : '#ef4444';
    const corrColor = metrics.correlation > 0.9 ? '#22c55e' : metrics.correlation > 0.6 ? '#f59e0b' : '#ef4444';

    const viewModes: {id: 'time'|'spectrum'|'chain'|'waterfall'|'eye', label: string, digitalOnly?: boolean}[] = [
        { id: 'time', label: 'Time' },
        { id: 'spectrum', label: 'Spectrum' },
        { id: 'chain', label: 'Chain' },
        { id: 'waterfall', label: 'Waterfall' },
        { id: 'eye', label: 'Eye', digitalOnly: true },
    ];

    const samplesPerSymbol = Math.max(1, Math.floor(sampleRate / bitRate));

    return (
        <div className={`flex h-screen text-gray-100 overflow-hidden font-sans theme-app transition-colors duration-200 ${theme === 'light' ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
            style={{ background: 'var(--bg-app)', color: 'var(--text-pri)' }}
        >
            {/* Left sidebar */}
            <aside className="w-80 flex flex-col border-r shadow-lg z-20 transition-colors duration-200"
                style={{ borderColor: 'var(--border-sub)', background: 'var(--bg-surface)' }}
            >
                <header className="p-6 border-b transition-colors duration-200" style={{ borderColor: 'var(--border-sub)', background: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
                            <Radio size={24} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase italic" style={{ color: 'var(--text-pri)' }}>RadioLab v2</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                            <Waves size={12} /> Message Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {messageTypes.map(mt => (
                                <button
                                    key={mt.id}
                                    onClick={() => setMessageType(mt.id)}
                                    title={mt.title}
                                    className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all border"
                                    style={{
                                        borderColor: messageType === mt.id ? 'var(--accent)' : 'var(--border-sub)',
                                        backgroundColor: messageType === mt.id ? 'var(--bg-accent-sub)' : 'var(--bg-input)',
                                        color: messageType === mt.id ? 'var(--accent)' : 'var(--text-sec)'
                                    }}
                                >
                                    {mt.label}
                                </button>
                            ))}
                        </div>
                        {isDigital && (
                            <button
                                onClick={() => setDeterministicBits(!deterministicBits)}
                                className="w-full px-3 py-2 rounded-lg text-[10px] font-bold border transition-all"
                                style={{
                                    borderColor: deterministicBits ? '#f59e0b' : 'var(--border-sub)',
                                    backgroundColor: deterministicBits ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)',
                                    color: deterministicBits ? '#f59e0b' : 'var(--text-sec)'
                                }}
                            >
                                {deterministicBits ? '🔒 Deterministic Bits' : '🎲 Random Bits'}
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                            <Layers size={12} /> Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className="px-3 py-2 rounded-lg text-xs font-bold transition-all border"
                                    style={{
                                        borderColor: activeTab === cat.id ? 'var(--accent)' : 'var(--border-sub)',
                                        backgroundColor: activeTab === cat.id ? 'var(--accent)' : 'var(--bg-input)',
                                        color: activeTab === cat.id ? 'var(--text-on-accent)' : 'var(--text-sec)',
                                        boxShadow: activeTab === cat.id ? '0 4px 12px var(--shadow)' : 'none'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                            <Settings2 size={12} /> Modulation
                        </label>
                        <div className="flex flex-col gap-2">
                            {modsByCategory[activeTab].map(mod => (
                                <button
                                    key={mod}
                                    onClick={() => handleModulationChange(mod)}
                                    className="px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border flex items-center justify-between"
                                    style={{
                                        borderColor: modulation === mod ? 'var(--accent)' : 'var(--border-sub)',
                                        backgroundColor: modulation === mod ? 'var(--bg-accent-sub)' : 'var(--bg-input)',
                                        color: modulation === mod ? 'var(--accent)' : 'var(--text-sec)'
                                    }}
                                >
                                    {mod.toUpperCase()}
                                    {modulation === mod && <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t" style={{ borderColor: 'var(--border-sub)' }}>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span style={{ color: 'var(--text-sec)' }}>Carrier Freq</span>
                                <span className="font-mono" style={{ color: 'var(--accent)' }}>{carrierFreq}Hz</span>
                            </div>
                            <input type="range" min="100" max="5000" step="100" value={carrierFreq} onChange={(e) => setCarrierFreq(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span style={{ color: 'var(--text-sec)' }}>Message Freq</span>
                                <span className="font-mono" style={{ color: 'var(--accent)' }}>{msgFreq}Hz</span>
                            </div>
                            <input type="range" min="1" max="500" step="1" value={msgFreq} onChange={(e) => setMsgFreq(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span style={{ color: 'var(--text-sec)' }}>Mod Index</span>
                                <span className="font-mono" style={{ color: 'var(--accent)' }}>{modIndex.toFixed(2)}</span>
                            </div>
                            <input type="range" min="0" max="5" step="0.05" value={modIndex} onChange={(e) => setModIndex(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span style={{ color: 'var(--text-sec)' }}>Channel SNR</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: snrColor}} />
                                    <span className="font-mono" style={{ color: 'var(--accent)' }}>{snr}dB</span>
                                    <button onClick={() => handleModulationChange(modulation)} className="text-[9px] font-bold uppercase tracking-wider transition-colors" style={{ color: 'var(--text-muted)' }}>⚡ Reset</button>
                                </div>
                            </div>
                            <input type="range" min="-10" max="40" step="1" value={snr} onChange={(e) => setSnr(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                        </div>

                        {isDigital && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold">
                                    <span style={{ color: 'var(--text-sec)' }}>Bit Rate</span>
                                    <span className="font-mono" style={{ color: 'var(--accent)' }}>{bitRate} bps</span>
                                </div>
                                <input type="range" min="100" max="3200" step="100" value={bitRate} onChange={(e) => setBitRate(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span style={{ color: 'var(--text-sec)' }}>Sample Rate</span>
                                <span className="font-mono" style={{ color: 'var(--accent)' }}>{(sampleRate / 1000).toFixed(1)} kHz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {[8000, 22050, 44100].map(sr => (
                                    <button key={sr} onClick={() => setSampleRate(sr)}
                                        className="px-2 py-1 rounded text-[10px] font-bold border transition-all"
                                        style={{
                                            borderColor: sampleRate === sr ? 'var(--accent)' : 'var(--border-sub)',
                                            backgroundColor: sampleRate === sr ? 'var(--bg-accent-sub)' : 'var(--bg-input)',
                                            color: sampleRate === sr ? 'var(--accent)' : 'var(--text-sec)'
                                        }}>
                                        {sr === 8000 ? '8k' : sr === 22050 ? '22k' : '44k'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-6 border-t grid grid-cols-2 gap-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}>
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all border"
                            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-sub)', color: 'var(--text-sec)' }}
                        >
                            <Download size={16} /> <span className="text-[10px] font-bold uppercase">Export</span>
                        </button>
                        {showExportMenu && (
                            <div className="absolute bottom-full mb-2 left-0 border rounded-xl overflow-hidden shadow-xl z-10 w-52"
                                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-acc)' }}>
                                <button onClick={() => { exportWAV('demodulated'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs transition-colors" style={{ color: 'var(--text-sec)' }}>
                                    🎵 Export WAV (demodulated)
                                </button>
                                <button onClick={() => { exportWAV('message'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs transition-colors border-t" style={{ color: 'var(--text-sec)', borderColor: 'var(--border-sub)' }}>
                                    🎵 Export WAV (message)
                                </button>
                                <button onClick={() => { exportPDF(); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs transition-colors border-t" style={{ color: 'var(--text-sec)', borderColor: 'var(--border-sub)' }}>
                                    📄 Export PDF Report
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={handleCopyParams}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all border"
                            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-sub)', color: 'var(--text-sec)' }}
                        >
                            <Share2 size={16} /> <span className="text-[10px] font-bold uppercase">{copyToast ? 'Copied!' : 'Share'}</span>
                        </button>
                    </div>
                </footer>
            </aside>

            <main className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg-app)' }}>
                {/* Metrics header */}
                <div className="flex items-center justify-between px-8 border-b transition-colors duration-200" style={{minHeight: '4rem', background: 'var(--bg-surface)', borderColor: 'var(--border-sub)'}}>
                    <div className="flex gap-6 flex-wrap">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Measured SNR</span>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: snrColor}} />
                                <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-pri)' }}>{metrics.snr.toFixed(1)} dB</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Occupied BW</span>
                            <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-pri)' }}>{(metrics.bandwidth / 1000).toFixed(2)} kHz</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>BER</span>
                            <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-pri)' }}>
                                {isDigital && isFinite(metrics.ber) ? metrics.ber.toExponential(2) : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Peak Power</span>
                            <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-pri)' }}>{isFinite(metrics.peakPower) ? metrics.peakPower.toFixed(1) + ' dBm' : 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <button 
                                onClick={() => setSyncView(!syncView)}
                                className="flex items-center gap-2 px-3 py-1 rounded-full border transition-all mt-1"
                                style={{
                                    borderColor: syncView ? 'var(--accent)' : 'var(--border-sub)',
                                    backgroundColor: syncView ? 'var(--bg-accent-sub)' : 'var(--bg-input)',
                                    color: syncView ? 'var(--accent)' : 'var(--text-muted)'
                                }}
                            >
                                {syncView ? <Link size={12} /> : <Link2Off size={12} />}
                                <span className="text-[10px] font-bold uppercase">Sync</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all shadow-sm"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-sub)', color: 'var(--text-sec)' }}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-indigo-600" />}
                        </button>
                        <button onClick={() => setBerModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all shadow-sm"
                            style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)', color: '#a855f7' }}>
                            <TrendingUp size={14} /> BER Curves
                        </button>
                        <button onClick={() => setDemoOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all shadow-sm"
                            style={{ background: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.3)', color: '#14b8a6' }}>
                            <Presentation size={14} /> Demo
                        </button>
                        <button onClick={() => setHelpModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all shadow-sm"
                            style={{ background: 'rgba(79, 70, 229, 0.1)', borderColor: 'rgba(79, 70, 229, 0.3)', color: '#4f46e5' }}>
                            <HelpCircle size={14} /> Help
                        </button>
                        <button
                            onClick={() => setShowMelodyPanel(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all shadow-sm"
                            style={{ 
                                background: showMelodyPanel ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)', 
                                borderColor: 'rgba(245, 158, 11, 0.3)', 
                                color: '#f59e0b' 
                            }}
                        >
                            <Music size={14} /> Melody
                        </button>
                    </div>
                </div>

                {/* Melody selector panel */}
                {showMelodyPanel && (
                    <div className="px-8 py-3 border-b flex items-center gap-4 transition-colors duration-200" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-sub)' }}>
                        <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: '#f59e0b' }}>🎵 Signal Source</span>
                        <div className="flex items-center gap-2">
                            {([
                                { key: null,       label: 'Tone' },
                                { key: 'twinkle',  label: 'Twinkle' },
                                { key: 'mary',     label: 'Mary' },
                                { key: 'baa',      label: 'Baa Baa' },
                            ] as const).map(m => (
                                <button
                                    key={m.key ?? 'none'}
                                    onClick={() => setSelectedMelody(m.key)}
                                    className="px-3 py-1 rounded-lg text-[11px] font-bold border transition-all"
                                    style={{
                                        borderColor: selectedMelody === m.key ? '#f59e0b' : 'var(--border-sub)',
                                        backgroundColor: selectedMelody === m.key ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-input)',
                                        color: selectedMelody === m.key ? '#f59e0b' : 'var(--text-sec)'
                                    }}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        {selectedMelody && (
                            <div className="flex items-center gap-2 ml-2">
                                <button
                                    onClick={() => playMelody(selectedMelody, 'original')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all border"
                                    style={{ background: 'rgba(79, 70, 229, 0.1)', borderColor: 'rgba(79, 70, 229, 0.3)', color: '#4f46e5' }}
                                >
                                    <Play size={10} fill="currentColor" /> Original
                                </button>
                                <button
                                    onClick={() => playMelody(selectedMelody, 'modulated')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all border"
                                    style={{ background: 'var(--bg-accent-sub)', borderColor: 'var(--border-acc)', color: 'var(--accent)' }}
                                >
                                    <Play size={10} fill="currentColor" /> TX
                                </button>
                                <button
                                    onClick={() => playMelody(selectedMelody, 'demodulated')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all border"
                                    style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }}
                                >
                                    <Play size={10} fill="currentColor" /> RX
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* View mode tabs */}
                <div className="flex items-center gap-1 px-8 py-2 border-b transition-colors duration-200" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-sub)' }}>
                    {viewModes.map(vm => {
                        const disabled = vm.digitalOnly && !isDigital;
                        const active = viewMode === vm.id;
                        return (
                            <button
                                key={vm.id}
                                onClick={() => !disabled && setViewMode(vm.id)}
                                disabled={disabled}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all border"
                                style={{
                                    borderColor: active ? 'var(--accent)' : 'transparent',
                                    backgroundColor: active ? 'var(--bg-accent-sub)' : 'transparent',
                                    color: active ? 'var(--accent)' : disabled ? 'var(--text-muted)' : 'var(--text-sec)',
                                    opacity: disabled ? 0.5 : 1
                                }}
                            >
                                {vm.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main content */}
                <div className="flex-1 p-6 overflow-y-auto scrollbar-hide" style={{ background: 'var(--bg-app)' }}>
                    {viewMode === 'time' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className={isDigital && constellation.length > 0 ? "lg:col-span-1 h-[300px]" : "lg:col-span-2 h-[300px]"}>
                                <AdvancedVisualizer
                                    title="Transmitted Modulated Waveform"
                                    infoText="The carrier wave has been modified (modulated) to carry your message. In AM, the amplitude envelope follows the message. In FM, the frequency visibly varies with the message."
                                    layers={[{ data: signals.modulated, color: 'var(--accent)', label: 'Modulated' }]}
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
                                    infoText="Blue = original message signal. Orange = demodulated signal through the noisy channel. Ideally these overlap perfectly."
                                    layers={[
                                        { data: signals.message, color: '#3b82f6', label: 'Message' },
                                        { data: signals.demodulated, color: '#f59e0b', label: 'Demodulated' }
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
                                    infoText="Same demodulation algorithm, but zero noise applied. This is the theoretical best-case output."
                                    layers={[
                                        { data: signals.message, color: '#3b82f6', label: 'Message' },
                                        { data: signals.demodIdeal, color: '#22c55e', label: 'Ideal' }
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

            <aside className={`w-96 flex-shrink-0 transition-all duration-300 transform border-l z-20 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-sub)' }}
            >
                <ModulationGuide type={modulation} />
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 border rounded-l-xl z-10 transition-colors"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-acc)', color: 'var(--accent)' }}
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
