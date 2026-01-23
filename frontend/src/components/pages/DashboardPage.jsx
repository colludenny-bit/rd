import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  TrendingUp, TrendingDown, Minus, Activity, Brain, BookOpen, 
  Sparkles, Clock, Target, AlertTriangle, Zap, BarChart3, Shield,
  RefreshCw, ChevronRight, Users, Dices, ArrowRight
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

// Fixed-size Market Analysis Card (non-expandable by default)
const MarketAnalysisCard = ({ symbol, analysis, price, onClick }) => {
  const isUp = analysis.direction === 'Up';
  const isDown = analysis.direction === 'Down';
  
  const directionColor = isUp ? 'text-primary' : isDown ? 'text-red-400' : 'text-yellow-400';
  const bgColor = isUp ? 'bg-primary/5' : isDown ? 'bg-red-500/5' : 'bg-yellow-500/5';
  const borderColor = isUp ? 'border-primary/30' : isDown ? 'border-red-500/30' : 'border-yellow-500/30';
  const DirectionIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02] border h-[200px]",
        bgColor, borderColor
      )}
      onClick={onClick}
      data-testid={`market-card-${symbol}`}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DirectionIcon className={cn("w-5 h-5", directionColor)} />
            <span className="font-bold text-lg">{symbol}</span>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-semibold",
            isUp ? "bg-primary/20 text-primary" : 
            isDown ? "bg-red-500/20 text-red-400" : 
            "bg-yellow-500/20 text-yellow-400"
          )}>
            {analysis.direction} {analysis.p_up}%
          </span>
        </div>
        
        {/* Price */}
        <div className="text-center mb-3">
          <span className="text-2xl font-bold font-mono">{price?.toFixed(symbol === 'EURUSD' ? 5 : 2) || '-'}</span>
        </div>
        
        {/* Stats Grid - Fixed */}
        <div className="grid grid-cols-3 gap-2 flex-1">
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">Conf.</p>
            <p className={cn("font-bold text-sm", directionColor)}>{analysis.confidence}%</p>
          </div>
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">Impulso</p>
            <p className={cn(
              "font-bold text-sm truncate",
              analysis.impulse === 'Prosegue' ? "text-primary" :
              analysis.impulse === 'Inverte' ? "text-red-400" : "text-yellow-400"
            )}>
              {analysis.impulse}
            </p>
          </div>
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">Regime</p>
            <p className={cn(
              "font-bold text-sm truncate",
              analysis.regime === 'Risk-On' ? "text-primary" :
              analysis.regime === 'Risk-Off' ? "text-red-400" : "text-yellow-400"
            )}>
              {analysis.regime?.split('-')[0]}
            </p>
          </div>
        </div>

        {/* Trade Ready Badge */}
        {analysis.trade_ready && (
          <div className="flex items-center justify-center gap-1 mt-2 py-1 bg-primary/10 rounded-lg">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-medium text-primary">Trade Candidate</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Analysis Detail Modal
const AnalysisModal = ({ analysis, onClose }) => {
  if (!analysis) return null;
  
  const isUp = analysis.direction === 'Up';
  const isDown = analysis.direction === 'Down';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {isUp ? <TrendingUp className="w-6 h-6 text-primary" /> :
             isDown ? <TrendingDown className="w-6 h-6 text-red-400" /> :
             <Minus className="w-6 h-6 text-yellow-400" />}
            {analysis.symbol}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        
        {/* Summary */}
        <div className="p-4 bg-secondary/30 rounded-xl mb-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Direzione</p>
              <p className={cn("font-bold", isUp ? "text-primary" : isDown ? "text-red-400" : "text-yellow-400")}>
                {analysis.direction}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">P(up)</p>
              <p className="font-bold">{analysis.p_up}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="font-bold">{analysis.confidence}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Impulso</p>
              <p className={cn(
                "font-bold",
                analysis.impulse === 'Prosegue' ? "text-primary" : "text-yellow-400"
              )}>
                {analysis.impulse}
              </p>
            </div>
          </div>
        </div>
        
        {/* Drivers */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Driver Principali
          </h4>
          <div className="space-y-2">
            {analysis.drivers?.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                <span className="text-sm">{d.name}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  d.impact === 'bullish' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"
                )}>
                  {d.impact} - {d.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Invalidation */}
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm">
            <span className="font-medium text-red-400">Invalidazione:</span>{' '}
            {analysis.invalidation}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Quick Link Card for other pages
const QuickLinkCard = ({ to, icon: Icon, title, value, subtitle, color = 'primary' }) => {
  const colorClasses = {
    primary: 'hover:border-primary/50 hover:bg-primary/5',
    yellow: 'hover:border-yellow-500/50 hover:bg-yellow-500/5',
    red: 'hover:border-red-500/50 hover:bg-red-500/5'
  };
  
  return (
    <Link to={to}>
      <Card className={cn(
        "h-full cursor-pointer transition-all border-border/50",
        colorClasses[color]
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [multiSourceData, setMultiSourceData] = useState(null);
  const [quote, setQuote] = useState(null);
  const [psychStats, setPsychStats] = useState(null);
  const [cotSummary, setCotSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [multiRes, quoteRes, psychRes, cotRes] = await Promise.all([
        axios.get(`${API}/analysis/multi-source`),
        axios.get(`${API}/philosophy/quote`),
        axios.get(`${API}/psychology/stats`).catch(() => ({ data: null })),
        axios.get(`${API}/cot/data`).catch(() => ({ data: null }))
      ]);
      
      setMultiSourceData(multiRes.data);
      setQuote(quoteRes.data);
      setPsychStats(psychRes.data);
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
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const { analyses, vix, regime, next_event } = multiSourceData || {};

  // Calculate summary stats
  const bullishCount = analyses ? Object.values(analyses).filter(a => a.direction === 'Up').length : 0;
  const tradeCandidates = analyses ? Object.values(analyses).filter(a => a.trade_ready).length : 0;

  return (
    <div className="space-y-6 fade-in" data-testid="dashboard-page">
      {/* Header with Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          {getGreeting(t)}, <span className="text-gradient">{user?.name || 'Trader'}</span>
        </h1>
        
        {quote && (
          <p className="text-muted-foreground italic text-sm md:text-base">
            "{quote.quote}" — <span className="text-primary">{quote.author}</span>
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Karion AI Attivo
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            Update: {lastUpdate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>

      {/* VIX/Regime Summary Bar */}
      {vix && (
        <Card className={cn(
          "border",
          regime === 'risk-off' ? "bg-red-500/5 border-red-500/30" :
          regime === 'risk-on' ? "bg-primary/5 border-primary/30" :
          "bg-yellow-500/5 border-yellow-500/30"
        )}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Activity className={cn(
                    "w-5 h-5",
                    regime === 'risk-off' ? "text-red-400" :
                    regime === 'risk-on' ? "text-primary" : "text-yellow-400"
                  )} />
                  <span className="font-medium">VIX: {vix.current}</span>
                  <span className={cn(
                    "text-sm",
                    vix.change > 0 ? "text-red-400" : "text-primary"
                  )}>
                    ({vix.change > 0 ? '+' : ''}{vix.change}%)
                  </span>
                </div>
                <div className="h-4 w-px bg-border hidden md:block" />
                <div className="flex items-center gap-2">
                  <Shield className={cn(
                    "w-4 h-4",
                    regime === 'risk-off' ? "text-red-400" :
                    regime === 'risk-on' ? "text-primary" : "text-yellow-400"
                  )} />
                  <span className={cn(
                    "font-medium uppercase",
                    regime === 'risk-off' ? "text-red-400" :
                    regime === 'risk-on' ? "text-primary" : "text-yellow-400"
                  )}>
                    {regime}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground hidden md:inline">
                  {bullishCount}/4 Bullish • {tradeCandidates} Trade Ready
                </span>
                {next_event && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {next_event.event} in {next_event.countdown}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-Source Analysis Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analisi Multi-Sorgente
          </h2>
          <span className="text-sm text-muted-foreground">
            Aggiornamento orario
          </span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {['XAUUSD', 'NAS100', 'SP500', 'EURUSD'].map((symbol, index) => (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {analyses?.[symbol] ? (
                <MarketAnalysisCard 
                  symbol={symbol} 
                  analysis={analyses[symbol]}
                  price={analyses[symbol].price}
                  onClick={() => setSelectedAnalysis(analyses[symbol])}
                />
              ) : (
                <Card className="h-[200px] flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Access Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Panoramica Rapida
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLinkCard 
            to="/risk"
            icon={AlertTriangle}
            title="Risk Score"
            value={vix ? (vix.current > 22 ? "HIGH" : vix.current > 18 ? "MED" : "LOW") : "-"}
            subtitle={`VIX ${vix?.current || '-'}`}
            color={vix?.current > 22 ? 'red' : vix?.current > 18 ? 'yellow' : 'primary'}
          />
          
          <QuickLinkCard 
            to="/cot"
            icon={TrendingUp}
            title="COT Bias"
            value={cotSummary?.data?.SP500?.bias || '-'}
            subtitle="S&P 500"
            color="primary"
          />
          
          <QuickLinkCard 
            to="/psychology"
            icon={Brain}
            title="Confidence"
            value={`${psychStats?.avg_confidence || 0}/10`}
            subtitle="Media 30gg"
            color="primary"
          />
          
          <QuickLinkCard 
            to="/montecarlo"
            icon={Dices}
            title="Simulazioni"
            value="MC"
            subtitle="Monte Carlo"
            color="primary"
          />
        </div>
      </section>

      {/* Live Activity & COT Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity */}
        <Card className="bg-card/80 border-border/50">
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
            <div className="space-y-2">
              {[
                { 
                  text: `VIX ${vix?.change > 0 ? 'in salita' : 'in calo'} - ${regime?.toUpperCase() || 'Mixed'}`, 
                  icon: Activity,
                  highlight: Math.abs(vix?.change || 0) > 2
                },
                { 
                  text: tradeCandidates > 0 
                    ? `${tradeCandidates} Trade Candidate attivi`
                    : 'Nessun trade candidate', 
                  icon: Zap,
                  highlight: tradeCandidates > 0
                },
                {
                  text: next_event 
                    ? `Evento: ${next_event.event} - ${next_event.countdown}`
                    : 'Nessun evento macro imminente',
                  icon: Clock,
                  highlight: !!next_event
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    item.highlight ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4",
                    item.highlight ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* COT Summary */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                COT Snapshot
              </span>
              <Link to="/cot" className="text-xs text-primary hover:underline flex items-center gap-1">
                Dettagli <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {cotSummary?.data && Object.entries(cotSummary.data).slice(0, 4).map(([symbol, data]) => (
                <div 
                  key={symbol}
                  className={cn(
                    "p-3 rounded-xl",
                    data.bias === 'Bull' ? "bg-primary/10" :
                    data.bias === 'Bear' ? "bg-red-500/10" :
                    "bg-yellow-500/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{symbol}</span>
                    <span className={cn(
                      "text-xs font-bold",
                      data.bias === 'Bull' ? "text-primary" :
                      data.bias === 'Bear' ? "text-red-400" :
                      "text-yellow-400"
                    )}>
                      {data.bias}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Squeeze: {data.squeeze_risk}%</span>
                    <span>Conf: {data.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {selectedAnalysis && (
          <AnalysisModal 
            analysis={selectedAnalysis} 
            onClose={() => setSelectedAnalysis(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
