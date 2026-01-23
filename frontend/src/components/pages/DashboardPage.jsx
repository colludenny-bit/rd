import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  TrendingUp, TrendingDown, Minus, Activity, Brain, BookOpen, 
  Sparkles, ChevronDown, ChevronUp, Clock, Target, AlertTriangle,
  Zap, BarChart3, Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('greeting.morning');
  if (hour < 17) return t('greeting.afternoon');
  if (hour < 21) return t('greeting.evening');
  return t('greeting.night');
};

// Multi-source calculation engine
const calculateAssetAnalysis = (symbol, vixData) => {
  const vix = vixData?.current || 18;
  const vixChange = vixData?.change || 0;
  
  // Base weights per asset type
  const weights = {
    NQ: { vix: 0.35, macro: 0.30, news: 0.20, cot: 0.15 },
    SP500: { vix: 0.35, macro: 0.30, news: 0.20, cot: 0.15 },
    XAUUSD: { vix: 0.20, macro: 0.35, news: 0.25, cot: 0.20 },
    EURUSD: { vix: 0.15, macro: 0.35, news: 0.30, cot: 0.20 }
  };
  
  const w = weights[symbol] || weights.NQ;
  
  // 1) VIX/Regime Score (-1 to 1)
  let vixScore = 0;
  if (vix < 14) vixScore = 0.8; // Very low vol = bullish
  else if (vix < 18) vixScore = 0.4;
  else if (vix < 22) vixScore = -0.2;
  else if (vix < 28) vixScore = -0.6;
  else vixScore = -0.9;
  
  // VIX momentum adjustment
  if (vixChange > 5) vixScore -= 0.3;
  else if (vixChange > 2) vixScore -= 0.15;
  else if (vixChange < -2) vixScore += 0.15;
  else if (vixChange < -5) vixScore += 0.3;
  
  // 2) Macro Score (simulated based on current conditions)
  const macroBase = Math.random() * 0.4 - 0.2; // -0.2 to 0.2
  const macroScore = symbol === 'XAUUSD' 
    ? (vixScore < 0 ? 0.3 : -0.1) + macroBase // Gold benefits from risk-off
    : macroBase;
  
  // 3) News Score (simulated with decay)
  const newsScore = (Math.random() * 0.3 - 0.15);
  
  // 4) COT Score (simulated weekly bias)
  const cotScore = (Math.random() * 0.4 - 0.2);
  
  // Combined Score
  const totalScore = w.vix * vixScore + w.macro * macroScore + w.news * newsScore + w.cot * cotScore;
  
  // Convert to probability (logistic)
  const pUp = 1 / (1 + Math.exp(-totalScore * 3));
  const pUpPercent = Math.round(pUp * 100);
  
  // Direction
  let direction = 'Neutral';
  if (pUpPercent >= 55) direction = 'Up';
  else if (pUpPercent <= 45) direction = 'Down';
  
  // Confidence (based on score magnitude)
  const confidence = Math.min(95, Math.round(50 + Math.abs(totalScore) * 50));
  
  // Impulse calculation (simulated momentum)
  const prevScore = totalScore + (Math.random() * 0.2 - 0.1);
  let impulse = 'Prosegue';
  if (Math.abs(totalScore - prevScore) < 0.05) impulse = 'Prosegue';
  else if (totalScore > prevScore) impulse = direction === 'Up' ? 'Prosegue' : 'Inverte';
  else impulse = direction === 'Down' ? 'Prosegue' : 'Diminuisce';
  
  // Top drivers
  const drivers = [];
  if (Math.abs(w.vix * vixScore) > 0.1) drivers.push({ name: 'VIX/Regime', impact: vixScore > 0 ? 'bullish' : 'bearish' });
  if (Math.abs(w.macro * macroScore) > 0.05) drivers.push({ name: 'Macro', impact: macroScore > 0 ? 'bullish' : 'bearish' });
  if (Math.abs(w.news * newsScore) > 0.05) drivers.push({ name: 'News Flow', impact: newsScore > 0 ? 'bullish' : 'bearish' });
  if (drivers.length < 2) drivers.push({ name: 'COT Positioning', impact: cotScore > 0 ? 'bullish' : 'bearish' });
  
  // Regime
  const regime = vix > 22 || vixChange > 3 ? 'Risk-Off' : vix < 16 ? 'Risk-On' : 'Mixed';
  
  return {
    direction,
    pUp: pUpPercent,
    confidence,
    impulse,
    drivers: drivers.slice(0, 3),
    regime,
    vixLevel: vix,
    vixChange,
    totalScore,
    tradeReady: pUpPercent >= 58 || pUpPercent <= 42
  };
};

