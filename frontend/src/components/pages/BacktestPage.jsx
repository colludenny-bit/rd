import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Line, useVideoTexture, useAspect } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '../ui/button';
import {
    TrendingUp, TrendingDown, Activity, Database, Zap, Binary, Clock,
    Network, ShieldAlert, Code2, Server, Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Bar
} from 'recharts';
import { toast } from 'sonner';

const TARGET_SCALE = new THREE.Vector3(1, 1, 1);


/* =========================================================================
   UTILITY: Hacker/Quant Glowing Text Parser
   ========================================================================= */
const highlightTechText = (text) => {
    let html = text;

    // Highlight bracketed prefixes (e.g. [SYSTEM])
    html = html.replace(/(\[.*?\])/g, '<span class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)] font-bold tracking-widest">$1</span>');

    // Highlight keywords
    const keywords = ['WARNING', 'FAIL', 'SUCCESS', 'TENSOR_MULT', 'EIGEN_VAL', 'MATRIX_INV', 'GRAD_DESC', 'VOL_SURFACE'];
    keywords.forEach(kw => {
        const regex = new RegExp(`(${kw})`, 'g');
        const color = kw === 'FAIL' || kw === 'WARNING' ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,1)]' :
            kw === 'SUCCESS' ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,1)]' :
                'text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,1)]';
        html = html.replace(regex, `<span class="${color} font-black animate-pulse">$1</span>`);
    });

    // Highlight Numbers and Percentages
    // Needs careful regex so we don't accidentally match HTML tags or previously replaced stuff.
    // Replace standalone digits or simple decimals
    html = html.replace(/(?<!<[^>]*)\b(\d+(\.\d+)?(%|ms|GB|M)?)\b(?![^<]*>)/g, '<span class="text-primary drop-shadow-[0_0_5px_rgba(0,217,165,1)] font-bold">$1</span>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};


/* =========================================================================
   3D ADVANCED AI SYSTEM (007 STYLE)
   ========================================================================= */
const NeuralNodes = ({ count, radius, mainColor, isRunning, speedRef }) => {
    const nodesRef = useRef();

    // Instantiate 3D positions for the outer floating layer
    const nodes = useMemo(() => {
        return Array.from({ length: count }).map(() => {
            const r = radius + (Math.random() - 0.5) * 12; // Bigger spread
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            return {
                pos: [
                    r * Math.sin(phi) * Math.cos(theta),
                    r * Math.sin(phi) * Math.sin(theta),
                    r * Math.cos(phi)
                ]
            }
        });
    }, [count, radius]);

    useFrame(({ clock }) => {
        if (nodesRef.current) {
            const currentSpeed = speedRef.current;
            nodesRef.current.rotation.y += currentSpeed * 0.005;
            nodesRef.current.rotation.z += Math.sin(clock.getElapsedTime()) * currentSpeed * 0.001;
        }
    });

    return (
        <group ref={nodesRef}>
            {nodes.map((n, i) => (
                <mesh key={i} position={n.pos}>
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshBasicMaterial color={i % 4 === 0 ? '#ffffff' : mainColor} transparent opacity={isRunning ? 1 : 0.6} />
                </mesh>
            ))}
            {/* Draw tech lines between some nodes */}
            {nodes.slice(0, 20).map((n, i) => (
                <Line
                    key={`line-${i}`}
                    points={[n.pos, nodes[(i + 1) % 20].pos]}
                    color={isRunning && i % 2 === 0 ? '#ffffff' : mainColor}
                    transparent
                    opacity={isRunning ? 0.6 : 0.2}
                    lineWidth={1.5}
                />
            ))}
        </group>
    );
};

const ImageMatrixCore = ({ state, resultType }) => {
    const groupRef = useRef();
    const imageRef = useRef();
    const ringsRef = useRef();
    const lightRef = useRef();

    // Load the user's custom animated video ensuring it NEVER pauses
    const texture = useVideoTexture('/videos/efecto-recording-2026-02-22T14-56-17.mp4', {
        loop: true, muted: true, start: true, playsInline: true
    });

    // Calculates the perfect responsive scale without vertical stretching
    const scale = useAspect(
        texture?.image?.videoWidth || 16,
        texture?.image?.videoHeight || 9,
        1
    );

    const speedRef = useRef(1); // Internal speed state
    const phaseRef = useRef(0); // Tracks how far along the 'running' state we are

    const mainColor = state === 'completed'
        ? (resultType === 'positive' ? '#00D9A5' : '#ff3366')
        : '#00D9A5';

    const activeColor = state === 'running' ? '#ffffff' : mainColor;

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        let targetSpeed = 1.0;
        let lerpFactor = 0.05;

        if (state === 'running') {
            phaseRef.current += 0.005;
            if (phaseRef.current < 0.2) {
                targetSpeed = 1 + (phaseRef.current / 0.2) * 5;
                lerpFactor = 0.02;
            } else {
                targetSpeed = 8;
            }
        } else if (state === 'completed') {
            phaseRef.current = 0;
            targetSpeed = 1.5;
            lerpFactor = 0.02;
        } else {
            phaseRef.current = 0;
            targetSpeed = 1.0;
            lerpFactor = 0.05;
        }

        speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, lerpFactor);
        const s = speedRef.current;

        if (groupRef.current) {
            // Very slow, subtle breathing parallax for the whole group
            groupRef.current.position.y = Math.sin(t * 0.5) * 0.5;
            groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.02;
            groupRef.current.rotation.y = Math.cos(t * 0.4) * 0.02;
            // When running, add a tiny bit of chaotic shake to the whole scene
            if (state === 'running') {
                groupRef.current.position.x = (Math.random() - 0.5) * 0.1;
                groupRef.current.position.y += (Math.random() - 0.5) * 0.1;
            } else {
                groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
            }
        }

        if (imageRef.current) {
            // Pulse the emissive intensity based on state so the eye throbs
            const pulseSpeed = state === 'running' ? 4 : 1;
            const pulse = Math.sin(t * pulseSpeed) * (state === 'running' ? 0.3 : 0.1);
            imageRef.current.material.emissiveIntensity = 1.0 + pulse;

            // Glitch effect on scale when running ensures aspect ratio is preserved
            if (state === 'running' && Math.random() > 0.95) {
                imageRef.current.scale.set(scale[0] * 1.02, scale[1] * 1.02, 1);
            } else {
                imageRef.current.scale.lerp(new THREE.Vector3(scale[0], scale[1], 1), 0.1);
            }
        }

        if (ringsRef.current) {
            // Inner interface elements spinning fast in front of the eye
            ringsRef.current.rotation.x += s * 0.01;
            ringsRef.current.rotation.y += s * 0.015;
            ringsRef.current.rotation.z += s * 0.005;
        }

        if (lightRef.current) {
            lightRef.current.intensity = state === 'running' ? 8 + Math.random() * 5 : 2;
            if (state === 'running' && Math.random() > 0.9) {
                lightRef.current.color.set('#ffffff');
            } else {
                lightRef.current.color.set(activeColor);
            }
        }
    });

    return (
        <group ref={groupRef}>
            <ambientLight intensity={1.5} />
            <pointLight ref={lightRef} position={[0, 0, 15]} intensity={2} distance={100} color={activeColor} />

            {/* THE CYBER EYE VIDEO (Video spostato leggermente più in basso) */}
            <mesh ref={imageRef} position={[0, -2.5, -10]} scale={scale}>
                {/* 1x1 plane properly mapped to video's native resolution ratio via useAspect */}
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                    map={texture}
                    emissiveMap={texture}
                    emissive="white"
                    emissiveIntensity={1.5}
                    toneMapped={false}
                    transparent
                    opacity={1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* 3D Interface Rings Floating in Front of the Eye */}
            <group ref={ringsRef} position={[0, 0, -2]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[8, 0.02, 32, 100]} />
                    <meshBasicMaterial color={mainColor} transparent opacity={0.6} />
                </mesh>
                <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                    <torusGeometry args={[11, 0.05, 16, 100]} />
                    <meshBasicMaterial color={activeColor} transparent opacity={state === 'running' ? 0.6 : 0.15} wireframe />
                </mesh>
                <mesh rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[14, 0.01, 32, 100]} />
                    <meshBasicMaterial color={mainColor} transparent opacity={0.3} />
                </mesh>
            </group>

            {/* 3D Nodes around the eye */}
            <NeuralNodes count={40} radius={18} mainColor={mainColor} isRunning={state === 'running'} speedRef={speedRef} />
        </group>
    );
};


