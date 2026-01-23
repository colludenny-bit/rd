import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, Clock, 
  AlertTriangle, BarChart3, Users, Shield, Target,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Bias Badge Component
const BiasBadge = ({ bias, size = 'md' }) => {
  const config = {
    Bull: { icon: TrendingUp, color: 'text-primary bg-primary/20 border-primary/30' },
    Bear: { icon: TrendingDown, color: 'text-red-400 bg-red-500/20 border-red-500/30' },
    Neutral: { icon: Minus, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' }
  };
  const { icon: Icon, color } = config[bias] || config.Neutral;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-3 py-1 rounded-full border font-semibold",
      color,
      size === 'lg' ? "text-base" : "text-sm"
    )}>
      <Icon className={size === 'lg' ? "w-5 h-5" : "w-4 h-4"} />
      {bias}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, max = 100, label, color = 'primary', showValue = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClasses = {
    primary: 'bg-primary',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-emerald-500'
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          {showValue && <span className="font-medium">{value}</span>}
        </div>
      )}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-full", colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, data }) => {
  const isPositive = data.net > 0;
  const changePositive = data.net_change > 0;
  
  return (
    <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{data.name}</h4>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded",
          data.percentile_52w > 70 ? "bg-primary/20 text-primary" :
          data.percentile_52w < 30 ? "bg-red-500/20 text-red-400" :
          "bg-secondary text-muted-foreground"
        )}>
          {data.percentile_52w}° %ile
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Long</p>
          <p className="font-mono text-sm text-primary">{(data.long || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Short</p>
          <p className="font-mono text-sm text-red-400">{(data.short || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={cn("font-mono text-sm font-bold", isPositive ? "text-primary" : "text-red-400")}>
            {isPositive ? '+' : ''}{data.net.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Variazione:</span>
        <span className={cn("font-medium flex items-center gap-1", changePositive ? "text-primary" : "text-red-400")}>
          {changePositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {changePositive ? '+' : ''}{data.net_change.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// Asset COT Card Component
const AssetCOTCard = ({ symbol, data, isExpanded, onToggle }) => {
  const biasColors = {
    Bull: 'border-primary/30 bg-primary/5',
    Bear: 'border-red-500/30 bg-red-500/5',
    Neutral: 'border-yellow-500/30 bg-yellow-500/5'
  };
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all border",
        biasColors[data.bias],
        isExpanded && "ring-2 ring-primary/50"
      )}
      onClick={onToggle}
      data-testid={`cot-card-${symbol}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {symbol}
          </CardTitle>
          <BiasBadge bias={data.bias} />
        </div>
        <p className="text-xs text-muted-foreground">
          Report: {data.report_type} • As of: {data.as_of_date}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-xl font-bold">{data.confidence}%</p>
          </div>
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Crowding</p>
            <p className={cn(
              "text-xl font-bold",
              data.crowding > 70 ? "text-red-400" : data.crowding > 40 ? "text-yellow-400" : "text-primary"
            )}>
              {data.crowding}%
            </p>
          </div>
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Squeeze Risk</p>
            <p className={cn(
              "text-xl font-bold",
              data.squeeze_risk > 60 ? "text-red-400" : data.squeeze_risk > 35 ? "text-yellow-400" : "text-primary"
            )}>
              {data.squeeze_risk}%
            </p>
          </div>
        </div>
        
        {/* Driver Text */}
        <div className="p-3 bg-secondary/20 rounded-lg">
          <p className="text-sm">{data.driver_text}</p>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-3 border-t border-border"
          >
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Dettaglio Categorie
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(data.categories).map(([key, catData]) => (
                <CategoryCard key={key} category={key} data={catData} />
              ))}
            </div>
            
            {/* Open Interest */}
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Open Interest:</span>
              <span className="font-mono font-medium">
                {data.open_interest?.toLocaleString()}
                <span className={cn(
                  "ml-2 text-xs",
                  data.oi_change > 0 ? "text-primary" : "text-red-400"
                )}>
                  ({data.oi_change > 0 ? '+' : ''}{data.oi_change?.toLocaleString()})
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default function COTPage() {
  const [cotData, setCotData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState('all');

  const fetchCOTData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    
    try {
      const response = await axios.get(`${API}/cot/data`);
      setCotData(response.data);
    } catch (err) {
      console.error('Error fetching COT data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCOTData();
  }, [fetchCOTData]);

  const toggleCard = (symbol) => {
    setExpandedCard(expandedCard === symbol ? null : symbol);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="cot-page-loading">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { data, next_release, last_update } = cotData || {};

  return (
    <div className="space-y-6 fade-in" data-testid="cot-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            COT Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Commitment of Traders • Posizionamento Mani Forti
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Next Release Countdown */}
          <div className="px-4 py-2 bg-secondary/50 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Prossimo release:</span>
              <span className="font-bold text-primary ml-2">{next_release?.countdown}</span>
            </div>
          </div>
          
          <Button 
            onClick={() => fetchCOTData(true)}
            disabled={isRefreshing}
            className="rounded-xl bg-primary hover:bg-primary/90"
            data-testid="refresh-cot-btn"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Aggiorna
          </Button>
        </div>
      </motion.div>

      {/* Release Info */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Data Report (As Of)</p>
                <p className="font-medium">{data?.NAS100?.as_of_date || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Release</p>
                <p className="font-medium">{next_release?.date} {next_release?.time_cet}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fonte</p>
                <p className="font-medium text-primary">CFTC</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Ultimo aggiornamento: {last_update}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="indices" className="rounded-lg">
            <Target className="w-4 h-4 mr-2" />
            Indici
          </TabsTrigger>
          <TabsTrigger value="gold" className="rounded-lg">
            <Shield className="w-4 h-4 mr-2" />
            Gold
          </TabsTrigger>
          <TabsTrigger value="forex" className="rounded-lg">
            <Activity className="w-4 h-4 mr-2" />
            Forex
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data && Object.entries(data).map(([symbol, assetData]) => (
              <Card 
                key={symbol}
                className={cn(
                  "cursor-pointer transition-all hover:scale-[1.02]",
                  assetData.bias === 'Bull' ? "border-primary/30 bg-primary/5" :
                  assetData.bias === 'Bear' ? "border-red-500/30 bg-red-500/5" :
                  "border-yellow-500/30 bg-yellow-500/5"
                )}
                onClick={() => setExpandedCard(expandedCard === symbol ? null : symbol)}
              >
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg mb-2">{symbol}</h3>
                  <BiasBadge bias={assetData.bias} size="lg" />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Conf.</p>
                      <p className="font-bold">{assetData.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Squeeze</p>
                      <p className={cn(
                        "font-bold",
                        assetData.squeeze_risk > 60 ? "text-red-400" : "text-primary"
                      )}>
                        {assetData.squeeze_risk}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data && Object.entries(data).map(([symbol, assetData]) => (
              <AssetCOTCard 
                key={symbol}
                symbol={symbol}
                data={assetData}
                isExpanded={expandedCard === symbol}
                onToggle={() => toggleCard(symbol)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Indices Tab */}
        <TabsContent value="indices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data && ['NAS100', 'SP500'].map(symbol => (
              <AssetCOTCard 
                key={symbol}
                symbol={symbol}
                data={data[symbol]}
                isExpanded={expandedCard === symbol}
                onToggle={() => toggleCard(symbol)}
              />
            ))}
          </div>
          
          {/* TFF Explanation */}
          <Card className="bg-secondary/30 border-border/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Legenda TFF Report
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div>
                  <p><strong className="text-foreground">Asset Manager:</strong> Istituzionali lenti (pensioni, fondi). Bias primario.</p>
                </div>
                <div>
                  <p><strong className="text-foreground">Leveraged Funds:</strong> Hedge funds speculativi. Indicatore di crowding/squeeze.</p>
                </div>
                <div>
                  <p><strong className="text-foreground">Dealer:</strong> Market maker/intermediari. Controparte naturale.</p>
                </div>
                <div>
                  <p><strong className="text-foreground">Percentile 52w:</strong> Posizione relativa nell&apos;ultimo anno. Estremi = rischio reversal.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gold Tab */}
        <TabsContent value="gold" className="space-y-4">
          {data?.XAUUSD && (
            <AssetCOTCard 
              symbol="XAUUSD"
              data={data.XAUUSD}
              isExpanded={true}
              onToggle={() => {}}
            />
          )}
          
          {/* Disaggregated Explanation */}
          <Card className="bg-secondary/30 border-border/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Legenda Disaggregated Report (Gold)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div>
                  <p><strong className="text-foreground">Managed Money:</strong> CTA e fondi speculativi. Driver principale del trend.</p>
                </div>
                <div>
                  <p><strong className="text-foreground">Swap Dealers:</strong> Banche/dealer. Componente più strutturale.</p>
                </div>
                <div>
                  <p><strong className="text-foreground">Producer/Merchant:</strong> Produttori/consumatori fisici. Solitamente net short (hedging).</p>
                </div>
                <div>
                  <p><strong className="text-foreground">Spreading:</strong> Posizioni spread (long+short). Indica attività di arbitraggio.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forex Tab */}
        <TabsContent value="forex" className="space-y-4">
          {data?.EURUSD && (
            <AssetCOTCard 
              symbol="EURUSD"
              data={data.EURUSD}
              isExpanded={true}
              onToggle={() => {}}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Risk Warning */}
      <Card className="bg-yellow-500/5 border-yellow-500/30">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-400 mb-1">Nota sul COT</p>
            <p className="text-muted-foreground">
              I dati COT hanno un ritardo di 3-4 giorni (riferiti al martedì, pubblicati il venerdì). 
              Usare come bias settimanale, non per timing intraday. I percentili estremi (&gt;85 o &lt;15) 
              indicano potenziale overcrowding e rischio di squeeze/reversal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
