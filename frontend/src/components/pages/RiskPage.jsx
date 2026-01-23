import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';
import { 
  AlertTriangle, Activity, Shield, TrendingUp, TrendingDown,
  Clock, RefreshCw, ArrowUp, ArrowDown, Minus, Target,
  Calendar, BarChart3, Gauge, Brain, Zap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Risk Score Gauge Component
const RiskGauge = ({ score, category }) => {
  const rotation = (score / 100) * 180 - 90;
  const categoryColors = {
    SAFE: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary' },
    MEDIUM: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
    HIGH: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' }
  };
  const colors = categoryColors[category] || categoryColors.MEDIUM;

  return (
    <div className="relative w-48 h-24 mx-auto mb-4">
      {/* Gauge background */}
      <div className="absolute inset-0 rounded-t-full border-8 border-b-0 border-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-500 to-red-500 opacity-30" />
      </div>
      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-20 bg-foreground origin-bottom transition-transform duration-1000"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      />
      {/* Center dot */}
      <div className="absolute bottom-0 left-1/2 w-4 h-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground border-2 border-background" />
      {/* Score display */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
        <span className={cn("text-4xl font-bold", colors.text)}>{score}</span>
        <span className="text-muted-foreground text-lg">/100</span>
      </div>
    </div>
  );
};

// Component Card for risk breakdown
const ComponentCard = ({ name, value, maxValue = 25, description, icon: Icon }) => {
  const percentage = (value / maxValue) * 100;
  const getColor = () => {
    if (percentage >= 70) return 'bg-red-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <div className="p-3 bg-secondary/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-medium">{name}</span>
        </div>
        <span className="text-sm font-bold">{value}/{maxValue}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-full", getColor())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

// Asset Risk Card
const AssetRiskCard = ({ symbol, data, tilt }) => {
  const tiltColors = {
    green: 'border-primary/50 bg-primary/5',
    yellow: 'border-yellow-500/50 bg-yellow-500/5',
    red: 'border-red-500/50 bg-red-500/5'
  };

  return (
    <Card className={cn("border", tiltColors[tilt?.color] || 'border-border/50')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{symbol}</span>
          <span className="text-primary font-mono">
            {typeof data.current === 'number' 
              ? data.current.toFixed(symbol === 'EURUSD' ? 5 : 2)
              : data.current}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Price Levels */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-secondary/30 rounded">
            <p className="text-xs text-muted-foreground">Weekly H/L</p>
            <p>{data.weekly_high} / {data.weekly_low}</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded">
            <p className="text-xs text-muted-foreground">2W H/L</p>
            <p>{data.two_week_high} / {data.two_week_low}</p>
          </div>
        </div>
        
        {/* Distance to extreme */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Distanza estremo:</span>
          <span className={cn(
            "font-bold",
            data.distance_to_extreme <= 0.5 ? "text-red-400" :
            data.distance_to_extreme <= 1 ? "text-yellow-400" : "text-primary"
          )}>
            {data.distance_to_extreme}% ({data.nearest_extreme})
          </span>
        </div>

        {/* Tilt */}
        {tilt && (
          <div className={cn(
            "p-2 rounded text-xs",
            tilt.color === 'green' ? "bg-primary/10" :
            tilt.color === 'yellow' ? "bg-yellow-500/10" : "bg-red-500/10"
          )}>
            <p className={cn(
              "font-medium mb-1",
              tilt.color === 'green' ? "text-primary" :
              tilt.color === 'yellow' ? "text-yellow-400" : "text-red-400"
            )}>
              {tilt.tilt.replace('-', ' ').toUpperCase()}
            </p>
            <p className="text-muted-foreground">{tilt.text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function RiskPage() {
  const [riskData, setRiskData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [previousScore, setPreviousScore] = useState(null);

  const fetchRiskData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      setPreviousScore(riskData?.risk_score);
    }
    
    try {
      const response = await axios.get(`${API}/risk/analysis`);
      setRiskData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching risk data:', err);
      setError('Errore nel caricamento dei dati di rischio');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [riskData?.risk_score]);

  useEffect(() => {
    fetchRiskData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => fetchRiskData(true), 120000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="risk-page-loading">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !riskData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4" data-testid="risk-page-error">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-muted-foreground">{error || 'Dati non disponibili'}</p>
        <Button onClick={() => fetchRiskData()}>Riprova</Button>
      </div>
    );
  }

  const { risk_score, risk_category, vix, components, reasons, assets, expected_move, next_event, asset_tilts, macro_events, last_update } = riskData;
  const scoreChanged = previousScore !== null && previousScore !== risk_score;

  return (
    <div className="space-y-6 fade-in" data-testid="risk-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-primary" />
            Risk Assessment
          </h1>
          <p className="text-muted-foreground mt-1">
            Valutazione rischio AI-powered • Update: {last_update}
            {vix?.source === 'yahoo_finance' && (
              <span className="ml-2 text-xs text-primary">(Live Data)</span>
            )}
          </p>
        </div>
        
        <Button 
          onClick={() => fetchRiskData(true)}
          disabled={isRefreshing}
          className="rounded-xl bg-primary hover:bg-primary/90"
          data-testid="refresh-risk-btn"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          Update
        </Button>
      </motion.div>

      {/* Score Change Alert */}
      <AnimatePresence>
        {scoreChanged && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-3 rounded-xl flex items-center gap-3",
              risk_score > previousScore 
                ? "bg-red-500/10 border border-red-500/30" 
                : "bg-primary/10 border border-primary/30"
            )}
          >
            {risk_score > previousScore ? (
              <ArrowUp className="w-5 h-5 text-red-400" />
            ) : (
              <ArrowDown className="w-5 h-5 text-primary" />
            )}
            <span className="text-sm">
              Risk Score {risk_score > previousScore ? 'aumentato' : 'diminuito'}: {previousScore} → {risk_score}
              {risk_score > previousScore 
                ? ' • Considera riduzione rischio posizioni aperte'
                : ' • Condizioni più favorevoli per operatività'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabs */}
      <Tabs defaultValue="risk-level" className="space-y-4">
        <TabsList className="bg-secondary/50 p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger value="risk-level" className="rounded-lg" data-testid="tab-risk-level">
            <Gauge className="w-4 h-4 mr-2" />
            Risk Level
          </TabsTrigger>
          <TabsTrigger value="vix" className="rounded-lg" data-testid="tab-vix">
            <Activity className="w-4 h-4 mr-2" />
            VIX Index
          </TabsTrigger>
          <TabsTrigger value="assets" className="rounded-lg" data-testid="tab-assets">
            <BarChart3 className="w-4 h-4 mr-2" />
            Asset Risk
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-lg" data-testid="tab-events">
            <Calendar className="w-4 h-4 mr-2" />
            Macro Events
          </TabsTrigger>
        </TabsList>

        {/* Tab: Risk Level */}
        <TabsContent value="risk-level" className="space-y-4">
          {/* Main Risk Score Card */}
          <Card className={cn(
            "border-2",
            risk_category === 'SAFE' ? "border-primary/50 bg-primary/5" :
            risk_category === 'MEDIUM' ? "border-yellow-500/50 bg-yellow-500/5" :
            "border-red-500/50 bg-red-500/5"
          )}>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <RiskGauge score={risk_score} category={risk_category} />
                <div className="mt-8">
                  <span className={cn(
                    "px-4 py-2 rounded-full text-lg font-bold",
                    risk_category === 'SAFE' ? "bg-primary/20 text-primary" :
                    risk_category === 'MEDIUM' ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {risk_category}
                  </span>
                </div>
              </div>

              {/* Main Reasons */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Motivi principali:</h4>
                {reasons.map((reason, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium">{reason.name}:</span>
                    <span className="text-muted-foreground">{reason.desc}</span>
                    <span className="ml-auto font-bold">{reason.value}/25</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Components Breakdown */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Breakdown Componenti</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ComponentCard 
                name="VIX Level" 
                value={components.vix_level} 
                description={`VIX a ${vix.current}`}
                icon={Activity}
              />
              <ComponentCard 
                name="VIX Momentum" 
                value={components.vix_momentum} 
                description={`Variazione ${vix.change > 0 ? '+' : ''}${vix.change}%`}
                icon={TrendingUp}
              />
              <ComponentCard 
                name="Event Risk" 
                value={components.event_risk} 
                description={next_event ? `Evento tra ${next_event.hours_away}h` : 'No eventi imminenti'}
                icon={Calendar}
              />
              <ComponentCard 
                name="Market Stretch" 
                value={components.market_stretch} 
                description="Distanza da estremi 2W"
                icon={Target}
              />
            </CardContent>
          </Card>

          {/* Expected Move */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Expected Move Giornaliero (1σ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Percentuale</p>
                  <p className="text-3xl font-bold">±{expected_move.percent}%</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">S&P 500 (punti)</p>
                  <p className="text-3xl font-bold">±{expected_move.sp500_points}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Movimento atteso basato su VIX/√252. Se range oggi supera questo valore, volatilità è elevata.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: VIX Index */}
        <TabsContent value="vix" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* VIX Current */}
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6 text-center">
                <Activity className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-xs text-muted-foreground mb-1">VIX Attuale</p>
                <p className="text-5xl font-bold">{vix.current}</p>
                {vix.source === 'yahoo_finance' && (
                  <p className="text-xs text-primary mt-1">Live</p>
                )}
              </CardContent>
            </Card>

            {/* VIX Change */}
            <Card className={cn(
              "border-border/50",
              vix.change > 0 ? "bg-red-500/10" : "bg-primary/10"
            )}>
              <CardContent className="p-6 text-center">
                {vix.change > 0 ? (
                  <ArrowUp className="w-10 h-10 mx-auto mb-3 text-red-400" />
                ) : (
                  <ArrowDown className="w-10 h-10 mx-auto mb-3 text-primary" />
                )}
                <p className="text-xs text-muted-foreground mb-1">Variazione vs Ieri</p>
                <p className={cn(
                  "text-4xl font-bold",
                  vix.change > 0 ? "text-red-400" : "text-primary"
                )}>
                  {vix.change > 0 ? '+' : ''}{vix.change}%
                </p>
              </CardContent>
            </Card>

            {/* VIX Yesterday */}
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mb-1">Close Precedente</p>
                <p className="text-4xl font-bold text-muted-foreground">{vix.yesterday}</p>
              </CardContent>
            </Card>
          </div>

          {/* VIX Interpretation */}
          <Card className={cn(
            "border-border/50",
            vix.regime === 'risk-off' ? "bg-red-500/5" : 
            vix.regime === 'risk-on' ? "bg-primary/5" : "bg-yellow-500/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className={cn(
                  "w-6 h-6",
                  vix.regime === 'risk-off' ? "text-red-400" : 
                  vix.regime === 'risk-on' ? "text-primary" : "text-yellow-400"
                )} />
                <span className={cn(
                  "text-lg font-bold uppercase",
                  vix.regime === 'risk-off' ? "text-red-400" : 
                  vix.regime === 'risk-on' ? "text-primary" : "text-yellow-400"
                )}>
                  {vix.regime}
                </span>
              </div>
              <p className="text-sm">
                {vix.regime === 'risk-off' && '⚠️ VIX elevato indica RISK-OFF / Volatilità attesa alta. Movimenti più ampi, spike frequenti, maggiore probabilità di stop-out. Ridurre esposizione e size.'}
                {vix.regime === 'risk-on' && '✅ VIX basso indica RISK-ON / Volatilità attesa contenuta. Movimenti più ordinati, mean-reversion affidabile, range trading favorito.'}
                {vix.regime === 'neutral' && '➡️ VIX in zona neutrale. Condizioni miste, monitorare per cambiamenti di direzione.'}
              </p>
            </CardContent>
          </Card>

          {/* VIX 5-Day Range */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Range 5 Giorni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">High 5D</p>
                  <p className="text-2xl font-bold text-red-400">{vix.high_5d}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Low 5D</p>
                  <p className="text-2xl font-bold text-primary">{vix.low_5d}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Asset Risk */}
        <TabsContent value="assets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(assets).map(([symbol, data]) => (
              <AssetRiskCard 
                key={symbol} 
                symbol={symbol} 
                data={data} 
                tilt={asset_tilts[symbol]}
              />
            ))}
          </div>
        </TabsContent>

        {/* Tab: Macro Events */}
        <TabsContent value="events" className="space-y-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Eventi Macro del Giorno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {macro_events?.map((event, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      event.impact === 'high' ? "bg-red-500/10 border border-red-500/20" :
                      event.impact === 'medium' ? "bg-yellow-500/10 border border-yellow-500/20" :
                      "bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold w-14">{event.time}</span>
                      <div>
                        <p className="font-medium">{event.event}</p>
                        <p className="text-xs text-muted-foreground">
                          Cons: {event.consensus} | Prev: {event.previous}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      event.impact === 'high' ? "bg-red-500/20 text-red-400" :
                      event.impact === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-secondary text-muted-foreground"
                    )}>
                      {event.impact.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* No-Trade Window Warning */}
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm font-medium text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  No-Trade Window
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Evitare entry 15 min prima e dopo eventi HIGH impact
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Event Alert */}
          {next_event && (
            <Card className="bg-red-500/10 border-red-500/30 border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="font-medium text-red-400">Prossimo Evento High-Impact</p>
                    <p className="text-sm">{next_event.event} - tra {next_event.hours_away} ore</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