/* =========================================================================
   MOCK DATA GENERATORS
   ========================================================================= */
const generateEquityCurve = (trades, base, winRate) => {
    let eq = base;
    const data = [];
    for (let i = 0; i < trades; i++) {
        const isWin = Math.random() < winRate;
        const pnl = isWin ? Math.random() * 200 + 50 : -(Math.random() * 100 + 50);
        eq += pnl;
        data.push({
            trade: `T${i}`,
            equity: eq,
            pnl: pnl
        });
    }
    const maxPoints = 60;
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0);
};

const generateRiskPnlData = (trades, isPositive) => {
    let currentPnl = 0;
    let currentRisk = 0;
    const data = [];
    for (let i = 0; i < trades; i++) {
        // Mock increasing/decreasing trends based on strategy status
        const trend = isPositive ? (Math.random() * 5 - 1) : (Math.random() * 5 - 4);
        currentPnl += trend;

        // Risk usually increases during drawdowns or expands over time
        currentRisk = Math.abs(currentPnl - Math.max(0, currentPnl - (Math.random() * 10))) * -1;

        data.push({
            time: i,
            profit: currentPnl.toFixed(2),
            risk: currentRisk.toFixed(2),
        });
    }
    const maxPoints = 50;
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0);
};

const backtestStrategies = [
    {
        id: 'q2-bb',
        name: 'Bollinger Mean Reversion',
        asset: 'Nasdaq 100 Fut (NQ)',
        timeframe: '1 Ora',
        period: '2 Anni',
        trades: 324,
        winRate: 0.694,
        profit: 8.13,
        rr: '1 : 0.47',
        status: 'positive',
        desc: 'Modello Quant con ingressi chirurgici alle deviazioni standard estreme. Elevata accuratezza.',
        logs: [
            '[SYSTEM] Inizializzazione cluster HFT quantico su 128 cores...',
            '[SYSTEM] Allocazione memoria per matrici Tensoriali (16GB)...',
            '[ENGINE] Connessione al feed dati storico (yfinance UDP stream)...',
            '[ENGINE] Ingestione blocchi: NQ=F (OHLCV 730d, 5.2M ticks)...',
            '[PRE-PROCESS] Normalizzazione Z-Score e pulizia spike anomali...',
            '[QUANT] Calcolo Vettorializzato Array GPU: SMA 200 periodi...',
            '[QUANT] Calcolo Vettorializzato Array GPU: RSI (periodo 2)...',
            '[QUANT] Costruzione Bande di Bollinger dinamiche (std dev = 2.0)...',
            '[QUANT] Sintesi matrice di covarianza e segnali Long/Short...',
            '[TESTER] Avvio simulazione Monte Carlo su Numba compiler...',
            '[TESTER] Analisi Book di mercato e slippage non-lineare...',
            '[TESTER] Trailing Stop Loss dinamico calcolato su ATR(14)...',
            '[TESTER] Elaborazione al 50%: 162 trade trovati...',
            '[TESTER] Elaborazione al 100%: 324 trade eseguiti totali.',
            '[REPORTS] Estrazione curve di Drawdown e Profit Factor...',
            '[SUCCESS] Edge Statistico Verificato. Win Rate 69.4%. Profitto: +8.13%'
        ]
    },
    {
        id: 's1-news',
        name: 'News Spike Reversion',
        asset: 'Nasdaq 100 Fut (NQ)',
        timeframe: '1 Ora',
        period: '2 Anni',
        trades: 236,
        winRate: 0.377,
        profit: -35.75,
        rr: '1 : 1.25',
        status: 'negative',
        desc: 'Fallimento statistico. Le zone premium vengono sfondate dalla volatilità e il R:R non compensa le perdite.',
        logs: [
            '[SYSTEM] Inizializzazione neural network per Event-Driven trading...',
            '[SYSTEM] Caricamento pesi NLP per sentiment analysis macro...',
            '[ENGINE] Acquisizione Tick Data (730d, 3.1M ticks)...',
            '[PRE-PROCESS] Marcatura eventi FOMC, NFP e CPI...',
            '[QUANT] Filtro kalman per rilevazione anomalie volumetriche...',
            '[QUANT] Costruzione cluster di deviazione standard post-news...',
            '[TESTER] Iniettati ordini Limit contrari al trend direzionale...',
            '[TESTER] Analisi impatto spread e distorsione order book...',
            '[TESTER] WARNING: 12 Stop-Loss consecutivi triggerati.',
            '[TESTER] Analisi Drawdown: Superata soglia di rischio del 15%...',
            '[TESTER] Stop-Out in cascata registrati sul fattore Volatilità...',
            '[TESTER] Ricalcolo matrice di transizione di Markov...',
            '[TESTER] Chiusura modello forzata per preservare capitale.',
            '[REPORTS] Generazione heat-map dei fallimenti...',
            '[FAIL] Modello respinto. Rischio di Rovina elevato. Net -35.75%.'
        ]
    }
];

