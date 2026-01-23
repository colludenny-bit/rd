import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';
import { 
  AlertTriangle, Activity, Shield, TrendingUp, TrendingDown,
  Clock, RefreshCw, ArrowUp, ArrowDown, Minus, Target,
  Calendar, BarChart3, Gauge, Brain
} from 'lucide-react';

// Simulated VIX and market data
const generateRiskData = () => {
  const now = new Date();
  const vixBase = 16 + Math.random() * 10; // 16-26 range
  const vixYesterday = vixBase + (Math.random() - 0.5) * 3;
  const vixChange = ((vixBase - vixYesterday) / vixYesterday) * 100;
  
  // Next high-impact event (simulated hours from now)
  const hoursToEvent = Math.floor(Math.random() * 14);
  
  const assets = {
    NQ: {
      name: 'NASDAQ 100',
      current: 21450 + (Math.random() - 0.5) * 400,
      weeklyHigh: 21680,
      weeklyLow: 21120,
      twoWeekHigh: 21750,
      twoWeekLow: 20980
    },
    SP500: {
      name: 'S&P 500',
      current: 6050 + (Math.random() - 0.5) * 80,
      weeklyHigh: 6095,
      weeklyLow: 5980,
      twoWeekHigh: 6120,
      twoWeekLow: 5920
    },
    XAUUSD: {
      name: 'Gold',
      current: 2650 + (Math.random() - 0.5) * 50,
      weeklyHigh: 2680,
      weeklyLow: 2620,
      twoWeekHigh: 2700,
      twoWeekLow: 2590
    },
    EURUSD: {
      name: 'EUR/USD',
      current: 1.0850 + (Math.random() - 0.5) * 0.01,
      weeklyHigh: 1.0920,
      weeklyLow: 1.0780,
      twoWeekHigh: 1.0950,
      twoWeekLow: 1.0720
    }
  };

  // Calculate distance to nearest 2-week extreme for each asset
  Object.keys(assets).forEach(key => {
    const a = assets[key];
    const distToHigh = ((a.twoWeekHigh - a.current) / a.twoWeekHigh) * 100;
    const distToLow = ((a.current - a.twoWeekLow) / a.twoWeekLow) * 100;
    a.nearestExtreme = distToHigh < distToLow ? 'high' : 'low';
    a.distanceToExtreme = Math.min(Math.abs(distToHigh), Math.abs(distToLow));
  });

  return {
    vix: {
      current: vixBase,
      yesterday: vixYesterday,
      change: vixChange,
      direction: vixChange > 0.5 ? 'rising' : vixChange < -0.5 ? 'falling' : 'stable'
    },
    hoursToEvent,
    nextEvent: hoursToEvent <= 12 ? {
      name: hoursToEvent <= 2 ? 'FOMC Rate Decision' : hoursToEvent <= 6 ? 'US CPI Data' : 'NFP Report',
      impact: 'high',
      hoursAway: hoursToEvent
    } : null,
    assets,
    lastUpdate: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    timestamp: now.toISOString()
  };
};

