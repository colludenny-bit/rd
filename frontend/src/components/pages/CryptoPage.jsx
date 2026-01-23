import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';
import { 
  Bitcoin, TrendingUp, TrendingDown, BarChart3, DollarSign,
  Activity, Zap, Clock, AlertTriangle
} from 'lucide-react';

// Placeholder Crypto Data
const cryptoData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 105420, change: 2.5, marketCap: '2.1T', volume: '45B' },
  { symbol: 'ETH', name: 'Ethereum', price: 3890, change: 3.2, marketCap: '468B', volume: '22B' },
  { symbol: 'SOL', name: 'Solana', price: 218, change: -1.2, marketCap: '102B', volume: '8B' },
  { symbol: 'XRP', name: 'Ripple', price: 2.45, change: 5.8, marketCap: '140B', volume: '12B' },
  { symbol: 'ADA', name: 'Cardano', price: 1.12, change: -0.5, marketCap: '39B', volume: '2B' }
];

// Crypto Card Component
const CryptoCard = ({ crypto }) => {
  const isPositive = crypto.change > 0;
  
  return (
    <Card className={cn(
      "hover:scale-[1.02] transition-all cursor-pointer",
      isPositive ? "bg-primary/5 border-primary/30" : "bg-red-500/5 border-red-500/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-yellow-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{crypto.symbol.slice(0, 2)}</span>
            </div>
            <div>
              <p className="font-bold">{crypto.symbol}</p>
              <p className="text-xs text-muted-foreground">{crypto.name}</p>
            </div>
          </div>
          <span className={cn(
            "text-sm font-bold flex items-center gap-1",
            isPositive ? "text-primary" : "text-red-400"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{crypto.change}%
          </span>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold font-mono">
            ${crypto.price.toLocaleString()}
          </p>
        </div>
        
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>MCap: ${crypto.marketCap}</span>
          <span>Vol: ${crypto.volume}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CryptoPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  return (
    <div className="space-y-6 fade-in" data-testid="crypto-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bitcoin className="w-8 h-8 text-yellow-500" />
          Crypto Markets
        </h1>
        <p className="text-muted-foreground mt-1">
          Analisi mercato crypto • Coming Soon
        </p>
      </motion.div>

      {/* Market Overview */}
      <Card className="bg-gradient-to-r from-primary/10 via-yellow-500/10 to-primary/10 border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Market Overview</h2>
              <p className="text-muted-foreground">Total Market Cap: $3.8T • 24h Volume: $180B</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-xl">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Fear & Greed: 72 (Greed)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cryptoData.map((crypto) => (
          <CryptoCard key={crypto.symbol} crypto={crypto} />
        ))}
      </div>

      {/* Coming Soon Features */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Funzionalità in arrivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: BarChart3, title: 'On-Chain Analytics', desc: 'Whale tracking, flow analysis' },
              { icon: Activity, title: 'DeFi Dashboard', desc: 'TVL, yield farming, liquidity' },
              { icon: AlertTriangle, title: 'Alert System', desc: 'Price alerts, whale movements' }
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-secondary/30 rounded-xl">
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-medium mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-500/5 border-yellow-500/30">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-400 mb-1">Pagina in Sviluppo</p>
            <p className="text-muted-foreground">
              Questa sezione è in fase di sviluppo. Le funzionalità complete di analisi crypto, 
              on-chain data e DeFi saranno disponibili a breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