/* =========================================================================
   SIDE PANEL HACKER FEEDS
   ========================================================================= */
const ScrollingHexDump = ({ active }) => {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (!active) return;
        const interval = setInterval(() => {
            const hexArr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase());
            const highlightIdx = Math.floor(Math.random() * 8); // One random hex string glows

            const renderedHex = hexArr.map((h, i) => {
                const isGlow = i === highlightIdx;
                return isGlow ? `<span class="text-white font-bold">${h}</span>` : h;
            }).join(' ');

            const addr = '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase();
            const fullHtml = `<span class="text-green-700 mr-2">${addr}</span> ${renderedHex}`;

            setLines(prev => [...prev.slice(-30), fullHtml]);
        }, 500);
        return () => clearInterval(interval);
    }, [active]);

    return (
        <div className="font-mono text-[10px] sm:text-xs text-green-500/50 leading-tight">
            {lines.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l }} />)}
        </div>
    );
};

const LiveCalculationStream = ({ active }) => {
    const [calcs, setCalcs] = useState([]);
    useEffect(() => {
        if (!active) return;
        const interval = setInterval(() => {
            const types = ['TENSOR_MULT', 'EIGEN_VAL', 'MATRIX_INV', 'GRAD_DESC', 'VOL_SURFACE', 'COVARIANCE'];
            const type = types[Math.floor(Math.random() * types.length)];
            const val = (Math.random() * 9999).toFixed(4);
            const latency = (Math.random() * 5).toFixed(2);
            // Genera stringhe più lunghe simulando le matrici:
            const matrix1 = `[${(Math.random() * 9).toFixed(3)}, ${(Math.random() * 9).toFixed(3)}]`;
            const matrix2 = `[${(Math.random() * 9).toFixed(3)}, ${(Math.random() * 9).toFixed(3)}]`;
            setCalcs(prev => [...prev.slice(-30), `[${type}] λ=${val} | lag:${latency}ms | tensor=${matrix1}x${matrix2} -> SUCCESS`]);
        }, 800);
        return () => clearInterval(interval);
    }, [active]);

    return (
        <div className="font-mono text-[11px] text-blue-400/60 leading-relaxed overflow-hidden flex flex-col items-end">
            {calcs.map((c, i) => (
                <div key={i} className="animate-in slide-in-from-right text-right">
                    {highlightTechText(c)}
                </div>
            ))}
        </div>
    );
};


