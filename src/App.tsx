import React from 'react';
import './styles/App.css';
import { useRadio } from './hooks/useRadio';
import Visualizer from './components/Visualizer';
import { MODULATION_INFO } from './constants/modulation';

const App: React.FC = () => {
    const {
        modulation,
        carrierFreq,
        msgFreq,
        modIndex,
        snr,
        signals,
        metrics,
        setCarrierFreq,
        setMsgFreq,
        setModIndex,
        setSnr,
        handleModulationChange,
        playSignal
    } = useRadio();

    const currentInfo = MODULATION_INFO[modulation as keyof typeof MODULATION_INFO];

    return (
        <div className="radio-container">
            <header className="radio-header">
                <h1>Radio Modulation/Demodulation</h1>
                <nav>
                    <a href="https://github.com/AjubaNet/radio" className="nav-link" target="_blank" rel="noopener noreferrer">GitHub Repo</a>
                </nav>
            </header>

            <main className="radio-content">
                <aside className="control-panel">
                    <div className="category-tabs">
                        <button className={`category-tab ${['am', 'fm', 'pm'].includes(modulation) ? 'active' : ''}`} onClick={() => handleModulationChange('am')}>Analog</button>
                        <button className={`category-tab ${['ask', 'fsk', 'psk', 'qam'].includes(modulation) ? 'active' : ''}`} onClick={() => handleModulationChange('ask')}>Digital</button>
                        <button className={`category-tab ${['pam', 'pwm', 'ppm', 'pcm'].includes(modulation) ? 'active' : ''}`} onClick={() => handleModulationChange('pam')}>Pulse</button>
                        <button className={`category-tab ${['dsss', 'fhss'].includes(modulation) ? 'active' : ''}`} onClick={() => handleModulationChange('dsss')}>Spread</button>
                    </div>

                    <div className="modulation-selector">
                        <select value={modulation} onChange={(e) => handleModulationChange(e.target.value)}>
                            {Object.entries(MODULATION_INFO).map(([key, info]) => (
                                <option key={key} value={key}>{info.name}</option>
                            ))}
                        </select>
                        {currentInfo && <div className="description">{currentInfo.abbreviation}</div>}
                    </div>

                    <div className="control-group">
                        <label>Carrier Frequency (fc): {carrierFreq} Hz</label>
                        <input type="range" min="100" max="10000" step="100" value={carrierFreq} onChange={(e) => setCarrierFreq(parseInt(e.target.value))} />
                    </div>

                    <div className="control-group">
                        <label>Message Frequency (fm): {msgFreq} Hz</label>
                        <input type="range" min="1" max="1000" step="1" value={msgFreq} onChange={(e) => setMsgFreq(parseInt(e.target.value))} />
                    </div>

                    <div className="control-group">
                        <label>Modulation Index (m): {modIndex.toFixed(1)}</label>
                        <input type="range" min="0" max="10" step="0.1" value={modIndex} onChange={(e) => setModIndex(parseFloat(e.target.value))} />
                    </div>

                    <div className="control-group">
                        <label>Channel SNR: {snr} dB</label>
                        <input type="range" min="-10" max="40" step="1" value={snr} onChange={(e) => setSnr(parseInt(e.target.value))} />
                    </div>

                    <div className="playback-controls">
                        <button onClick={() => playSignal('carrier')}>Play Carrier</button>
                        <button onClick={() => playSignal('message')}>Play Message</button>
                        <button onClick={() => playSignal('modulated')}>Play Modulated</button>
                        <button onClick={() => playSignal('demodulated')}>Play Demodulated</button>
                    </div>
                </aside>

                <section className="visualization-panel">
                    <div className="metrics-display">
                        <div className="metric-item"><div className="metric-label">SNR</div><div className="metric-value">{metrics.snr.toFixed(1)} dB</div></div>
                        <div className="metric-item"><div className="metric-label">BER</div><div className="metric-value">{metrics.ber.toFixed(2)} %</div></div>
                        <div className="metric-item"><div className="metric-label">Bandwidth</div><div className="metric-value">{(metrics.bandwidth/1000).toFixed(2)} kHz</div></div>
                        <div className="metric-item"><div className="metric-label">Peak Power</div><div className="metric-value">{metrics.peakPower.toFixed(1)} dBm</div></div>
                    </div>

                    <div className="canvas-container primary">
                        <Visualizer signal={signals.modulated} label="Modulated Signal" />
                    </div>

                    <div className="canvas-container secondary">
                        <Visualizer signal={signals.demodulated} label="Demodulated Signal (with noise)" color="#ff8844" />
                    </div>
                    
                    <div className="canvas-container secondary">
                        <Visualizer signal={signals.demodIdeal} label="Demodulated Signal (Ideal)" color="#44ff88" />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default App;