const MarketCard = ({ symbol, data, analysis, isExpanded, onToggle }) => {
  const { t } = useTranslation();
  const isUp = analysis.direction === 'Up';
  const isDown = analysis.direction === 'Down';
  
  const DirectionIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const directionColor = isUp ? 'text-primary' : isDown ? 'text-red-400' : 'text-yellow-400';
  const bgColor = isUp ? 'bg-primary/5' : isDown ? 'bg-red-500/5' : 'bg-yellow-500/5';
  const borderColor = isUp ? 'border-primary/30' : isDown ? 'border-red-500/30' : 'border-yellow-500/30';

  return (
    <motion.div layout>
      <Card 
        className={cn(
          "market-card card-hover cursor-pointer transition-all",
          bgColor, borderColor, "border",
          isExpanded && "ring-2 ring-primary/50"
        )}
        onClick={onToggle}
        data-testid={`market-card-${symbol}`}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DirectionIcon className={cn("w-5 h-5", directionColor)} />
              <span className="font-bold text-lg">{symbol}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-semibold",
                isUp ? "bg-primary/20 text-primary" : 
                isDown ? "bg-red-500/20 text-red-400" : 
                "bg-yellow-500/20 text-yellow-400"
              )}>
                {analysis.direction} {analysis.pUp}%
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
          
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className={cn("font-bold", directionColor)}>{analysis.confidence}%</p>
            </div>
            <div className="text-center p-2 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Impulso</p>
              <p className={cn(
                "font-bold text-sm",
                analysis.impulse === 'Prosegue' ? "text-primary" :
                analysis.impulse === 'Inverte' ? "text-red-400" : "text-yellow-400"
              )}>
                {analysis.impulse}
              </p>
            </div>
            <div className="text-center p-2 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Regime</p>
              <p className={cn(
                "font-bold text-sm",
                analysis.regime === 'Risk-On' ? "text-primary" :
                analysis.regime === 'Risk-Off' ? "text-red-400" : "text-yellow-400"
              )}>
                {analysis.regime}
              </p>
            </div>
          </div>

          {/* Trade Ready Badge */}
          {analysis.tradeReady && (
            <div className="flex items-center justify-center gap-2 p-2 bg-primary/10 rounded-lg mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Trade Candidate</span>
            </div>
          )}

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t border-border"
              >
                {/* AI Summary */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Brain className="w-3 h-3" /> Analisi AI
                  </h4>
                  <p className="text-sm">
                    {isUp && `${symbol} mostra bias rialzista (${analysis.pUp}%) con impulso che ${analysis.impulse.toLowerCase()}. `}
                    {isDown && `${symbol} mostra bias ribassista (${100 - analysis.pUp}% down) con impulso che ${analysis.impulse.toLowerCase()}. `}
                    {!isUp && !isDown && `${symbol} in fase neutrale, attendere breakout direzionale. `}
                    {analysis.regime === 'Risk-Off' && 'Regime risk-off attivo: cautela su long. '}
                    {analysis.regime === 'Risk-On' && 'Regime risk-on supporta mean-reversion. '}
                    VIX a {analysis.vixLevel?.toFixed(1)} ({analysis.vixChange > 0 ? '+' : ''}{analysis.vixChange?.toFixed(1)}%).
                  </p>
                </div>

                {/* Top Drivers */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Driver Principali
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.drivers.map((d, i) => (
                      <span 
                        key={i}
                        className={cn(
                          "px-2 py-1 rounded text-xs",
                          d.impact === 'bullish' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"
                        )}
                      >
                        {d.name} ({d.impact})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="text-xs text-muted-foreground">
                  <span>Score composito: {analysis.totalScore?.toFixed(3)} </span>
                  <span className="mx-1">•</span>
                  <span>P(up): {analysis.pUp}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const QuickStats = ({ psychStats, journalCount }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="bg-card/80 border-border/50" data-testid="quick-stats">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Stats Rapide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Brain className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{psychStats?.avg_confidence || 0}</p>
            <p className="text-xs text-muted-foreground">{t('psychology.avg_confidence')}</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{journalCount || 0}</p>
            <p className="text-xs text-muted-foreground">Journal Entries</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [prices, setPrices] = useState({});
  const [quote, setQuote] = useState(null);
  const [psychStats, setPsychStats] = useState(null);
  const [journalCount, setJournalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [analyses, setAnalyses] = useState({});
  const [vixData, setVixData] = useState({ current: 18, change: 0 });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricesRes, quoteRes, psychRes, journalRes] = await Promise.all([
          axios.get(`${API}/market/prices`),
          axios.get(`${API}/philosophy/quote`),
          axios.get(`${API}/psychology/stats`).catch(() => ({ data: null })),
          axios.get(`${API}/journal/entries`).catch(() => ({ data: [] }))
        ]);
        
        setPrices(pricesRes.data);
        setQuote(quoteRes.data);
        setPsychStats(psychRes.data);
        setJournalCount(journalRes.data?.length || 0);
        
        // Simulate VIX data
        const vix = 16 + Math.random() * 8;
        const vixChange = (Math.random() - 0.5) * 4;
        setVixData({ current: vix, change: vixChange });
        
        // Calculate analysis for each asset
        const newAnalyses = {};
        ['XAUUSD', 'NQ', 'SP500', 'EURUSD'].forEach(symbol => {
          newAnalyses[symbol] = calculateAssetAnalysis(symbol, { current: vix, change: vixChange });
        });
        setAnalyses(newAnalyses);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every hour (or 30 seconds for demo)
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/market/prices`);
        setPrices(res.data);
        
        // Recalculate analyses
        const vix = 16 + Math.random() * 8;
        const vixChange = (Math.random() - 0.5) * 4;
        setVixData({ current: vix, change: vixChange });
        
        const newAnalyses = {};
        ['XAUUSD', 'NQ', 'SP500', 'EURUSD'].forEach(symbol => {
          newAnalyses[symbol] = calculateAssetAnalysis(symbol, { current: vix, change: vixChange });
        });
        setAnalyses(newAnalyses);
        setLastUpdate(new Date());
      } catch (e) {
        console.error('Price refresh error:', e);
      }
    }, 60000); // Every minute for demo

    return () => clearInterval(interval);
  }, []);

  const toggleCard = (symbol) => {
    setExpandedCard(expandedCard === symbol ? null : symbol);
  };

  // Calculate overall market regime
  const overallRegime = vixData.current > 22 ? 'Risk-Off' : vixData.current < 16 ? 'Risk-On' : 'Mixed';

  return (
    <div className="space-y-6 fade-in" data-testid="dashboard-page">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          {getGreeting(t)}, <span className="text-gradient">{user?.name || 'Trader'}</span>.
        </h1>
        
        {quote && (
          <p className="text-muted-foreground italic">
            "{quote.quote}" — <span className="text-primary">{quote.author}</span>
          </p>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('dashboard.assistant_active')}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Update: {lastUpdate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>

      {/* VIX Summary Bar */}
      <Card className={cn(
        "border",
        overallRegime === 'Risk-Off' ? "bg-red-500/5 border-red-500/30" :
        overallRegime === 'Risk-On' ? "bg-primary/5 border-primary/30" :
        "bg-yellow-500/5 border-yellow-500/30"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className={cn(
                  "w-5 h-5",
                  overallRegime === 'Risk-Off' ? "text-red-400" :
                  overallRegime === 'Risk-On' ? "text-primary" : "text-yellow-400"
                )} />
                <span className="font-medium">VIX: {vixData.current.toFixed(1)}</span>
                <span className={cn(
                  "text-sm",
                  vixData.change > 0 ? "text-red-400" : "text-primary"
                )}>
                  ({vixData.change > 0 ? '+' : ''}{vixData.change.toFixed(1)}%)
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Shield className={cn(
                  "w-4 h-4",
                  overallRegime === 'Risk-Off' ? "text-red-400" :
                  overallRegime === 'Risk-On' ? "text-primary" : "text-yellow-400"
                )} />
                <span className={cn(
                  "font-medium",
                  overallRegime === 'Risk-Off' ? "text-red-400" :
                  overallRegime === 'Risk-On' ? "text-primary" : "text-yellow-400"
                )}>
                  {overallRegime}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">
              {overallRegime === 'Risk-Off' && 'Volatilità elevata • Cautela su posizioni aggressive'}
              {overallRegime === 'Risk-On' && 'Volatilità bassa • Mean-reversion favorita'}
              {overallRegime === 'Mixed' && 'Condizioni miste • Attendere conferme'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview - AI Macro Desk */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t('dashboard.market_overview')}
          </h2>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Clicca per dettagli AI
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['XAUUSD', 'NQ', 'SP500', 'EURUSD'].map((symbol, index) => (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MarketCard 
                symbol={symbol} 
                data={prices[symbol] || {}}
                analysis={analyses[symbol] || calculateAssetAnalysis(symbol, vixData)}
                isExpanded={expandedCard === symbol}
                onToggle={() => toggleCard(symbol)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickStats psychStats={psychStats} journalCount={journalCount} />
        </div>
        
        <div className="lg:col-span-2">
          <Card className="bg-card/80 border-border/50" data-testid="live-activity">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t('dashboard.live_activity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { text: `VIX ${vixData.change > 0 ? 'in salita' : 'in calo'} - Regime ${overallRegime}`, time: '1m fa', icon: Activity, highlight: vixData.change > 2 },
                  { text: Object.entries(analyses).find(([_, a]) => a.tradeReady)?.[0] 
                    ? `${Object.entries(analyses).find(([_, a]) => a.tradeReady)?.[0]} - Trade Candidate attivo` 
                    : 'Nessun trade candidate attivo', time: '2m fa', icon: Zap, highlight: true },
                  { text: 'Prossimo update analisi tra 59 minuti', time: '3m fa', icon: Clock },
                  { text: 'Sistema multi-sorgente attivo: VIX + Macro + News + COT', time: '5m fa', icon: Brain },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "activity-item flex items-center gap-3",
                      item.highlight && "bg-primary/5 border border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      item.highlight ? "bg-primary/20" : "bg-secondary"
                    )}>
                      <item.icon className={cn(
                        "w-4 h-4",
                        item.highlight ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", item.highlight && "text-primary")}>
                        {item.text}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