/* =========================================================================
   TYPEWRITER LOADER
   ========================================================================= */
const QuantumLoaderStatus = ({ state, statusType }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (state === 'idle') {
            setText('');
            return;
        }

        if (state === 'completed') {
            const resultMsg = statusType === 'positive' ? 'SUCCESSO.' : 'FALLIMENTO.';
            const colorClass = statusType === 'positive' ? 'text-green-400' : 'text-red-400';
            setText(`> CARICAMENTO COMPLETATO.\n> STATO: <span class="${colorClass} font-bold">${resultMsg}</span>`);
            return;
        }

        const stages = [
            "CARICAMENTO DATI IN CORSO...",
            "RENDERING CORE 3D...",
            "STATISTICA E ANALISI DATI AVANZATA IN CARICAMENTO...",
            "SINTESI TRAIETTORIE QUANTICHE...",
            "VERIFICA ANOMALIE DI SISTEMA...",
            "ALLINEAMENTO TENSORI E MATRICI..."
        ];

        let currentStage = 0;
        let charIndex = 0;
        let isTyping = true;
        let timeout;

        const typeChar = () => {
            if (isTyping) {
                if (charIndex <= stages[currentStage].length) {
                    setText(`> ${stages[currentStage].substring(0, charIndex)}`);
                    charIndex++;
                    timeout = setTimeout(typeChar, 30 + Math.random() * 40);
                } else {
                    isTyping = false;
                    timeout = setTimeout(typeChar, 1800); // Wait before next message
                }
            } else {
                currentStage = (currentStage + 1) % stages.length;
                charIndex = 0;
                isTyping = true;
                setText('> ');
                timeout = setTimeout(typeChar, 50);
            }
        };

        typeChar();

        return () => clearTimeout(timeout);
    }, [state, statusType]);

    if (state === 'idle') return null;

    return (
        <div className="mt-4 bg-black/80 border border-white/10 p-3 rounded-xl font-mono text-sm sm:text-base text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] h-auto min-h-[4rem] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-white/50 animate-spin-slow" />
                <span className="text-[10px] text-white/50 tracking-widest uppercase">System Initialization</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed flex flex-wrap">
                <span dangerouslySetInnerHTML={{ __html: text }} />
                {(state === 'running' || state === 'completed') && <span className="animate-pulse text-white inline-block w-1.5 bg-white ml-1 h-3.5 mt-0.5"></span>}
            </div>
        </div>
    );
};