// Calculate Risk Score components
const calculateRiskScore = (data) => {
  const { vix, hoursToEvent, assets } = data;
  
  // Component 1: VIX Level (0-25)
  let comp1 = 5;
  if (vix.current >= 22) comp1 = 25;
  else if (vix.current >= 18) comp1 = 18;
  else if (vix.current >= 14) comp1 = 12;
  else comp1 = 5;
  
  // Component 2: VIX Momentum (0-25)
  let comp2 = 10;
  if (vix.change > 6) comp2 = 25;
  else if (vix.change > 2) comp2 = 18;
  else if (vix.change >= -2) comp2 = 10;
  else comp2 = 4;
  
  // Component 3: Event Risk (0-25)
  let comp3 = 5;
  if (hoursToEvent <= 2) comp3 = 25;
  else if (hoursToEvent <= 6) comp3 = 18;
  else if (hoursToEvent <= 12) comp3 = 10;
  else comp3 = 5;
  
  // Component 4: Stretch to extremes (0-25)
  const minDistance = Math.min(...Object.values(assets).map(a => a.distanceToExtreme));
  let comp4 = 5;
  if (minDistance <= 0.25) comp4 = 25;
  else if (minDistance <= 0.50) comp4 = 18;
  else if (minDistance <= 1.00) comp4 = 10;
  else comp4 = 5;
  
  const total = comp1 + comp2 + comp3 + comp4;
  
  // Determine category
  let category = 'SAFE';
  if (total >= 67) category = 'HIGH';
  else if (total >= 34) category = 'MEDIUM';
  
  // Main reasons
  const reasons = [];
  const components = [
    { name: 'VIX Level', value: comp1, desc: `VIX a ${vix.current.toFixed(1)}` },
    { name: 'VIX Momentum', value: comp2, desc: `VIX ${vix.change > 0 ? '+' : ''}${vix.change.toFixed(1)}%` },
    { name: 'Event Risk', value: comp3, desc: hoursToEvent <= 12 ? `Evento high-impact tra ${hoursToEvent}h` : 'No eventi imminenti' },
    { name: 'Stretch Estremi', value: comp4, desc: `Asset a ${minDistance.toFixed(2)}% da estremo 2W` }
  ].sort((a, b) => b.value - a.value);
  
  reasons.push(components[0]);
  if (components[1].value >= 15) reasons.push(components[1]);
  
  return {
    total,
    category,
    components: { comp1, comp2, comp3, comp4 },
    reasons,
    minDistance
  };
};

// Calculate Expected Move
const calculateExpectedMove = (vix, sp500Price) => {
  const dailyVol = vix / Math.sqrt(252);
  const expectedMovePercent = dailyVol;
  const expectedMovePoints = sp500Price * (dailyVol / 100);
  return {
    percent: expectedMovePercent,
    points: expectedMovePoints
  };
};

// Get asset risk tilt
const getAssetRiskTilt = (asset, assetKey, vix) => {
  const distPct = asset.distanceToExtreme;
  const nearHigh = asset.nearestExtreme === 'high';
  const vixRising = vix.direction === 'rising';
  
  if (assetKey === 'NQ' || assetKey === 'SP500') {
    if (vixRising) {
      return {
        tilt: 'breakout',
        text: `VIX in salita aumenta rischio flush/breakout. Ridurre aggressività contrarian. ${nearHigh ? 'Attenzione a short prematuri su high.' : 'Attenzione a long prematuri su low.'}`,
        color: 'text-red-400'
      };
    } else {
      return {
        tilt: 'mean-reversion',
        text: `VIX in calo favorisce rotazione verso centro intraday. Mean-reversion più plausibile da ${asset.nearestExtreme}.`,
        color: 'text-primary'
      };
    }
  }
  
  if (assetKey === 'XAUUSD') {
    return {
      tilt: vixRising ? 'safe-haven' : 'range',
      text: vixRising 
        ? 'Risk-off può sostenere Gold come bene rifugio, ma spike rapidi su news possono causare stop-out anche in direzione "giusta".'
        : 'Contesto risk-on limita upside Gold. Range-bound più probabile, mean-reversion da estremi valida.',
      color: vixRising ? 'text-yellow-400' : 'text-primary'
    };
  }
  
  if (assetKey === 'EURUSD') {
    return {
      tilt: vixRising ? 'bearish-bias' : 'bounce-possible',
      text: vixRising
        ? 'VIX in salita = stress. Long EURUSD più rischiosi, richiedono conferme più forti. USD potrebbe rafforzarsi.'
        : 'VIX in calo = risk-on. Rimbalzi EURUSD più plausibili ma sensibili a eventi USA/Eurozona.',
      color: vixRising ? 'text-red-400' : 'text-primary'
    };
  }
  
  return { tilt: 'neutral', text: 'Condizioni neutrali', color: 'text-muted-foreground' };
};

