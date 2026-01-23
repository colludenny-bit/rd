import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Calendar, BarChart3, RefreshCw } from 'lucide-react';

const macroData = {
  fedRates: { value: '3.50-3.75%', subtext: '95% hold probability' },
  cpi: { value: '2.7% YoY', subtext: 'Core: 2.6%' },
  nfp: { value: '+50k', subtext: 'EU: 4.4%' },
  nextEvent: { date: 'Jan 27-28', name: 'FOMC Meeting' }
};

const analysisData = [
  {
    symbol: 'NASDAQ',
    shortTerm: {
      direction: 'bearish',
      timeframe: 'Short (1-5d)',
      probability: 65,
      current: 25689,
      target: 25200,
      stopLoss: 25900,
      winRate: 68,
      maxDD: 1,
      riskReward: 2.32,
      correlations: 'CPI >2.7% → indices -1%, NFP miss → equity -0.5%',
      triggers: 'Fed Jan 27-28 (95% hold), NFP Feb 3',
      analysis: 'Sticky CPI data suggests continued bear pressure. Range 40 breakout probability 68% with volume >1.5x. GEX 0DTE showing 62% S/R reactions.'
    },
    mediumTerm: {
      direction: 'bullish',
      timeframe: 'Medium (1-4w)',
      probability: 75,
      current: 25689,
      target: 26500,
      stopLoss: 25400,
      winRate: 72,
      maxDD: 1.5,
      riskReward: 2.81,
      correlations: 'Fed cuts → equity +2%, labor cooling → growth stocks +1.5%',
      triggers: 'Potential rate cuts 2026 (20% probability)',
      analysis: 'Medium-term bull bias based on Fed pivot expectations and cooling labor market. Historical analysis 2019-2025 shows 75% success rate.'
    }
  },
  {
    symbol: 'S&P 500',
    shortTerm: {
      direction: 'bearish',
      timeframe: 'Short (1-5d)',
      probability: 60,
      current: 6050,
      target: 5980,
      stopLoss: 6100,
      winRate: 65,
      maxDD: 0.8,
      riskReward: 1.95,
      correlations: 'VIX spike → SPX -0.8%, DXY strength → SPX -0.5%',
      triggers: 'Earnings season Q4, Tech guidance',
      analysis: 'Short-term consolidation expected. Support at 6000 psychological level.'
    },
    mediumTerm: {
      direction: 'bullish',
      timeframe: 'Medium (1-4w)',
      probability: 70,
      current: 6050,
      target: 6200,
      stopLoss: 5950,
      winRate: 70,
      maxDD: 1.2,
      riskReward: 2.5,
      correlations: 'Earnings beat → SPX +1.2%, Fed dovish → SPX +2%',
      triggers: 'Q4 earnings season positive outlook',
      analysis: 'Bullish medium-term outlook supported by strong earnings expectations and potential Fed pivot.'
    }
  },
  {
    symbol: 'GOLD',
    shortTerm: {
      direction: 'bullish',
      timeframe: 'Short (1-5d)',
      probability: 70,
      current: 2650,
      target: 2700,
      stopLoss: 2620,
      winRate: 72,
      maxDD: 1.1,
      riskReward: 2.67,
      correlations: 'DXY weakness → Gold +1%, Risk-off → Gold +0.8%',
      triggers: 'Geopolitical tensions, USD weakness',
      analysis: 'Gold showing strength on safe-haven flows. Technical breakout above 2650 confirmed.'
    },
    mediumTerm: {
      direction: 'bullish',
      timeframe: 'Medium (1-4w)',
      probability: 75,
      current: 2650,
      target: 2750,
      stopLoss: 2580,
      winRate: 74,
      maxDD: 2.6,
      riskReward: 2.43,
      correlations: 'Central bank buying → Gold +2%, Inflation fears → Gold +1.5%',
      triggers: 'Central bank gold accumulation continues',
      analysis: 'Strong institutional demand and inflation hedge positioning support bullish outlook.'
    }
  }
];

const AnalysisCard = ({ data, term }) => {
  const info = term === 'short' ? data.shortTerm : data.mediumTerm;
  const isBullish = info.direction === 'bullish';
  
  return (
    <Card className="bg-card/80 border-border/50">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isBullish ? (
              <TrendingUp className="w-5 h-5 text-primary" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className="font-bold text-lg">{data.symbol}</span>
          </div>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            isBullish ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"
          )}>
            {info.direction}
          </span>
        </div>

        {/* Timeframe & Probability */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Timeframe</p>
            <p className="font-semibold">{info.timeframe}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Probability</p>
            <p className={cn("font-bold text-lg", isBullish ? "text-primary" : "text-red-400")}>
              {info.probability}%
            </p>
          </div>
        </div>

        {/* Price Levels */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-secondary/30 rounded-lg mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-semibold">${info.current.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="font-semibold text-primary">${info.target.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stop Loss</p>
            <p className="font-semibold text-red-400">${info.stopLoss.toLocaleString()}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="font-bold">{info.winRate}%</p>
          </div>
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Max DD</p>
            <p className="font-bold">{info.maxDD}%</p>
          </div>
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Risk/Reward</p>
            <p className="font-bold">{info.riskReward}</p>
          </div>
        </div>

        {/* Correlations */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <BarChart3 className="w-3 h-3" /> Correlations
          </p>
          <p className="text-sm p-2 bg-secondary/30 rounded-lg">{info.correlations}</p>
        </div>

        {/* Event Triggers */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3" /> Event Triggers
          </p>
          <p className="text-sm p-2 bg-secondary/30 rounded-lg">{info.triggers}</p>
        </div>

        {/* Analysis */}
        <p className="text-sm text-muted-foreground">{info.analysis}</p>
      </CardContent>
    </Card>
  );
};

export default function ReportPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-6 fade-in" data-testid="report-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Report
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive macro analysis and market outlook</p>
        </div>
        
        <Button className="rounded-xl bg-primary hover:bg-primary/90">
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New Analysis
        </Button>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'short', 'medium'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              filter === f 
                ? "bg-primary text-primary-foreground" 
                : "bg-card border border-border hover:border-primary/50"
            )}
          >
            {f === 'all' ? 'All' : f === 'short' ? 'Short-term (1-5d)' : 'Medium-term (1-4w)'}
          </button>
        ))}
      </div>

      {/* Macro Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Fed Rates</p>
            <p className="text-2xl font-bold">{macroData.fedRates.value}</p>
            <p className="text-xs text-muted-foreground">{macroData.fedRates.subtext}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">CPI (Dec)</p>
            <p className="text-2xl font-bold">{macroData.cpi.value}</p>
            <p className="text-xs text-muted-foreground">{macroData.cpi.subtext}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">NFP</p>
            <p className="text-2xl font-bold">{macroData.nfp.value}</p>
            <p className="text-xs text-muted-foreground">{macroData.nfp.subtext}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Next Event
            </p>
            <p className="text-2xl font-bold">{macroData.nextEvent.date}</p>
            <p className="text-xs text-muted-foreground">{macroData.nextEvent.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analysisData.map((data) => (
          <React.Fragment key={data.symbol}>
            {(filter === 'all' || filter === 'short') && (
              <AnalysisCard data={data} term="short" />
            )}
            {(filter === 'all' || filter === 'medium') && (
              <AnalysisCard data={data} term="medium" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