/* =========================================================================
   MAIN LAYOUT COMPONENT
   ========================================================================= */
export default function BacktestPage() {
    const [activeTest, setActiveTest] = useState(backtestStrategies[0]);
    const [engineState, setEngineState] = useState('idle'); // idle, running, completed
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [miniChartData, setMiniChartData] = useState([]);

    const runPythonBacktest = () => {
        if (engineState === 'running') return;

        setEngineState('running');
        setTerminalLogs([]);
        setChartData([]);
        setMiniChartData([]);

        let step = 0;
        const logs = activeTest.logs;

        // Long, dramatic execution (~18 seconds total)
        const interval = setInterval(() => {
            if (step < logs.length) {
                setTerminalLogs(prev => [...prev.slice(-50), logs[step]]);
                step++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setEngineState('completed');
                    setChartData(generateEquityCurve(Math.min(activeTest.trades, 80), 10000, activeTest.winRate));
                    setMiniChartData(generateRiskPnlData(60, activeTest.status === 'positive'));
                    toast.success(`Quantum Model Reached Convergence`, { icon: <Zap className="w-5 h-5 text-primary" /> });
                }, 1000); // Dramatic pause at the end
            }
        }, 1000); // 1 sec per log = 16 seconds of pure anxiety
    };

    const selectStrategy = (test) => {
        if (engineState === 'running') return; // block change during run
        setActiveTest(test);
        setEngineState('idle');
        setTerminalLogs([]);
        setChartData([]);
        setMiniChartData([]);
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono flex flex-col relative overflow-hidden">

            {/* FULL SCREEN MASSIVE 3D CANVAS */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 10, 35], fov: 75 }}>
                    <Stars radius={200} depth={100} count={2000} factor={4} saturation={1} fade speed={1} />
                    <ImageMatrixCore state={engineState} resultType={activeTest.status} />
                </Canvas>
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_80%)] pointer-events-none"></div>

                {/* EMP FLASH BANG EFFECT ON COMPLETION (No mix-blend-screen for extreme WebKit perf fix) */}
                <AnimatePresence>
                    {engineState === 'completed' && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2.0, ease: "easeOut" }}
                            className="absolute inset-0 bg-white z-50 pointer-events-none"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* FLOATING HUD UI - ESAGERATO */}
            <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 lg:p-6 h-full pointer-events-none">

                {/* LEFT STRATEGY PANEL (Interactive) */}
                <div className="col-span-1 md:col-span-3 flex flex-col gap-4 pointer-events-auto h-full max-h-screen overflow-y-auto scrollbar-none pb-8">

                    {/* Brand Banner */}
                    <div className="bg-black/60 border border-primary/30 backdrop-blur-xl p-4 rounded-xl shadow-[0_0_30px_rgba(0,217,165,0.15)] flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-widest flex items-center gap-2">
                                <Database className="w-6 h-6 animate-pulse text-white" />
                                QUANT EYE ENGINE
                            </h1>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-dashed border-primary/50 flex items-center justify-center animate-spin-slow">
                            <Network className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    {/* Compact Dropdown Selection */}
                    <div className="flex-1 mt-4">
                        <label className="text-[10px] text-gray-400 tracking-[0.2em] mb-2 block uppercase">Select Strategy Algorithm</label>
                        <div className="relative">
                            <select
                                value={activeTest.id}
                                onChange={(e) => {
                                    const strat = backtestStrategies.find(s => s.id === e.target.value);
                                    if (strat) selectStrategy(strat);
                                }}
                                className="w-full bg-black/80 border border-white/20 text-white text-sm rounded-xl p-4 appearance-none hover:border-white/50 focus:border-primary focus:outline-none transition-colors cursor-pointer font-mono shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                            >
                                {backtestStrategies.map(strat => (
                                    <option key={strat.id} value={strat.id} className="bg-gray-900 text-white">
                                        {strat.name} ({strat.asset} - {strat.timeframe})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Selected Details Preview */}
                        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Active Target</p>
                                <p className="font-bold text-white flex items-center gap-2"><Binary className="w-4 h-4 text-primary" /> {activeTest.asset}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Timeframe</p>
                                <p className="font-bold text-blue-400 flex items-center gap-2 justify-end"><Clock className="w-4 h-4" /> {activeTest.timeframe}</p>
                            </div>
                        </div>

                        {/* LIVE RISK VS PROFIT MINI-CHART */}
                        <AnimatePresence>
                            {engineState === 'completed' && miniChartData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 flex flex-col gap-3"
                                >
                                    <div className="h-40 w-full bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-3 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Risk vs Reward Trajectory</span>
                                            <div className="flex gap-2">
                                                <span className="flex items-center gap-1 text-[8px] text-green-400"><div className="w-2 h-2 rounded-full bg-green-500"></div> PnL</span>
                                                <span className="flex items-center gap-1 text-[8px] text-red-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Risk</span>
                                            </div>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 h-32">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={miniChartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 8, fill: '#666' }} tickLine={false} axisLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333', fontSize: '10px' }}
                                                        labelStyle={{ display: 'none' }}
                                                    />
                                                    <Area type="monotone" dataKey="profit" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#pnlGrad)" isAnimationActive={false} />
                                                    <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" isAnimationActive={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Advanced Metrics */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-black/40 border border-white/5 p-2 rounded-lg text-center backdrop-blur-md">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Profit Fct</p>
                                            <p className="font-bold text-white text-xs mt-1">{activeTest.status === 'positive' ? '2.41' : '0.82'}</p>
                                        </div>
                                        <div className="bg-black/40 border border-white/5 p-2 rounded-lg text-center backdrop-blur-md">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Sharpe</p>
                                            <p className="font-bold text-white text-xs mt-1">{activeTest.status === 'positive' ? '1.85' : '-0.44'}</p>
                                        </div>
                                        <div className="bg-black/40 border border-white/5 p-2 rounded-lg text-center backdrop-blur-md">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Recovery</p>
                                            <p className="font-bold text-white text-xs mt-1">{activeTest.status === 'positive' ? '3.12' : '0.45'}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TYPEWRITER STATUS PANEL */}
                        <AnimatePresence>
                            {engineState !== 'idle' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                    <QuantumLoaderStatus state={engineState} statusType={activeTest.status} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Execution Engine */}
                    <div className="mt-auto">
                        <Button
                            onClick={runPythonBacktest}
                            disabled={engineState === 'running'}
                            className="w-full h-16 rounded-xl font-black bg-gradient-to-r from-primary to-emerald-600 hover:to-emerald-500 text-black text-sm lg:text-base shadow-[0_0_50px_rgba(0,217,165,0.4)] transition-all overflow-hidden relative group whitespace-nowrap"
                        >
                            {engineState === 'running' ? (
                                <span className="flex items-center justify-center gap-2 z-10 relative tracking-[0.15em]"><Cpu className="w-5 h-5 animate-spin" /> SYNTHESIZING...</span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 z-10 relative tracking-[0.15em]"><Zap className="w-5 h-5 fill-black" /> INITIALIZE SEQUENCE</span>
                            )}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                            {engineState === 'running' && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                        </Button>
                    </div>

                </div>

                {/* CENTER AREA - MASSIVE GRAPH AND HUDS */}
                <div className="col-span-1 md:col-span-6 flex flex-col justify-between gap-6 h-full pointer-events-auto">

                    {/* TOP PANELS OVER EYE (Moved from Right Panel to cover video border) */}
                    {/* H-auto min height to start compressed and expand with logs up to max-h */}
                    <div className="flex gap-4 w-full h-auto min-h-[80px] max-h-[400px] flex-shrink-0 transition-all duration-500 ease-in-out">
                        <div className="flex-1 bg-black/90 border border-white/10 p-3 rounded-xl flex flex-col relative overflow-hidden transition-all duration-500">
                            <span className="text-xs font-bold tracking-[0.2em] text-blue-400 mb-2 border-b border-blue-500/20 pb-1 flex justify-between">
                                RAM DUMP <Server className="w-3 h-3 text-blue-400" />
                            </span>
                            <div className="flex-1 overflow-hidden relative opacity-70">
                                <ScrollingHexDump active={engineState === 'running'} />
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="flex-1 bg-black/90 border border-white/10 p-3 rounded-xl flex flex-col relative overflow-hidden transition-all duration-500">
                            <span className="text-xs font-bold tracking-[0.2em] text-red-400 mb-2 border-b border-red-500/20 pb-1 flex justify-between">
                                TENSORS <ShieldAlert className="w-3 h-3 text-red-400" />
                            </span>
                            <div className="flex-1 overflow-hidden relative">
                                <LiveCalculationStream active={engineState === 'running'} />
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 mt-auto w-full">
                        {/* Final Results HUD Array */}
                        <AnimatePresence mode='wait'>
                            {engineState === 'completed' && (
                                <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-black/90 p-4 rounded-2xl border border-white/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
                                    <div className="p-3 border-l-2 border-primary">
                                        <p className="text-[10px] text-primary tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(0,217,165,0.8)] focus">Win Rate</p>
                                        <p className="text-2xl font-black text-white">{(activeTest.winRate * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="p-3 border-l-2 border-blue-400">
                                        <p className="text-[10px] text-blue-400 tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]">Executions</p>
                                        <p className="text-2xl font-black text-white">{activeTest.trades}</p>
                                    </div>
                                    <div className={cn("p-3 border-l-4", activeTest.status === 'positive' ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
                                        <p className={cn("text-[10px] tracking-widest uppercase mb-1", activeTest.status === 'positive' ? "text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,1)]" : "text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,1)]")}>Net Profit</p>
                                        <p className={cn("text-3xl font-black tracking-tighter", activeTest.status === 'positive' ? "text-green-400 text-shadow-glow" : "text-red-400 text-shadow-glow-red")}>{activeTest.profit > 0 ? '+' : ''}{activeTest.profit}%</p>
                                    </div>
                                    <div className="p-3 border-l-2 border-yellow-400">
                                        <p className="text-[10px] text-yellow-400 tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">Risk/Reward</p>
                                        <p className="text-2xl font-black text-white">{activeTest.rr}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* GIGANTIC OVERLAID CHART */}
                        <div className="h-[300px] lg:h-[450px] w-full relative group">
                            {engineState === 'completed' && chartData.length > 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="w-full h-full bg-black/90 border-t border-white/10 p-6 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative overflow-visible">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-6 py-1 rounded-full text-[10px] tracking-[0.3em] font-bold text-white shadow-[0_0_20px_rgba(0,0,0,1)]">
                                        FINANCIAL TRAJECTORY <span className="text-primary ml-2 animate-pulse">SIMULATION OVERRIDE</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="massiveGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={activeTest.status === 'positive' ? '#00FFBB' : '#FF0055'} stopOpacity={0.8} />
                                                    <stop offset="50%" stopColor={activeTest.status === 'positive' ? '#00D9A5' : '#ff3366'} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={activeTest.status === 'positive' ? '#00D9A5' : '#ff3366'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="1 10" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="trade" stroke="#444" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} />
                                            <YAxis domain={['auto', 'auto']} stroke="#444" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(0,217,165,0.3)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(10px)', boxShadow: '0 0 20px rgba(0,217,165,0.2)' }}
                                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                formatter={(value) => [`$${value.toFixed(2)}`, 'Cumulative Equity']}
                                            />
                                            <Bar dataKey="pnl" barSize={8} isAnimationActive={false}>
                                                {chartData.map((entry, index) => (
                                                    <cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#00FFbb' : '#FF0055'} opacity={0.7} />
                                                ))}
                                            </Bar>
                                            <Area type="monotone" dataKey="equity" stroke={activeTest.status === 'positive' ? '#00FFBB' : '#FF0055'} strokeWidth={6} fillOpacity={1} fill="url(#massiveGradient)" isAnimationActive={false} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* Overlay text removed for performance */}
                        </div>

                    </div>
                </div>

                {/* RIGHT LATERAL PANELS (Hacker/Quant Data Logs) */}
                <div className="col-span-1 md:col-span-3 flex flex-col gap-4 pointer-events-auto h-auto min-h-[20vh] max-h-[85vh] self-start w-full">

                    {/* Main Log Terminal Container */}
                    <div className="bg-black/90 border border-white/10 p-4 rounded-xl flex-1 flex flex-col shadow-[inset_0_0_50px_rgba(0,0,0,1)] relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                            <span className="text-xs font-bold tracking-widest text-gray-400 flex items-center gap-2"><Code2 className="w-4 h-4" /> MAIN_STDOUT</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto font-mono text-sm leading-relaxed scrollbar-none flex flex-col justify-start text-gray-300">
                            {terminalLogs.map((log, i) => {
                                if (!log) return null;
                                return (
                                    <div key={i} className="mb-2 p-2 rounded bg-white/5 border-l-2 border-primary/50 animate-in slide-in-from-right fade-in duration-300">
                                        {highlightTechText(log)}
                                    </div>
                                );
                            })}
                            {engineState === 'running' && (
                                <div className="w-3 h-5 bg-primary mt-2 flex-shrink-0 animate-pulse drop-shadow-[0_0_5px_rgba(0,217,165,1)]"></div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