export default function RiskPage() {
  const [riskData, setRiskData] = useState(generateRiskData());
  const [riskScore, setRiskScore] = useState(null);
  const [expectedMove, setExpectedMove] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);

  useEffect(() => {
    const score = calculateRiskScore(riskData);
    setRiskScore(score);
    setExpectedMove(calculateExpectedMove(riskData.vix.current, riskData.assets.SP500.current));
  }, [riskData]);

  const refreshData = () => {
    setIsLoading(true);
    setPreviousScore(riskScore?.total);
    setTimeout(() => {
      setRiskData(generateRiskData());
      setIsLoading(false);
    }, 1000);
  };

  const { vix, assets, nextEvent } = riskData;

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
            Valutazione rischio AI-powered • Update: {riskData.lastUpdate}
          </p>
        </div>
        
        <Button 
          onClick={refreshData}
          disabled={isLoading}
          className="rounded-xl bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Update 2H
        </Button>
      </motion.div>

      {/* Risk Score Change Alert */}
      {previousScore && riskScore && previousScore !== riskScore.total && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-xl flex items-center gap-3",
            riskScore.total > previousScore 
              ? "bg-red-500/10 border border-red-500/30" 
              : "bg-primary/10 border border-primary/30"
          )}
        >
          {riskScore.total > previousScore ? (
            <ArrowUp className="w-5 h-5 text-red-400" />
          ) : (
            <ArrowDown className="w-5 h-5 text-primary" />
          )}
          <span className="text-sm">
            Risk Score {riskScore.total > previousScore ? 'aumentato' : 'diminuito'}: {previousScore} → {riskScore.total}
            {riskScore.total > previousScore 
              ? ' • Considera riduzione rischio posizioni aperte'
              : ' • Condizioni più favorevoli per operatività'}
          </span>
        </motion.div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="risk-level" className="space-y-4">
        <TabsList className="bg-secondary/50 p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger value="vix" className="rounded-lg">
            <Activity className="w-4 h-4 mr-2" />
            VIX Index
          </TabsTrigger>
          <TabsTrigger value="risk-level" className="rounded-lg">
            <Gauge className="w-4 h-4 mr-2" />
            Risk Level
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="rounded-lg">
            <Brain className="w-4 h-4 mr-2" />
            Market Sentiment
          </TabsTrigger>
          <TabsTrigger value="assets" className="rounded-lg">
            <BarChart3 className="w-4 h-4 mr-2" />
            Asset Risk
          </TabsTrigger>
        </TabsList>

        {/* Tab: VIX Index */}
        <TabsContent value="vix" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* VIX Current */}
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6 text-center">
                <Activity className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-xs text-muted-foreground mb-1">VIX Attuale</p>
                <p className="text-5xl font-bold">{vix.current.toFixed(2)}</p>
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
                  {vix.change > 0 ? '+' : ''}{vix.change.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            {/* VIX Yesterday */}
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mb-1">Close Precedente</p>
                <p className="text-4xl font-bold text-muted-foreground">{vix.yesterday.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* VIX Interpretation */}
          <Card className={cn(
            "border-border/50",
            vix.change > 0 ? "bg-red-500/5" : "bg-primary/5"
          )}>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Interpretazione
              </h4>
              <p className="text-sm">
                {vix.change > 0.5 
                  ? '⚠️ VIX in aumento = RISK-OFF / Volatilità attesa più alta. Movimenti di mercato più ampi, spike più frequenti, maggiore probabilità di stop-out. Ridurre esposizione e size.'
                  : vix.change < -0.5
                  ? '✅ VIX in calo = RISK-ON / Volatilità attesa più bassa. Movimenti più ordinati, mean-reversion più affidabile, range trading favorito.'
                  : '➡️ VIX stabile. Condizioni di volatilità invariate. Monitorare per cambiamenti di direzione.'}
              </p>
            </CardContent>
          </Card>

          {/* Expected Move */}
          {expectedMove && (
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Expected Move Giornaliero (1σ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Percentuale</p>
                    <p className="text-2xl font-bold">±{expectedMove.percent.toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">S&P 500 (punti)</p>
                    <p className="text-2xl font-bold">±{expectedMove.points.toFixed(1)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Movimento atteso basato su VIX/{'\u221A'}252. Se range oggi supera questo valore, volatilità è elevata.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Risk Level */}
        <TabsContent value="risk-level" className="space-y-4">
          {riskScore && (
            <>
              {/* Main Risk Score */}
              <Card className={cn(
                "border-2",
                riskScore.category === 'HIGH' ? "bg-red-500/10 border-red-500/50" :
                riskScore.category === 'MEDIUM' ? "bg-yellow-500/10 border-yellow-500/50" :
                "bg-primary/10 border-primary/50"
              )}>
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <Shield className={cn(
                      "w-16 h-16 mx-auto",
                      riskScore.category === 'HIGH' ? "text-red-400" :
                      riskScore.category === 'MEDIUM' ? "text-yellow-400" :
                      "text-primary"
                    )} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Risk Score Generale</p>
                  <p className={cn(
                    "text-6xl font-bold mb-2",
                    riskScore.category === 'HIGH' ? "text-red-400" :
                    riskScore.category === 'MEDIUM' ? "text-yellow-400" :
                    "text-primary"
                  )}>
                    {riskScore.total}
                  </p>
                  <p className={cn(
                    "text-2xl font-bold",
                    riskScore.category === 'HIGH' ? "text-red-400" :
                    riskScore.category === 'MEDIUM' ? "text-yellow-400" :
                    "text-primary"
                  )}>
                    {riskScore.category}
                  </p>
                </CardContent>
              </Card>

              {/* Components Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">VIX Level</p>
                    <p className="text-2xl font-bold">{riskScore.components.comp1}/25</p>
                    <p className="text-xs text-muted-foreground mt-1">VIX: {vix.current.toFixed(1)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">VIX Momentum</p>
                    <p className="text-2xl font-bold">{riskScore.components.comp2}/25</p>
                    <p className="text-xs text-muted-foreground mt-1">{vix.change > 0 ? '+' : ''}{vix.change.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Event Risk</p>
                    <p className="text-2xl font-bold">{riskScore.components.comp3}/25</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {nextEvent ? `${nextEvent.hoursAway}h` : '>12h'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Stretch Estremi</p>
                    <p className="text-2xl font-bold">{riskScore.components.comp4}/25</p>
                    <p className="text-xs text-muted-foreground mt-1">{riskScore.minDistance.toFixed(2)}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Reasons */}
              <Card className="bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Motivi Principali</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {riskScore.reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-medium">{reason.name}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="text-sm">{reason.desc}</span>
                        <span className="ml-auto font-bold">{reason.value} pts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab: Market Sentiment */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card className={cn(
            "border-border/50",
            riskScore?.category === 'HIGH' ? "bg-red-500/5" :
            riskScore?.category === 'MEDIUM' ? "bg-yellow-500/5" :
            "bg-primary/5"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Analisi Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p>
                  <strong>Direzione VIX:</strong> {vix.direction === 'rising' 
                    ? 'In salita ↑ — Aumento della volatilità implicita, mercato in modalità risk-off.' 
                    : vix.direction === 'falling'
                    ? 'In calo ↓ — Diminuzione della volatilità implicita, mercato in modalità risk-on.'
                    : 'Stabile → — Volatilità invariata, attendere segnali di direzione.'}
                </p>
                <p>
                  <strong>Event Risk:</strong> {nextEvent 
                    ? `${nextEvent.name} tra ${nextEvent.hoursAway} ore (impatto: ${nextEvent.impact}). Attenzione a spike e liquidità ridotta prima/dopo il dato.`
                    : 'Nessun evento high-impact nelle prossime 12 ore. Condizioni più stabili per operatività.'}
                </p>
                <p>
                  <strong>Lettura:</strong> {vix.change > 2 
                    ? 'RISK-OFF — Stress di mercato in aumento. Preferire cautela e posizioni ridotte.'
                    : vix.change < -2
                    ? 'RISK-ON — Sentiment costruttivo. Mean-reversion e range trading favoriti.'
                    : 'NEUTRALE — Condizioni miste. Operare con disciplina standard.'}
                </p>
              </div>

              {/* Operational Recommendations */}
              <div className={cn(
                "p-4 rounded-lg",
                riskScore?.category === 'HIGH' ? "bg-red-500/10 border border-red-500/30" :
                riskScore?.category === 'SAFE' ? "bg-primary/10 border border-primary/30" :
                "bg-yellow-500/10 border border-yellow-500/30"
              )}>
                <h4 className="font-medium mb-2">
                  {riskScore?.category === 'HIGH' ? '⚠️ Raccomandazione Operativa (HIGH RISK)' :
                   riskScore?.category === 'SAFE' ? '✅ Raccomandazione Operativa (SAFE)' :
                   '⚡ Raccomandazione Operativa (MEDIUM)'}
                </h4>
                <p className="text-sm">
                  {riskScore?.category === 'HIGH' 
                    ? 'Preferire SOLO setup ad alta probabilità (≥65%). Ridurre numero di trade a max 1 per asset. Portare stop a break-even più velocemente (+0.4R invece di +0.6R). Evitare runner, prendere TP1 e uscire.'
                    : riskScore?.category === 'SAFE'
                    ? 'Movimenti più ordinati e prevedibili. Mean-reversion verso centro intraday più affidabile. Si può lavorare con size standard e TP1/TP2 normali. Runner consentiti se contesto resta favorevole.'
                    : 'Condizioni miste. Operare con size ridotta (-25%). Preferire setup con R:R ≥1.5. Monitorare VIX per cambiamenti rapidi.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Event Alert */}
          {nextEvent && nextEvent.hoursAway <= 6 && (
            <Card className="bg-red-500/10 border border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="font-medium text-red-400">⏰ Evento Imminente</p>
                    <p className="text-sm">{nextEvent.name} tra {nextEvent.hoursAway} ore</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No-trade window consigliata: 15 min prima e dopo il dato
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Asset Risk */}
        <TabsContent value="assets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(assets).map(([key, asset]) => {
              const riskTilt = getAssetRiskTilt(asset, key, vix);
              
              return (
                <Card key={key} className="bg-card/80 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {key === 'NQ' || key === 'SP500' ? (
                          <BarChart3 className="w-5 h-5 text-primary" />
                        ) : key === 'XAUUSD' ? (
                          <span className="text-yellow-400">🥇</span>
                        ) : (
                          <span>💱</span>
                        )}
                        {key}
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {asset.current.toFixed(key === 'EURUSD' ? 5 : 2)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Levels */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-secondary/30 rounded">
                        <p className="text-xs text-muted-foreground">Weekly H/L</p>
                        <p>{asset.weeklyHigh} / {asset.weeklyLow}</p>
                      </div>
                      <div className="p-2 bg-secondary/30 rounded">
                        <p className="text-xs text-muted-foreground">2-Week H/L</p>
                        <p>{asset.twoWeekHigh} / {asset.twoWeekLow}</p>
                      </div>
                    </div>

                    {/* Distance to Extreme */}
                    <div className={cn(
                      "p-3 rounded-lg",
                      asset.distanceToExtreme <= 0.5 ? "bg-red-500/10" : "bg-secondary/30"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Distanza da estremo 2W ({asset.nearestExtreme})</span>
                        <span className={cn(
                          "font-bold",
                          asset.distanceToExtreme <= 0.5 ? "text-red-400" : "text-primary"
                        )}>
                          {asset.distanceToExtreme.toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            asset.distanceToExtreme <= 0.25 ? "bg-red-500" :
                            asset.distanceToExtreme <= 0.5 ? "bg-yellow-500" :
                            "bg-primary"
                          )}
                          style={{ width: `${Math.min(100, (2 - asset.distanceToExtreme) * 50)}%` }}
                        />
                      </div>
                    </div>

                    {/* Risk Tilt */}
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Risk Tilt</p>
                      <p className={cn("text-sm font-medium mb-1", riskTilt.color)}>
                        {riskTilt.tilt.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{riskTilt.text}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Trade Risk Update */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Trade Risk Update
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {riskScore?.category === 'HIGH' ? (
            <p className="text-red-400">
              ⚠️ Risk Score elevato. Per posizioni aperte: considera break-even anticipato, riduzione size, o uscita se probabilità trade scende sotto 50%.
            </p>
          ) : riskScore?.category === 'MEDIUM' ? (
            <p className="text-yellow-400">
              ⚡ Risk Score medio. Mantieni TP1 standard. Valuta runner solo se VIX non peggiora e trade supera +0.6R.
            </p>
          ) : (
            <p className="text-primary">
              ✅ Risk Score basso. Condizioni favorevoli. Mantieni piano originale con TP1/TP2. Runner consentiti se contesto resta positivo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
