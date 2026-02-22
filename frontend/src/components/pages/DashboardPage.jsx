import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  TrendingUp, TrendingDown, DollarSign, Activity,
  Target, Shield, AlertTriangle, RefreshCw, Lightbulb, Clock,
  BarChart3, Eye, Minus, Users, ArrowUpRight, ArrowDownRight,
  Scale, Layers, Newspaper, ChevronDown, ChevronUp, ChevronRight,
  Zap, Calendar, ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TechCard, TechCardHeader, TechBadge } from '../ui/TechCard';
import { SparkLine, GlowingChart, MiniDonut } from '../ui/SparkLine';
import { TechTableTabs } from '../ui/TechTable';
import { ExportButton } from '../ui/ExportButton';
import { Skeleton, CardSkeleton } from '../ui/LoadingSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { WeeklyBiasScale } from '../ui/WeeklyBiasScale';


const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Asset Charts Grid (2-3 charts visible at once)
const AssetChartPanel = ({ assets, favoriteCharts, onFavoriteChange }) => {
  // State with LocalStorage Persistence
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('dashboard_viewMode') || 'grid');
  const [selectedAsset, setSelectedAsset] = useState(() => localStorage.getItem('dashboard_selectedAsset') || null);
  const [showSelector, setShowSelector] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [chartLineColor, setChartLineColor] = useState(() => localStorage.getItem('dashboard_chartLineColor') || '#00D9A5');
  const [expandedDeepInsight, setExpandedDeepInsight] = useState(null); // Track which asset has Deep Insight expanded

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('dashboard_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (selectedAsset) {
      localStorage.setItem('dashboard_selectedAsset', selectedAsset);
    } else {
      localStorage.removeItem('dashboard_selectedAsset');
    }
  }, [selectedAsset]);

  useEffect(() => {
    localStorage.setItem('dashboard_chartLineColor', chartLineColor);
  }, [chartLineColor]);

  // Filter to show only favorite charts in grid
  const visibleAssets = assets.filter(a => favoriteCharts.includes(a.symbol));

  const toggleFavorite = (symbol) => {
    if (favoriteCharts.includes(symbol)) {
      if (favoriteCharts.length > 1) {
        onFavoriteChange(favoriteCharts.filter(s => s !== symbol));
      }
    } else {
      if (favoriteCharts.length < 3) {
        onFavoriteChange([...favoriteCharts, symbol]);
      } else {
        onFavoriteChange([...favoriteCharts.slice(1), symbol]);
      }
    }
  };

  // --- STRATEGY ENGINE: WEEKLY & DAILY BIAS (Extracted from MacroEconomyPage) ---
  const getStrategyPhase = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Sun, 1=Mon...
    const date = today.getDate();

    // Cycle Weeks (Simple approx: 1-7=W1, 8-14=W2, 15-21=W3, 22+=W4)
    // Real implementation should check trading weeks, this is robust approx
    const weekId = date <= 7 ? '01' : date <= 14 ? '02' : date <= 21 ? '03' : '04';

    // Weekly Strategy Map
    const weeklyMap = {
      '01': { status: 'Accumulazione', sub: 'Range Stretto (Poco Direzionale)' },
      '02': { status: 'Slancio', sub: 'Inizio Trend (Accumula & Parte)' },
      '03': { status: 'Continuazione', sub: 'Trend Sostenuto (Molto Direzionale)' },
      '04': { status: 'Esaurimento', sub: 'Presa di Liquidità / Reversal' }
    };

    // Daily Strategy Map
    const dailyMap = {
      1: { title: 'Ranging', desc: 'Espansione solo post-sbilancio' },  // Lun
      2: { title: 'Accumulo', desc: 'O Ribilanciamento' },              // Mar
      3: { title: 'Espansione', desc: 'In Ribilanciamento' },           // Mer
      4: { title: 'Accumulo', desc: 'O Ribilanciamento' },              // Gio
      5: { title: 'Espansione', desc: 'O Inversione se zone da ribilanciare' }, // Ven
      0: { title: 'Weekend', desc: 'Analisi Chiusa' },
      6: { title: 'Weekend', desc: 'Analisi Chiusa' }
    };

    return {
      week: { id: weekId, ...weeklyMap[weekId] },
      day: dailyMap[day] || dailyMap[1] // Default Mon if err
    };
  };

  // --- MULTI-SOURCE STRATEGY ENGINE (MOCKED FOR NOW) ---
  const getDailyOutlook = (asset) => {
    // 1. INPUT DATA (SIMULATED PIPELINE)
    const price = asset.price;
    const isBull = asset.direction === 'Up';
    const isBear = asset.direction === 'Down';

    // Get Strategy + Time Phase
    const strat = getStrategyPhase();

    // Block 1: Volatility / Regime (VIX)
    const vixValue = 18.5; // Simulated live VIX
    const vixDelta1h = "+0.2";
    const vixState = vixValue > 20 ? "High Volatility (Risk Off)" : vixValue > 15 ? "Moderate (Caution)" : "Low (Risk On)";
    const vixShock = false; // No immediate shock

    // Block 2: Macro (Rates/Surprise)
    const macroSurprise = "Neutral";
    const ratesTrend = "Hawkish (Yields Rising)";

    // Block 3: News (Theme + Decay)
    const newsTheme = "Earnings Season";
    const newsSentiment = "Mixed";
    const newsImpact = "Medium";

    // Block 4: Positioning (COT - Slow Layer)
    // Simulated COT data based on asset type
    const cotData = asset.symbol === 'NAS100' ? {
      netPosition: "Net Long 35%",
      change: "+2%",
      percentile: "78th (Crowded)",
      category: "Asset Managers"
    } : asset.symbol === 'XAUUSD' ? {
      netPosition: "Net Long 60%",
      change: "-5%",
      percentile: "92nd (Super Crowded)",
      category: "Managed Money"
    } : {
      netPosition: "Neutral",
      change: "0%",
      percentile: "50th",
      category: "Commercials"
    };

    // 2. CORRELATION ENGINE -> SCORE & PROBABILITY
    // Simple weighted logic for demo
    let score = 50; // Base neutral
    if (isBull) score += 10;
    if (cotData.percentile.includes("Crowded")) score -= 5; // Contrarian risk
    if (vixValue < 20) score += 5; // Favorable regime

    // Add Strategy Weight
    if (strat.week.id === '03') score += 5; // Trend week bonus
    if (strat.day.title === 'Espansione') score += 5; // Expansion day bonus

    const probability = Math.min(Math.max(score, 0), 100); // Clamp 0-100
    const confidence = asset.confidence || 0;

    // 3. IMPULSE CLASSIFICATION
    // Logic: If score rising -> Prosegue. If diverging -> Diminuisce.
    // Simulated:
    let impulseState = "Prosegue";
    if (vixValue > 25) impulseState = "Diminuisce";
    if (confidence < 40) impulseState = "Inverte";

    // 4. GENERATE NARRATIVE SUMMARY (Pure Italian, No Parentheses)
    const directionText = isBull ? "rialzista" : isBear ? "ribassista" : "laterale";

    // -- Dynamic Narrative Construction --

    // 1. Context (Week/Day)
    const weekMap = { '01': 'prima settimana', '02': 'seconda settimana', '03': 'terza settimana', '04': 'quarta settimana' };
    const weekName = weekMap[strat.week.id] || `settimana ${strat.week.id}`;
    const weekPhase = strat.week.status.toLowerCase();

    let contextPhrase = `La tendenza è ${directionText} con una probabilità del ${probability}%. Siamo nella ${weekName} del mese, quella di ${weekPhase}.`;

    if (strat.day.title === "Espansione") {
      contextPhrase += ` Oggi è una giornata potenzialmente espansiva, ma ricorda che il movimento partirà solo dopo uno sbilanciamento dei prezzi.`;
    } else if (strat.day.title.includes("Accumulo")) {
      contextPhrase += ` Oggi ci aspettiamo un mercato in accumulazione o ribilanciamento.`;
    } else if (strat.day.title === "Ranging") {
      contextPhrase += ` Oggi il mercato potrebbe rimanere laterale in attesa di liquidità.`;
    } else {
      contextPhrase += ` Oggi giornata di ${strat.day.title.toLowerCase()}.`;
    }

    // 2. Risk (VIX)
    const riskAdjective = vixValue > 20 ? "alto" : vixValue > 15 ? "moderato" : "basso";
    const riskNote = vixValue > 20 ? "quindi riduci le size" : vixValue > 15 ? "fai attenzione alla volatilità" : "le condizioni sono favorevoli";
    const riskPhrase = `Il rischio attuale è ${riskAdjective}, ${riskNote}.`;

    // 3. Institutional (COT)
    const cotDirection = cotData.netPosition.includes("Long") ? "esposte al rialzo" : cotData.netPosition.includes("Short") ? "esposte al ribasso" : "neutre";
    const cotPercentage = (cotData.netPosition.match(/\d+/) || ["0"])[0];

    const crowded = cotData.percentile.includes("Crowded");
    const categoryName = cotData.category === "Asset Managers" ? "grandi gestori" : cotData.category === "Managed Money" ? "fondi speculativi" : "commerciali";

    // "Le mani forti, ovvero i grandi gestori, sono esposte al rialzo al 35% netto."
    const cotPhrase = `Le mani forti, ovvero i ${categoryName}, sono ${cotDirection} al ${cotPercentage}% netto. ${crowded ? "C'è un eccesso di posizionamento che potrebbe causare rapide liquidazioni contrarie." : "Il posizionamento è nella norma e lascia spazio al trend."}`;

    // 4. Invalidation
    const invalidationLevel = isBull ? (price * 0.98).toFixed(2) : (price * 1.02).toFixed(2);
    const invalidationPhrase = `Questa visione sarà annullata se il prezzo dovesse scendere sotto ${invalidationLevel}.`;

    // 5. News Context
    const newsContext = newsTheme === "Earnings Season" ? "Ricorda che siamo nella stagione delle trimestrali." : `Il tema principale è ${newsTheme}.`;

    // Final Assembly
    const simpleSummary = `
      ${contextPhrase}
      ${riskPhrase} ${cotPhrase}
      ${newsContext} ${invalidationPhrase}
    `;

    // 5. DEEP INSIGHT OBJECT
    const deepInsight = {
      atrData: asset.atr ? {
        traveled: Math.round(Math.abs(asset.price - asset.atr.openPrice)),
        target: asset.atr.daily,
        percentage: Math.min(Math.round(Math.abs(asset.price - asset.atr.openPrice) / asset.atr.daily * 100), 100)
      } : null,
      marketState: impulseState, // "Prosegue", "Diminuisce", "Inverte"
      vix: `${vixValue} (${vixDelta1h}) - ${vixState}`,
      cot: `${cotData.category}: ${cotData.netPosition} (${cotData.percentile})`,
      options: "Gamma Flip Level nearby (Watch 25300)", // Mock
      weeklyPhase: `Week ${strat.week.id} - ${strat.week.status} (${strat.day.title})`, // Integrated Strategy
      dailyBias: directionText,
      volatilityPeaks: [
        "09:30-10:30 (London Open - High Vol)",
        "14:30-15:30 (US Open - Macro Data)",
        "15:30-16:00 (NYSE Close - Unwind)"
      ],
      reasoning: `
        Il modello Multi-Sorgente indica una fase ${directionText} con score ${score}/100.
        Analisi Ciclica:
        - Week ${strat.week.id}: ${strat.week.sub}.
        - Oggi (${strat.day.title}): ${strat.day.desc}.
        
        Punti chiave:
        1. VIX a ${vixValue} segnala un regime di ${vixState}.
        2. Posizionamento COT (${cotData.netPosition}) mostra ${cotData.percentile.includes("Crowded") ? "potenziale esaustione/squeeze" : "spazio per continuazione"}.
        3. Livello invalidazione chiave a ${invalidationLevel}.
        4. Strategia consigliata: ${impulseState === "Prosegue" ? "Buy Pullbacks" : "Reduce Risk / Wait"}.
      `
    };

    return {
      conclusion: directionText,
      conclusionType: isBull ? 'bullish' : isBear ? 'bearish' : 'neutral',
      simpleSummary: simpleSummary.replace(/\s+/g, ' ').trim(), // Clean extra spaces
      deepInsight
    };
  };

  const currentAsset = selectedAsset ? assets.find(a => a.symbol === selectedAsset) : assets[0];
  const dailyOutlook = currentAsset ? getDailyOutlook(currentAsset) : null;
  const chartColors = ['#00D9A5', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  const handleFocusAsset = (symbol) => {
    setSelectedAsset(symbol);
    setViewMode('focus');
    setShowAssetMenu(false);
  };

  const handleTitleClick = () => {
    if (viewMode === 'focus') {
      setViewMode('grid');
      setSelectedAsset(null);
    } else {
      setShowAssetMenu(!showAssetMenu);
    }
  };

  return (
    <TechCard className="font-apple glass-edge fine-gray-border p-5">
      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <button
            onClick={handleTitleClick}
            className="flex items-center gap-3 group transition-all"
          >
            <div className={cn(
              "p-2 rounded-lg border transition-all",
              viewMode === 'focus'
                ? "bg-[#00D9A5]/10 border-[#00D9A5]/20 font-bold"
                : "bg-white/5 border-white/10 group-hover:border-white/20 dark:bg-white/5 dark:border-white/10"
            )}>
              <BarChart3 className="w-5 h-5 text-[#00D9A5]" />
            </div>
            <div className="text-left">
              <h4 className={cn(
                "text-lg font-bold transition-colors select-none",
                viewMode === 'focus' ? "text-slate-900 dark:text-white" : "text-slate-500 group-hover:text-slate-900 dark:text-white/80 dark:group-hover:text-white"
              )}>
                {viewMode === 'focus' ? 'Screening' : 'Screening'}
              </h4>
              <p className="text-xs text-slate-400 dark:text-white/40 leading-none mt-1">
                {viewMode === 'focus' ? 'Dettagli asset' : 'Clicca per selezionare asset'}
              </p>
            </div>
          </button>

          {/* Asset Selection Dropdown */}
          <AnimatePresence>
            {showAssetMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 5 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute left-0 top-full mt-2 z-50 p-2 bg-white/95 border border-slate-200 rounded-xl shadow-2xl min-w-[180px] backdrop-blur-xl dark:bg-[#0B0F17]/95 dark:border-white/10"
              >
                <div className="space-y-1">
                  {assets.map((a) => (
                    <button
                      key={a.symbol}
                      onClick={() => handleFocusAsset(a.symbol)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-semibold dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {a.symbol}
                    </button>
                  ))}
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={() => { setViewMode('grid'); setShowAssetMenu(false); setSelectedAsset(null); }}
                    className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest text-[#00D9A5] hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    Torna alla Griglia
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Favorite Eye Icon & Color Selector */}
        <div className="relative" onMouseLeave={() => setShowSelector(false)}>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className={cn(
              "p-2 rounded-lg border transition-all flex items-center gap-2",
              showSelector ? "bg-[#00D9A5]/10 border-[#00D9A5]/30 text-[#00D9A5]" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-white/40 dark:hover:text-white dark:hover:border-white/20"
            )}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartLineColor }} />
            <Eye className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full z-50 p-3 bg-white/95 border border-slate-200/50 rounded-xl shadow-2xl min-w-[220px] backdrop-blur-xl dark:bg-[#0B0F17]/95 dark:border-white/10"
              >
                {/* Asset Selection Section */}
                <div className="mb-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-white/30">Seleziona Asset ({favoriteCharts.length}/3)</span>
                </div>
                <div className="space-y-1 mb-4">
                  {assets.map((a) => (
                    <button
                      key={a.symbol}
                      onClick={() => toggleFavorite(a.symbol)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all font-medium",
                        favoriteCharts.includes(a.symbol)
                          ? "bg-[#00D9A5]/10 text-[#00D9A5]"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                    >
                      <span>{a.symbol}</span>
                    </button>
                  ))}
                </div>

                {/* Color Selection Section */}
                <div className="border-t border-white/5 pt-3">
                  <div className="mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-white/30">Colore Grafico</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    {chartColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setChartLineColor(color)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-all hover:scale-110",
                          chartLineColor === color ? "border-white shadow-[0_0_8px_rgba(255,255,255,0.5)] scale-110" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn(
              "grid gap-4",
              visibleAssets.length === 2 ? "grid-cols-2" : "grid-cols-3"
            )}
          >
            {visibleAssets.map((asset, index) => {
              const color = chartColors[index % chartColors.length];
              const outlook = getDailyOutlook(asset);
              const isDeepExpanded = expandedDeepInsight === asset.symbol;

              return (
                <div
                  key={asset.symbol}
                  className="group relative p-4 bg-white rounded-2xl !border !border-slate-400 shadow-[0_20px_50px_rgb(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] transition-all text-left dark:bg-white/[0.03] dark:!border-white/10 dark:hover:!border-white/20 dark:shadow-none font-apple"
                >
                  <div
                    onClick={() => handleFocusAsset(asset.symbol)}
                    className="cursor-pointer"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-white/5" />

                    <div className="mb-2 relative z-10 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{asset.symbol}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white tracking-tight">
                            {asset.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Confidence Percentage - Repositioned to Top Right */}
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-white uppercase tracking-[0.2em] leading-none mb-1">Confidenza</span>
                        <span className="text-lg font-black leading-none text-[#00D9A5]">
                          {asset.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="h-28 -ml-4 relative z-10 overflow-hidden rounded-lg mb-2">
                      <GlowingChart
                        data={asset.sparkData || [30, 45, 35, 60, 42, 70, 55, 65, 50, 75]}
                        width={400}
                        height={110}
                        color={color}
                        showPrice={false}
                      />
                    </div>

                    <div className="relative z-10 space-y-3 mt-4">
                      {/* Bias & Confidence Row - HIGHLIGHTED */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all",
                          getDailyOutlook(asset).conclusionType === 'bullish' ? "bg-[#00D9A5]/10 border-[#00D9A5]/20 text-[#00D9A5]" :
                            getDailyOutlook(asset).conclusionType === 'bearish' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                              "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                        )}>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getDailyOutlook(asset).conclusionType === 'bullish' ? "bg-[#00D9A5]" :
                              getDailyOutlook(asset).conclusionType === 'bearish' ? "bg-red-500" :
                                "bg-yellow-500"
                          )} />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                            {getDailyOutlook(asset).conclusion}
                          </p>
                        </div>
                      </div>

                      {/* Simple Summary - Narrative Paragraph */}
                      <p className="text-sm text-white/90 leading-relaxed">
                        {outlook.simpleSummary}
                      </p>
                    </div>
                  </div>


                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="focus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {/* Focus View Header - Compact */}
            <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-widest leading-none select-none">
                  {currentAsset.symbol}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {currentAsset.price?.toLocaleString() || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <TechBadge variant={currentAsset.direction === 'Up' ? 'success' : 'warning'} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
                    {currentAsset.direction === 'Up' ? 'Bullish' : 'Bearish'} {currentAsset.confidence}%
                  </TechBadge>
                </div>
              </div>

              <div className="flex items-start gap-8">
                <div className="text-right">
                  <p className="text-xs text-white uppercase font-black tracking-[0.2em] mb-1 leading-none text-right">Confidenza</p>
                  <p className="text-4xl font-black leading-none tracking-tight text-[#00D9A5]">
                    {currentAsset.confidence}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white uppercase font-black tracking-[0.2em] mb-1">Outlook Giornaliero</p>
                  <div className={cn(
                    "px-3 py-1 rounded-lg border text-[11px] font-bold shadow-lg uppercase tracking-widest",
                    dailyOutlook.conclusionType === 'bullish' ? "bg-[#00D9A5]/10 text-[#00D9A5] border-[#00D9A5]/20" :
                      dailyOutlook.conclusionType === 'bearish' ? "bg-red-500/10 text-red-400 border-red-400/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-400/20"
                  )}>
                    {dailyOutlook.conclusion}
                  </div>
                </div>
              </div>
            </div>

            {/* Big Chart - Flattened */}
            <div className="h-[220px] mb-6 relative group overflow-hidden">
              {/* Hover Gradient - Neutral */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-100 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity dark:from-white/5" />
              <div className="w-full h-full flex items-center justify-center">
                <GlowingChart
                  data={currentAsset.sparkData || [30, 45, 35, 60, 42, 70, 55, 65, 50, 75]}
                  width={1000}
                  height={200}
                  color={chartLineColor}
                  showPrice={true}
                />
              </div>
            </div>

            {/* Details Grid - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4">Analisi Strutturale</h5>
                <p className="text-base font-semibold text-white/95 leading-relaxed tracking-tight">
                  {dailyOutlook.simpleSummary}
                </p>

                {/* Deep Insight Button - Only in Focus View */}
                <button
                  onClick={() => setExpandedDeepInsight(expandedDeepInsight === currentAsset.symbol ? null : currentAsset.symbol)}
                  className="mt-6 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#00D9A5]/10 border border-[#00D9A5]/30 hover:bg-[#00D9A5]/20 transition-all"
                >
                  <span className="text-sm font-bold text-[#00D9A5] uppercase tracking-wider">Deep Insight - Analisi Tecnica</span>
                  <ChevronDown className={cn("w-5 h-5 text-[#00D9A5] transition-transform duration-300", expandedDeepInsight === currentAsset.symbol && "rotate-180")} />
                </button>

                {/* Expandable Deep Insight Panel */}
                <AnimatePresence>
                  {expandedDeepInsight === currentAsset.symbol && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-5 bg-white/5 rounded-xl border border-white/10 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                            {dailyOutlook.deepInsight?.atrData ? (
                              <>
                                <p className="text-xs text-white/40 uppercase font-bold mb-2">ATR / Range Daily</p>
                                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                                  <div
                                    className="absolute top-0 left-0 h-full bg-[#00D9A5] transition-all duration-500"
                                    style={{ width: `${dailyOutlook.deepInsight.atrData.percentage}%` }}
                                  />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-white/50 tracking-wide font-medium">
                                  <span>{dailyOutlook.deepInsight.atrData.traveled} pts</span>
                                  <span>Target: {dailyOutlook.deepInsight.atrData.target} pts</span>
                                </div>
                              </>
                            ) : (
                              <div>
                                <p className="text-xs text-white/40 uppercase font-bold mb-1">ATR / Range</p>
                                <p className="text-base text-white/90 font-semibold">N/A</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-white/40 uppercase font-bold mb-1">Impulso / Momentum</p>
                            <p className="text-base text-white/90 font-semibold">{dailyOutlook.deepInsight?.marketState || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 uppercase font-bold mb-1">VIX & Regime</p>
                            <p className="text-base text-white/90 font-semibold">{dailyOutlook.deepInsight?.vix || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 uppercase font-bold mb-1">COT (Mani Forti)</p>
                            <p className="text-base text-white/90 font-semibold">{dailyOutlook.deepInsight?.cot || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 uppercase font-bold mb-1">Options Flow</p>
                            <p className="text-base text-white/90 font-semibold">{dailyOutlook.deepInsight?.options || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 uppercase font-bold mb-1">Weekly Phase</p>
                            <p className="text-base text-white/90 font-semibold">{dailyOutlook.deepInsight?.weeklyPhase || 'N/A'}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-white/40 uppercase font-bold mb-2">Picchi Volatilità Oraria (MATAF)</p>
                          <div className="flex flex-wrap gap-2">
                            {dailyOutlook.deepInsight?.volatilityPeaks?.map((peak, i) => (
                              <span key={i} className="text-sm px-3 py-1.5 bg-[#00D9A5]/10 text-[#00D9A5] rounded-lg font-medium">{peak}</span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-white/40 uppercase font-bold mb-2">Analisi Tecnica Completa</p>
                          <p className="text-base text-white/80 leading-relaxed">{dailyOutlook.deepInsight?.reasoning || 'Analisi in corso...'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4">Metriche Rapide</h5>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <p className="text-xs text-white uppercase font-black tracking-[0.2em] mb-1 leading-none">Volatilità</p>
                      <p className="text-lg font-bold text-[#00D9A5] tracking-tight leading-none">Alta</p>
                    </div>
                    <div>
                      <p className="text-xs text-white uppercase font-black tracking-[0.2em] mb-1 leading-none">Impulso</p>
                      <p className="text-lg font-bold text-[#00D9A5] tracking-tight leading-none">{currentAsset.impulse || 'Stabile'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white uppercase font-black tracking-[0.2em] mb-1 leading-none">Regime</p>
                      <p className="text-lg font-bold text-[#00D9A5] tracking-tight leading-none">Trend</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TechCard>
  );
};


// Risk Overview - Compact Inline
const RiskPanel = ({ vix, regime }) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-[#00D9A5]" />
        <span className="text-base text-white/50">VIX</span>
        <span className={cn(
          "text-lg font-bold font-mono",
          vix?.current > 22 ? "text-red-400" : vix?.current > 18 ? "text-yellow-400" : "text-[#00D9A5]"
        )}>
          {vix?.current || '-'}
        </span>
        <span className={cn(
          "text-base",
          vix?.change > 0 ? "text-red-400" : "text-[#00D9A5]"
        )}>
          ({vix?.change > 0 ? '+' : ''}{vix?.change || 0}%)
        </span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="flex items-center gap-2">
        <span className="text-base text-white/50">Regime</span>
        <span className={cn(
          "text-lg font-bold",
          regime === 'risk-off' ? "text-red-400" : regime === 'risk-on' ? "text-[#00D9A5]" : "text-yellow-400"
        )}>
          {regime?.toUpperCase() || '-'}
        </span>
      </div>
    </div>
  </div>
);

// COT Summary Panel - Premium Carousel Style
const COTPanel = ({ cotData, favoriteCOT, onFavoriteCOTChange }) => {
  const [showSelector, setShowSelector] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!cotData?.data) return null;

  const instruments = Object.keys(cotData.data);
  const selectedInstruments = favoriteCOT?.length > 0 ? favoriteCOT : instruments.slice(0, 2);

  const nextInstrument = () => {
    setActiveIndex((prev) => (prev + 1) % selectedInstruments.length);
  };

  const prevInstrument = () => {
    setActiveIndex((prev) => (prev - 1 + selectedInstruments.length) % selectedInstruments.length);
  };

  const currentSymbol = selectedInstruments[activeIndex];
  const data = cotData?.data?.[currentSymbol];

  const selectInstrument = (inst) => {
    if (!onFavoriteCOTChange) return;
    onFavoriteCOTChange([inst]);
    setActiveIndex(0);
    setShowSelector(false);
  };

  const getInstitutionalPositions = (data) => {
    if (!data?.categories) return { long: 0, short: 0 };
    if (data.categories.asset_manager) return data.categories.asset_manager;
    if (data.categories.managed_money) return data.categories.managed_money;
    return { long: 0, short: 0 };
  };

  const pos = data ? getInstitutionalPositions(data) : { long: 0, short: 0 };
  const netPos = (pos.long || 0) - (pos.short || 0);
  const formattedNetPos = (netPos > 0 ? '+' : '') + (netPos / 1000).toFixed(1) + 'k';

  // Mock historical data for the bar chart (last 4 reporting periods)
  const historicalData = [
    { label: 'giu.', value: 12, estimate: false },
    { label: 'set.', value: 37, estimate: false },
    { label: 'dic.', value: 42, estimate: false },
    { label: 'mar.', value: 68, estimate: true },
  ];

  // Metrics specifically for the current asset
  const getMetrics = (data, pos) => {
    const total = (pos.long || 0) + (pos.short || 0);
    const ratio = total > 0 ? Math.round((pos.long / total) * 100) : 50;
    const confidence = Math.min(95, Math.max(40, ratio > 60 ? ratio + 10 : 100 - ratio + 10));
    const crowding = Math.min(98, Math.max(30, Math.abs(ratio - 50) + 50));
    const squeezeRisk = data?.bias === 'Bear' ? Math.min(95, 70 + Math.random() * 25) :
      data?.bias === 'Bull' ? Math.max(20, 30 + Math.random() * 25) : 50;
    return {
      confidence: Math.round(confidence),
      crowding: Math.round(crowding),
      squeezeRisk: Math.round(squeezeRisk)
    };
  };

  const metrics = getMetrics(data, pos);

  // Generate interpretive text - 3 bullet points summary
  const getInterpretation = (data, metrics) => {
    if (!data) return ['Caricamento dati...', 'Attendere prego.', '...'];
    if (data.bias === 'Bull') {
      return [
        `Accumulo istituzionale forte (${metrics.confidence}%).`,
        metrics.crowding > 75 ? 'Rischio crowding elevato, possibile consolidamento.' : 'Trend rialzista supportato dai fondamentali.',
        'Target tecnico istituzionale individuato su livelli superiori.'
      ];
    } else if (data.bias === 'Bear') {
      return [
        `Distribuzione istituzionale in corso (${metrics.confidence}%).`,
        metrics.squeezeRisk > 75 ? 'Rischio short squeeze elevato su questi livelli.' : 'Pressione ribassista confermata dai flussi.',
        'Sentiment market neutral in attesa di breakout direzionale.'
      ];
    }
    return [
      'Posizionamento neutrale degli istituzionali.',
      'In attesa della prossima release del report COT.',
      'Monitoraggio flussi opzioni in corso.'
    ];
  };

  const interpretation = getInterpretation(data, metrics);

  return (
    <TechCard className="p-5 font-apple bg-[#0F1115] border-[#1C1F26] rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col">
      {/* Glow effect in background */}
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-[#00D9A5]/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00D9A5]" />
          <span className="font-medium text-base text-white/90">COT Institutional</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" onMouseLeave={() => setShowSelector(false)}>
            <button
              onMouseEnter={() => setShowSelector(true)}
              onClick={() => setShowSelector(!showSelector)}
              className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all opacity-40 hover:opacity-100"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>
            <AnimatePresence>
              {showSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full pt-1 z-50"
                >
                  <div className="p-3 bg-[#161B22] border border-white/10 rounded-2xl shadow-2xl min-w-[180px] backdrop-blur-xl">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 px-2">Monitorati</p>
                    <div className="space-y-1 max-h-[250px] overflow-y-auto scrollbar-thin">
                      {instruments.map(inst => (
                        <button
                          key={inst}
                          onClick={() => selectInstrument(inst)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                            selectedInstruments.includes(inst) ? "bg-[#00D9A5]/10 text-[#00D9A5]" : "text-white/50 hover:bg-white/5"
                          )}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Main Title & Value */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">{currentSymbol}</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white tracking-tighter leading-none">{formattedNetPos}</span>
            <span className="text-[12px] text-white/60 font-bold uppercase tracking-[0.2em]">Net Position</span>
          </div>
        </div>

        {/* Rolling Bias Section - ENLARGED & CLEAN */}
        <div className="mb-4 mt-2 px-2">
          <WeeklyBiasScale
            data={data.rolling_bias || [
              { label: 'W-3', value: 45, isCurrent: false },
              { label: 'W-2', value: 37, isCurrent: false },
              { label: 'W-1', value: 55, isCurrent: false, isPrevious: true },
              { label: 'W-0', value: metrics.confidence, isCurrent: true }
            ]}
            mini={false}
            showWrapper={false}
          />
        </div>

        {/* Metrics Row - Confidence | Crowding | Squeeze - MOVED HERE */}
        <div className="grid grid-cols-3 gap-3 mb-6 mt-0 p-4 bg-white/5 rounded-[24px] border border-white/5">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Confidence</span>
            <span className="text-xl font-bold text-[#00D9A5]">{metrics.confidence}%</span>
          </div>
          <div className="flex flex-col items-center justify-center border-x border-white/10">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Crowding</span>
            <span className={cn(
              "text-xl font-bold",
              metrics.crowding > 75 ? "text-yellow-400" : "text-white"
            )}>{metrics.crowding}%</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Squeeze</span>
            <span className={cn(
              "text-xl font-bold",
              metrics.squeezeRisk > 70 ? "text-red-400" : "text-[#00D9A5]"
            )}>{metrics.squeezeRisk}%</span>
          </div>
        </div>


        {/* Bias Interpretation - MOVED & mt-auto removed */}
        <div className="p-5 mt-4 rounded-[24px] bg-white/5 border border-white/10">
          <ul className="space-y-1.5">
            {interpretation.slice(0, 2).map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00D9A5] shadow-[0_0_8px_#00D9A5] flex-shrink-0" />
                <span className="text-sm text-white/90 leading-snug">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </TechCard>
  );
};




// Options Flow Panel - Enhanced Interactive
const OptionsPanel = ({ optionsData }) => {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('XAUUSD');

  const availableAssets = ['XAUUSD', 'NAS100', 'SP500', 'EURUSD', 'BTCUSD'];

  // Asset-specific options data with millions values (simulated - will come from backend)
  const assetOptionsData = {
    XAUUSD: {
      call_ratio: 62, put_ratio: 38, net_flow: 68, bias: 'bullish',
      call_million: 142, put_million: 87, net_million: 55,
      call_change: 8.2, put_change: -3.5, net_change: 12.1,
      gamma_exposure: 72, gamma_billion: 1.2, // gamma in billions
      interpretation: [
        'Flusso istituzionale XAUUSD orientato long.',
        'Call premium in aumento su livelli chiave 2050-2100.',
        'Sentiment risk-off supporta posizioni rialziste.'
      ]
    },
    NAS100: {
      call_ratio: 58, put_ratio: 42, net_flow: 55, bias: 'bullish',
      call_million: 98, put_million: 71, net_million: 27,
      call_change: 4.1, put_change: 2.3, net_change: 5.8,
      gamma_exposure: 58, gamma_billion: 0.8,
      interpretation: [
        'Flusso NAS100 moderatamente bullish.',
        'Tech stocks accumulo call su livelli di supporto.',
        'Volatilità in calo favorisce posizioni direzionali.'
      ]
    },
    SP500: {
      call_ratio: 52, put_ratio: 48, net_flow: 50, bias: 'neutral',
      call_million: 185, put_million: 171, net_million: 14,
      call_change: 1.2, put_change: 0.8, net_change: 0.5,
      gamma_exposure: 52, gamma_billion: 2.5,
      interpretation: [
        'SP500 in equilibrio call/put.',
        'Istituzionali attendono dati macro.',
        'Posizionamento neutrale in attesa di breakout.'
      ]
    },
    EURUSD: {
      call_ratio: 45, put_ratio: 55, net_flow: 40, bias: 'bearish',
      call_million: 54, put_million: 66, net_million: -12,
      call_change: -2.1, put_change: 5.4, net_change: -7.2,
      gamma_exposure: 35, gamma_billion: -0.3,
      interpretation: [
        'Flusso EURUSD orientato short su dollaro forte.',
        'Put premium dominante sotto 1.0800.',
        'Divergenza tassi Fed/BCE pesa sul cross.'
      ]
    },
    BTCUSD: {
      call_ratio: 72, put_ratio: 28, net_flow: 78, bias: 'bullish',
      call_million: 312, put_million: 121, net_million: 191,
      call_change: 15.3, put_change: -8.2, net_change: 22.1,
      gamma_exposure: 85, gamma_billion: 3.8,
      interpretation: [
        'BTCUSD flusso estremamente bullish.',
        'Call accumulo massiccio su strike 50K-60K.',
        'Istituzionali accumulano in vista halving.'
      ]
    }
  };

  const currentData = assetOptionsData[selectedAsset] || assetOptionsData.XAUUSD;

  return (
    <TechCard className="p-4 font-apple">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#00D9A5]" />
          <span className="font-medium text-base text-white/90">Options Flow</span>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">{selectedAsset}</span>
        </div>
        {/* Eye Icon Selector */}
        <div className="relative" onMouseLeave={() => setShowSelector(false)}>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="p-1.5 rounded-lg transition-colors border bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            <Eye className="w-4 h-4 text-slate-500 dark:text-white/60" />
          </button>
          {/* Dropdown Selector */}
          <AnimatePresence>
            {showSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full z-50 p-3 bg-white/95 border border-slate-200 rounded-lg shadow-xl min-w-[160px] dark:bg-black/90 dark:border-white/10"
              >
                <div className="mb-2 px-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-white/30">Seleziona Asset</p>
                </div>
                <div className="space-y-1">
                  {availableAssets.map(asset => (
                    <button
                      key={asset}
                      onClick={() => { setSelectedAsset(asset); setShowSelector(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors font-medium",
                        selectedAsset === asset
                          ? "bg-[#00D9A5]/10 text-[#00D9A5]"
                          : "bg-transparent text-slate-500 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/5"
                      )}
                    >
                      <span>{asset}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Asset Name - Prominent Display */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-xl font-bold text-white">{selectedAsset}</span>
        <span className={cn(
          "px-2 py-1 rounded text-sm font-semibold",
          currentData.bias === 'bullish' ? "bg-[#00D9A5]/20 text-[#00D9A5]" :
            currentData.bias === 'bearish' ? "bg-red-500/20 text-red-400" :
              "bg-yellow-500/20 text-yellow-400"
        )}>
          {currentData.bias === 'bullish' ? 'Bullish' : currentData.bias === 'bearish' ? 'Bearish' : 'Neutral'}
        </span>
      </div>

      {/* Three Circles Layout: Call | Net Flow | Put - Responsive */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-6 mb-4 p-3 sm:p-5 bg-white/5 rounded-xl overflow-hidden" style={{ minHeight: '140px' }}>
        {/* Left - Calls with Millions */}
        <div className="flex flex-col items-center flex-shrink min-w-0">
          <div className="relative w-[60px] h-[60px] sm:w-[75px] sm:h-[75px] lg:w-[90px] lg:h-[90px]">
            <MiniDonut
              value={currentData.call_ratio}
              size="100%"
              strokeWidth={6}
              color="#00D9A5"
              showValue={false}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-[10px] sm:text-xs font-medium",
                currentData.call_change >= 0 ? "text-[#00D9A5]" : "text-red-400"
              )}>
                {currentData.call_change >= 0 ? '+' : ''}{currentData.call_change}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#00D9A5]">{currentData.call_million}M</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2 font-medium">Calls</p>
        </div>

        {/* Center - Net Flow (larger, prominent) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px]">
            <MiniDonut
              value={currentData.net_flow}
              size="100%"
              strokeWidth={8}
              color={currentData.bias === 'bearish' ? "#EF4444" : "#00D9A5"}
              showValue={false}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-[10px] sm:text-xs font-medium",
                currentData.net_change >= 0 ? "text-[#00D9A5]" : "text-red-400"
              )}>
                {currentData.net_change >= 0 ? '+' : ''}{currentData.net_change}%
              </span>
              <span className={cn(
                "text-lg sm:text-xl lg:text-2xl font-bold",
                currentData.bias === 'bearish' ? "text-red-400" : "text-[#00D9A5]"
              )}>
                {currentData.net_million > 0 ? '+' : ''}{currentData.net_million}M
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2 font-medium">Net Flow</p>
        </div>

        {/* Right - Puts with Millions */}
        <div className="flex flex-col items-center flex-shrink min-w-0">
          <div className="relative w-[60px] h-[60px] sm:w-[75px] sm:h-[75px] lg:w-[90px] lg:h-[90px]">
            <MiniDonut
              value={currentData.put_ratio}
              size="100%"
              strokeWidth={6}
              color="#EF4444"
              showValue={false}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-[10px] sm:text-xs font-medium",
                currentData.put_change >= 0 ? "text-[#00D9A5]" : "text-red-400"
              )}>
                {currentData.put_change >= 0 ? '+' : ''}{currentData.put_change}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-red-400">{currentData.put_million}M</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2 font-medium">Puts</p>
        </div>
      </div>

      {/* Gamma Exposure Bar */}
      <div className="mb-4 px-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-base text-white/90 font-medium">Gamma Exposure</span>
          <span className={cn(
            "text-lg font-bold",
            currentData.gamma_billion >= 0 ? "text-[#00D9A5]" : "text-red-400"
          )}>
            {currentData.gamma_billion >= 0 ? '+' : ''}{currentData.gamma_billion}B
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              currentData.gamma_exposure >= 50 ? "bg-[#00D9A5]" : "bg-red-400"
            )}
            style={{ width: `${currentData.gamma_exposure}%` }}
          />
        </div>
      </div>

      {/* Options Interpretation - Bullet Points styled like Screening */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <ul className="space-y-1.5 text-base text-white/90">
          {currentData.interpretation.map((line, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#00D9A5] mt-0.5">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Compact Disclaimer Summary - Matching Chart Style */}

    </TechCard>
  );
};

// Strategy Selector Panel - With checkbox filtering from Strategia page
const StrategySelectorPanel = ({ strategies, expandedNews, setExpandedNews }) => {
  const [showSelector, setShowSelector] = useState(false);

  // Available strategies from StrategyPage (with win rates)
  const availableStrategies = [
    { id: 'volguard-mr', name: 'VolGuard Mean-Reversion', shortName: 'VG', winRate: 72 },
    { id: 'gamma-magnet', name: 'GammaMagnet Convergence', shortName: 'GM', winRate: 68 },
    { id: 'strategy-1', name: 'News Spike Reversion', shortName: 'S1', winRate: 62 },
    { id: 'rate-vol-alignment', name: 'Rate-Volatility Alignment', shortName: 'RV', winRate: 62 },
    { id: 'strategy-2', name: 'VIX Range Fade', shortName: 'S2', winRate: 58 },
    { id: 'multi-day-ra', name: 'Multi-Day Rejection', shortName: 'MD', winRate: 56 },
  ];

  // Selected strategies (default: top 3 by win rate)
  const [selectedStrategies, setSelectedStrategies] = useState(['volguard-mr', 'gamma-magnet', 'strategy-1']);

  // Today's signals for each strategy (simulated - would come from backend)
  const todaySignals = [
    { strategyId: 'volguard-mr', asset: 'SP500', bias: 'Long', winRate: 72, summary: 'VIX < 15, range stretto. Entry su test POC, target 1R.', trigger: 'VIX Low + Range' },
    { strategyId: 'gamma-magnet', asset: 'NAS100', bias: 'Long', winRate: 68, summary: 'Alta OI su strike 18000. Prezzo attratto verso gamma positivo.', trigger: 'High OI Strike' },
    { strategyId: 'gamma-magnet', asset: 'SPY', bias: 'Short', winRate: 68, summary: 'Gamma flip a 500. Prezzo respinto, target 495.', trigger: 'Gamma Flip' },
    { strategyId: 'strategy-1', asset: 'XAUUSD', bias: 'Long', winRate: 62, summary: 'Spike news su 2W Low. Attendi rejection e rientro sopra weekly low.', trigger: 'News Spike' },
    { strategyId: 'strategy-1', asset: 'EURUSD', bias: 'Short', winRate: 62, summary: 'Prezzo esteso verso 2W High. Entry su rejection.', trigger: 'Premium Zone' },
    { strategyId: 'rate-vol-alignment', asset: 'TLT', bias: 'Long', winRate: 62, summary: 'Yield in calo + VIX stabile. Bond rally atteso.', trigger: 'Rate-Vol Align' },
    { strategyId: 'strategy-2', asset: 'NAS100', bias: 'Long', winRate: 58, summary: 'VIX in calo, prezzo esteso verso low. Fade setup.', trigger: 'VIX Fade' },
    { strategyId: 'multi-day-ra', asset: 'BTC', bias: 'Long', winRate: 56, summary: 'Rejection con wick lunga su supporto multi-day.', trigger: 'Multi-Day Rejection' },
  ];

  // Filter signals by selected strategies and sort by win rate
  const filteredSignals = todaySignals
    .filter(s => selectedStrategies.includes(s.strategyId))
    .sort((a, b) => b.winRate - a.winRate);

  const toggleStrategy = (strategyId) => {
    if (selectedStrategies.includes(strategyId)) {
      if (selectedStrategies.length > 1) {
        setSelectedStrategies(selectedStrategies.filter(id => id !== strategyId));
      }
    } else {
      setSelectedStrategies([...selectedStrategies, strategyId]);
    }
  };

  const selectAll = () => setSelectedStrategies(availableStrategies.map(s => s.id));
  const selectNone = () => setSelectedStrategies([availableStrategies[0].id]); // Keep at least one

  return (
    <TechCard className="p-4 font-apple">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-medium text-white/90 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#00D9A5]" />
          Report Posizionamenti
        </h4>
        {/* Strategy Selector */}
        <div className="relative" onMouseLeave={() => setShowSelector(false)}>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="p-1.5 rounded-lg transition-colors border flex items-center gap-1 bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            <Eye className="w-4 h-4 text-slate-500 dark:text-white/60" />
            <span className="text-xs text-slate-400 dark:text-white/40">{selectedStrategies.length}/{availableStrategies.length}</span>
          </button>
          {/* Dropdown Selector */}
          <AnimatePresence>
            {showSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full z-50 p-3 bg-white/95 border border-slate-200 rounded-lg shadow-xl min-w-[220px] dark:bg-black/95 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-white/30">Strategie</p>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-[10px] font-bold uppercase tracking-wider text-[#00D9A5] hover:underline">Tutte</button>
                    <button onClick={selectNone} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:underline dark:text-white/40">Reset</button>
                  </div>
                </div>
                <div className="space-y-1">
                  {availableStrategies.map(strategy => (
                    <button
                      key={strategy.id}
                      onClick={() => toggleStrategy(strategy.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors font-medium",
                        selectedStrategies.includes(strategy.id)
                          ? "bg-[#00D9A5]/10 text-[#00D9A5]"
                          : "bg-transparent text-slate-500 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/5"
                      )}
                    >
                      <span>{strategy.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filtered Signals List */}
      <div className="space-y-2 max-h-[450px] overflow-y-auto scrollbar-thin">
        {filteredSignals.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">Nessun segnale per le strategie selezionate</p>
        ) : (
          filteredSignals.map((s, i) => {
            const strategy = availableStrategies.find(st => st.id === s.strategyId);
            return (
              <div
                key={i}
                onClick={() => setExpandedNews(expandedNews === `sig-${i}` ? null : `sig-${i}`)}
                onMouseLeave={() => expandedNews === `sig-${i}` && setExpandedNews(null)}
                className={cn(
                  "p-2.5 rounded-lg transition-all cursor-pointer",
                  "bg-white/5 hover:bg-white/8",
                  expandedNews === `sig-${i}` && "ring-1 ring-[#00D9A5]/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/60">{strategy?.shortName}</span>
                    <span className="text-base font-medium text-white/90">{s.asset}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TechBadge variant={s.bias === 'Long' ? 'success' : s.bias === 'Short' ? 'danger' : 'warning'}>
                      {s.bias}
                    </TechBadge>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-white/30 transition-transform",
                      expandedNews === `sig-${i}` && "rotate-180"
                    )} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{s.trigger}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00D9A5] rounded-full"
                        style={{ width: `${s.winRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{s.winRate}%</span>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedNews === `sig-${i}` && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-3 bg-black/40 rounded-lg border border-[#00D9A5]/20">
                        <p className="text-base text-slate-700 leading-relaxed dark:text-white/90">
                          <span className="text-[#00D9A5] font-bold block mb-1">Setup</span>
                          {s.summary}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </TechCard>
  );
};

// News & Activity Sidebar
const ActivitySidebar = ({ news, events, strategies }) => {
  const [activeTab, setActiveTab] = useState('news');
  const [expandedNews, setExpandedNews] = useState(null);

  const newsData = news || [
    { title: 'US Core CPI m/m', time: '14:30', impact: 'high', currency: 'USD', forecast: '0.3%', previous: '0.2%', actual: '0.4%', countdown: 'Uscito', summary: 'Inflazione core sopra attese. Possibile ritardo tagli Fed. USD bullish.' },
    { title: 'US CPI y/y', time: '14:30', impact: 'high', currency: 'USD', forecast: '3.1%', previous: '3.4%', actual: '3.1%', countdown: 'Uscito', summary: 'Inflazione in linea. Mercati stabili, risk-on moderato.' },
    { title: 'Fed Chair Powell Speech', time: '16:00', impact: 'high', currency: 'USD', forecast: '-', previous: '-', actual: null, countdown: '55m', summary: 'Atteso tono hawkish post-CPI. Volatilità attesa su indici e USD.' },
    { title: 'US Retail Sales m/m', time: '14:30', impact: 'high', currency: 'USD', forecast: '0.4%', previous: '0.6%', actual: '0.3%', countdown: 'Uscito', summary: 'Vendite sotto attese. Consumi rallentano, possibile debolezza equity.' },
    { title: 'US Unemployment Claims', time: '14:30', impact: 'medium', currency: 'USD', forecast: '218K', previous: '223K', actual: null, countdown: 'Uscito', summary: 'Mercato lavoro resta solido. Supporta scenario soft-landing.' },
    { title: 'FOMC Minutes', time: '20:00', impact: 'high', currency: 'USD', forecast: '-', previous: '-', actual: null, countdown: '4h 55m', summary: 'Dettagli su prossime mosse Fed. Impatto su bond e USD.' },
    { title: 'US Building Permits', time: '14:30', impact: 'medium', currency: 'USD', forecast: '1.52M', previous: '1.49M', actual: null, countdown: 'Uscito', summary: 'Settore immobiliare in focus. Impatto limitato su mercati.' },
  ];

  return (
    <div className="space-y-4">
      {/* News Section */}
      <TechCard className="p-4 font-apple flex flex-col glass-edge fine-gray-border" style={{ maxHeight: '550px' }}>
        {/* Sticky Header */}
        <h4 className="text-base font-medium text-white/90 mb-3 flex items-center gap-2 sticky top-0 bg-inherit z-10 pb-2">
          <Newspaper className="w-5 h-5 text-[#00D9A5]" />
          News
        </h4>
        {/* Scrollable Content */}
        <div className="space-y-2 overflow-y-auto flex-1 scrollbar-thin">
          {newsData.map((item, i) => (
            <div
              key={i}
              onClick={() => setExpandedNews(expandedNews === i ? null : i)}
              onMouseLeave={() => expandedNews === i && setExpandedNews(null)}
              className={cn(
                "p-2.5 rounded-lg transition-all cursor-pointer subtle-divider",
                item.actual ? "bg-slate-50 border border-slate-200 dark:bg-[#1A1A1A] dark:border-white/10" : "bg-slate-50 hover:bg-slate-100 dark:bg-[#1A1A1A] dark:hover:bg-[#252525]",
                expandedNews === i && "ring-1 ring-slate-300 dark:ring-white/20"
              )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-medium text-slate-900 dark:text-white/90">{item.title}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm",
                    item.countdown === 'Uscito' ? "text-[#00D9A5]" : "text-yellow-400/80"
                  )}>{item.countdown}</span>
                  <span className="text-base font-medium text-[#00D9A5]">{item.time}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 dark:text-white/30 transition-transform",
                    expandedNews === i && "rotate-180"
                  )} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-base font-medium",
                    item.currency === 'USD' ? "text-[#D4AF37]" : "text-slate-400 dark:text-white/40"
                  )}>
                    {item.currency}
                  </span>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    item.impact === 'high' ? "bg-red-400" : "bg-yellow-400"
                  )} />
                </div>
                <div className="flex items-center gap-3 text-base">
                  <span className="text-slate-500 dark:text-white/50">P: <span className="font-bold text-slate-700 dark:text-white/80">{item.previous}</span></span>
                  <span className="text-slate-500 dark:text-white/50">F: <span className="font-bold text-slate-900 dark:text-white">{item.forecast}</span></span>
                  {item.actual && (
                    <span className="text-slate-500 dark:text-white/50">A: <span className="font-bold text-lg text-[#00D9A5]">{item.actual}</span></span>
                  )}
                </div>
              </div>
              {/* Expanded Summary */}
              <AnimatePresence>
                {expandedNews === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg dark:bg-black/40 dark:border-[#00D9A5]/20">
                      <p className="text-base text-slate-700 leading-relaxed dark:text-white/90">
                        <span className="text-[#00D9A5] font-bold block mb-1">Prospettiva</span>
                        {item.summary}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </TechCard>


      {/* Strategy Suggestions - Filtered by Selected Strategies */}
      <StrategySelectorPanel strategies={strategies} expandedNews={expandedNews} setExpandedNews={setExpandedNews} />
      <Link
        to="/strategies"
        className="block mt-3 text-center text-base text-[#00D9A5] hover:underline"
      >
        Vedi tutte le strategie →
      </Link>
    </div>
  );
};

// Daily Bias Header - Compact with inline expandable items (zoom in/out)
const DailyBiasHeader = ({ analyses, vix, regime, nextEvent }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  const bullishCount = analyses ? Object.values(analyses).filter(a => a.direction === 'Up').length : 0;
  const bearishCount = analyses ? Object.values(analyses).filter(a => a.direction === 'Down').length : 0;
  const overallBias = bullishCount > bearishCount ? 'BULLISH' : bearishCount > bullishCount ? 'BEARISH' : 'NEUTRAL';

  // Details content for each metric
  const details = {
    bias: {
      title: 'Daily Bias',
      description: `Sentiment complessivo del mercato basato sull'analisi di ${bullishCount + bearishCount} asset.`,
      stats: [
        { label: 'Bullish', value: bullishCount, color: 'text-[#00D9A5]' },
        { label: 'Bearish', value: bearishCount, color: 'text-red-400' },
        { label: 'Neutral', value: (analyses ? Object.keys(analyses).length : 0) - bullishCount - bearishCount, color: 'text-yellow-400' }
      ],
      interpretation: overallBias === 'BULLISH'
        ? 'Mercato orientato al rialzo. Considera posizioni long su asset forti.'
        : overallBias === 'BEARISH'
          ? 'Mercato orientato al ribasso. Cautela su posizioni long, valuta short.'
          : 'Mercato neutrale. Attendi conferme direzionali prima di operare.'
    },
    vix: {
      title: 'VIX - Volatility Index',
      description: `Indice di volatilità attuale: ${vix?.current || '-'}. Misura le aspettative di volatilità del mercato nei prossimi 30 giorni.`,
      stats: [
        { label: 'Current', value: vix?.current || '-', color: vix?.current > 22 ? 'text-red-400' : vix?.current > 18 ? 'text-yellow-400' : 'text-[#00D9A5]' },
        { label: 'Change', value: `${vix?.change > 0 ? '+' : ''}${vix?.change || 0}%`, color: vix?.change > 0 ? 'text-red-400' : 'text-[#00D9A5]' },
        { label: 'Status', value: vix?.current > 22 ? 'High' : vix?.current > 18 ? 'Normal' : 'Low', color: vix?.current > 22 ? 'text-red-400' : vix?.current > 18 ? 'text-yellow-400' : 'text-[#00D9A5]' }
      ],
      interpretation: !vix?.current
        ? 'Caricamento dati...'
        : vix.current > 22
          ? 'Alta volatilità: mercato nervoso, aumenta il rischio. Riduci size posizioni.'
          : vix.current > 18
            ? 'Volatilità moderata: mercato in movimento, usa stop loss adeguati.'
            : 'Bassa volatilità: mercato calmo, ideale per strategie range-bound.'
    },
    regime: {
      title: 'Market Regime',
      description: `Regime di mercato corrente: ${regime?.toUpperCase() || '-'}. Indica il comportamento generale degli investitori.`,
      stats: [
        { label: 'Mode', value: regime?.toUpperCase() || '-', color: regime === 'risk-on' ? 'text-[#00D9A5]' : regime === 'risk-off' ? 'text-red-400' : 'text-yellow-400' },
        { label: 'Sentiment', value: regime === 'risk-on' ? 'Positive' : regime === 'risk-off' ? 'Defensive' : 'Mixed', color: 'text-white/70' },
        { label: 'Action', value: regime === 'risk-on' ? 'Growth' : regime === 'risk-off' ? 'Safe Haven' : 'Neutral', color: 'text-white/70' }
      ],
      interpretation: regime === 'risk-on'
        ? 'Risk-ON: Investitori favoriscono asset rischiosi (azioni, crypto). Sentiment positivo.'
        : regime === 'risk-off'
          ? 'Risk-OFF: Fuga verso beni rifugio (bonds, oro). Cautela e protezione capitali.'
          : 'Neutrale: Mercato indeciso. Monitora per cambiamenti direzionali.'
    }
  };

  const toggleItem = (item) => {
    setExpandedItem(expandedItem === item ? null : item);
  };

  return (
    <div
      className="space-y-2"
      onMouseLeave={() => expandedItem && setExpandedItem(null)}
    >
      {/* Main Header Row */}
      {/* Main Header Row */}
      <div className="flex items-center justify-between p-3 rounded-lg font-apple bg-white !border !border-slate-400 shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:bg-white/5 dark:!border-white/5 dark:glass-edge dark:shadow-none">
        {/* Left side: Bias + VIX + Regime */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Daily Bias */}
          <button
            onClick={() => toggleItem('bias')}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg transition-all cursor-pointer",
              expandedItem === 'bias' ? "bg-slate-100 ring-1 ring-slate-300 dark:bg-white/10 dark:ring-white/20 tab-border-highlight" : "hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <Target className="w-5 h-5 text-[#00D9A5]" />
            <span className="text-base text-slate-500 dark:text-white/50">Bias:</span>
            <span className={cn(
              "text-lg font-bold",
              overallBias === 'BULLISH' ? "text-[#00D9A5]" : overallBias === 'BEARISH' ? "text-red-400" : "text-yellow-400"
            )}>
              {overallBias}
            </span>
            <span className="text-base text-slate-400 dark:text-white/40">
              (<span className="text-[#00D9A5]">▲{bullishCount}</span> <span className="text-red-400">▼{bearishCount}</span>)
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 dark:text-white/40 transition-transform",
              expandedItem === 'bias' && "rotate-180"
            )} />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />

          {/* VIX */}
          <button
            onClick={() => toggleItem('vix')}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg transition-all cursor-pointer",
              expandedItem === 'vix' ? "bg-slate-100 ring-1 ring-slate-300 dark:bg-white/10 dark:ring-white/20" : "hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <Shield className="w-5 h-5 text-[#00D9A5]" />
            <span className="text-base text-slate-500 dark:text-white/50">VIX</span>
            <span className={cn(
              "text-lg font-bold font-mono",
              vix?.current > 22 ? "text-red-400" : vix?.current > 18 ? "text-yellow-400" : "text-[#00D9A5]"
            )}>
              {vix?.current || '-'}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 dark:text-white/40 transition-transform",
              expandedItem === 'vix' && "rotate-180"
            )} />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />

          {/* Regime */}
          <button
            onClick={() => toggleItem('regime')}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg transition-all cursor-pointer",
              expandedItem === 'regime' ? "bg-slate-100 ring-1 ring-slate-300 dark:bg-white/10 dark:ring-white/20" : "hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <Activity className="w-5 h-5 text-[#00D9A5]" />
            <span className="text-base text-slate-500 dark:text-white/50">Regime:</span>
            <span className={cn(
              "text-lg font-bold",
              regime === 'risk-off' ? "text-red-400" : regime === 'risk-on' ? "text-[#00D9A5]" : "text-yellow-400"
            )}>
              {regime?.toUpperCase() || '-'}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 dark:text-white/40 transition-transform",
              expandedItem === 'regime' && "rotate-180"
            )} />
          </button>
        </div>

        {/* Right side: Next Event */}
        {nextEvent && (
          <div className="flex items-center gap-2 text-base pl-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">{nextEvent.event}</span>
            <span className="text-white/40">{nextEvent.countdown}</span>
          </div>
        )}
      </div>

      {/* Expanded Details Panel - News-style summary */}
      <AnimatePresence>
        {expandedItem && details[expandedItem] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-black/40 rounded-lg border border-[#00D9A5]/20">
              {/* Compact Summary */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="p-2 bg-[#00D9A5]/10 rounded-lg">
                  {expandedItem === 'bias' && <Target className="w-5 h-5 text-[#00D9A5]" />}
                  {expandedItem === 'vix' && <Shield className="w-5 h-5 text-[#00D9A5]" />}
                  {expandedItem === 'regime' && <Activity className="w-5 h-5 text-[#00D9A5]" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-[#00D9A5] mb-1">
                    {details[expandedItem].title}
                  </h4>

                  {/* Inline Stats */}
                  <div className="flex items-center gap-4 mb-2 text-base">
                    {details[expandedItem].stats.map((stat, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-white/40">{stat.label}:</span>
                        <span className={cn("font-bold font-mono", stat.color)}>{stat.value}</span>
                      </span>
                    ))}
                  </div>

                  {/* Interpretation as summary */}
                  <p className="text-base text-slate-700 leading-relaxed dark:text-white/90">
                    <span className="text-[#00D9A5] font-bold">Prospettiva: </span>
                    {details[expandedItem].interpretation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [multiSourceData, setMultiSourceData] = useState(null);
  const [cotSummary, setCotSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteCharts, setFavoriteCharts] = useState(['XAUUSD', 'NAS100', 'SP500']);
  const [favoriteCOT, setFavoriteCOT] = useState(['NAS100', 'SP500']);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [multiRes, cotRes] = await Promise.all([
        axios.get(`${API}/analysis/multi-source`),
        axios.get(`${API}/cot/data`).catch(() => ({ data: null }))
      ]);

      setMultiSourceData(multiRes.data);
      setCotSummary(cotRes.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const { analyses, vix, regime, next_event } = multiSourceData || {};

  // Mock data for demo mode when backend is unavailable
  const mockAnalyses = {
    'XAUUSD': { price: 4765.8, direction: 'Up', confidence: 63, impulse: 'Prosegue', drivers: [{ name: 'Technical', impact: 'Bullish' }] },
    'NAS100': { price: 25442, direction: 'Up', confidence: 60, impulse: 'Prosegue', drivers: [{ name: 'Momentum', impact: 'Strong' }] },
    'SP500': { price: 6928, direction: 'Up', confidence: 63, impulse: 'Prosegue', drivers: [{ name: 'Risk-on', impact: 'Positive' }] },
    'EURUSD': { price: 1.0845, direction: 'Down', confidence: 55, impulse: 'Correzione', drivers: [{ name: 'USD Strength', impact: 'Bearish' }] },
    'BTCUSD': { price: 98420, direction: 'Up', confidence: 70, impulse: 'Prosegue', drivers: [{ name: 'ETF Flows', impact: 'Bullish' }] },
  };

  // Use real data if available, otherwise fallback to mock data
  const analysesData = analyses || mockAnalyses;

  // Build assets array for chart tabs (no VIX)
  const assetsList = Object.entries(analysesData).map(([symbol, data]) => ({
    symbol,
    price: data.price,
    direction: data.direction,
    confidence: data.confidence,
    impulse: data.impulse,
    explanation: data.drivers?.map(d => `${d.name}: ${d.impact}`).join('. '),
    sparkData: [30, 35, 28, 42, 38, 55, 48, 52]
  }));

  // Options mock data
  const optionsData = {
    call_ratio: 58,
    put_ratio: 42,
    bias: 'bullish'
  };

  // Mock COT data for demo mode
  const mockCotData = {
    data: {
      'NAS100': {
        bias: 'Bear',
        categories: {
          asset_manager: { long: 35000, short: 85000 }
        }
      },
      'SP500': {
        bias: 'Bear',
        categories: {
          asset_manager: { long: 42000, short: 78000 }
        }
      },
      'XAUUSD': {
        bias: 'Bull',
        categories: {
          managed_money: { long: 120000, short: 45000 }
        }
      },
      'EURUSD': {
        bias: 'Bull',
        categories: {
          asset_manager: { long: 95000, short: 60000 }
        }
      },
    }
  };

  // Use real COT data if available, otherwise fallback to mock
  const cotDataToUse = cotSummary?.data ? cotSummary : mockCotData;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  return (
    <div className="dashboard-page" data-testid="dashboard-page" id="dashboard-main">
      {/* Header - Enhanced with actions */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/95">
            {getGreeting()}, <span className="text-[#00D9A5]">{user?.name || 'trader'}</span>
          </h1>
          <p className="text-base text-white/50 mt-1 italic">
            "La mente è tutto. Ciò che pensi, diventi." — Buddha
          </p>
          <div className="flex items-center gap-3 mt-2 text-base text-white/50">
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9A5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D9A5]"></span>
              </span>
              Karion AI Active
            </span>
            <Clock className="w-4 h-4" />
            {lastUpdate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                       border border-white/10 hover:border-white/20 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={cn("w-5 h-5 text-white/60", loading && "animate-spin")} />
            <span className="text-base text-white/60 hidden sm:inline">Aggiorna</span>
          </button>
          <ExportButton targetId="dashboard-main" filename="karion-dashboard" />
        </div>
      </div>

      {/* Daily Bias + VIX + Regime - Compact Row */}
      <div className="mb-6">
        <DailyBiasHeader
          analyses={analysesData}
          vix={vix || { current: 17.44, change: -2.3 }}
          regime={regime || 'risk-on'}
          nextEvent={next_event || { event: 'Fed Chair Powell Speech', countdown: '55m' }}
        />
      </div>

      {/* Main Grid: Center + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CENTER: Charts + COT + Options */}
        <div className="lg:col-span-2 space-y-6">

          {/* Asset Charts Grid */}
          <AssetChartPanel
            assets={assetsList}
            favoriteCharts={favoriteCharts}
            onFavoriteChange={setFavoriteCharts}
          />

          {/* Options + COT Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <OptionsPanel optionsData={optionsData} />
            <COTPanel cotData={cotDataToUse} favoriteCOT={favoriteCOT} onFavoriteCOTChange={setFavoriteCOT} />
          </div>
        </div>

        {/* RIGHT SIDEBAR: News + Activity + Strategies */}
        <div className="lg:col-span-1">
          <ActivitySidebar />
        </div>
      </div>
    </div>
  );
}
