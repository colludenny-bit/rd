import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  Bitcoin, TrendingUp, TrendingDown, Activity,
  Eye, EyeOff, Play,
  ChevronUp, ChevronDown, Target, Waves, Newspaper,
  Users, Scale, Gauge, ArrowUpRight, ArrowDownRight,
  Brain, RefreshCw
} from 'lucide-react';
import { TechCard, TechCardHeader, TechBadge } from '../ui/TechCard';
import { SparkLine, MiniDonut } from '../ui/SparkLine';
import { TechTable } from '../ui/TechTable';
import { MarketService } from '../../services/MarketService';
import { AIService } from '../../services/AIService';

// Bias Engine States
const BIAS_STATES = {
  BULLISH: { label: 'BULL', color: '#00D9A5', icon: ChevronUp },
  NEUTRAL: { label: 'NEUT', color: '#F59E0B', icon: Scale },
  BEARISH: { label: 'BEAR', color: '#EF4444', icon: ChevronDown }
};

// LOWLE Strategy States
const LOWLE_STATES = {
  OFF: { label: 'OFF', icon: EyeOff },
  WATCH: { label: 'WATCH', icon: Eye },
  LIVE: { label: 'LIVE', icon: Play }
};

// Crypto Data
const initialCryptos = [
  {
    symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0,
    marketCap: '0', volume: '0',
    sparkData: [40, 42, 45, 43, 48, 50, 52, 55, 58],
    bias: { dvol: 'NEUTRAL', whale: 'ACCUMULATING', crowd: 'NEUTRAL', news: 'NEUTRAL', overall: 'NEUTRAL' },
    lowle: 'WATCH',
    whaleActivity: []
  },
  {
    symbol: 'ETH', name: 'Ethereum', price: 0, change: 0,
    marketCap: '0', volume: '0',
    sparkData: [30, 32, 35, 33, 38, 40, 42, 45, 48],
    bias: { dvol: 'NEUTRAL', whale: 'ACCUMULATING', crowd: 'NEUTRAL', news: 'NEUTRAL', overall: 'NEUTRAL' },
    lowle: 'LIVE',
    whaleActivity: []
  },
  {
    symbol: 'SOL', name: 'Solana', price: 0, change: 0,
    marketCap: '0', volume: '0',
    sparkData: [50, 52, 55, 53, 58, 60, 62, 65, 68],
    bias: { dvol: 'NEUTRAL', whale: 'NEUTRAL', crowd: 'NEUTRAL', news: 'NEUTRAL', overall: 'NEUTRAL' },
    lowle: 'OFF',
    whaleActivity: []
  },
  {
    symbol: 'XRP', name: 'Ripple', price: 0, change: 0,
    marketCap: '0', volume: '0',
    sparkData: [20, 22, 25, 23, 28, 30, 32, 35, 38],
    bias: { dvol: 'NEUTRAL', whale: 'NEUTRAL', crowd: 'NEUTRAL', news: 'NEUTRAL', overall: 'NEUTRAL' },
    lowle: 'LIVE',
    whaleActivity: []
  },
  {
    symbol: 'ADA', name: 'Cardano', price: 0, change: 0,
    marketCap: '0', volume: '0',
    sparkData: [10, 12, 15, 13, 18, 20, 22, 25, 28],
    bias: { dvol: 'NEUTRAL', whale: 'NEUTRAL', crowd: 'NEUTRAL', news: 'NEUTRAL', overall: 'NEUTRAL' },
    lowle: 'OFF',
    whaleActivity: []
  }
];

// Crypto Card with SparkLine
const CryptoCard = ({ crypto, onSelect, isSelected, onLowleChange }) => {
  const isUp = crypto.change >= 0;
  const biasState = BIAS_STATES[crypto.bias.overall];
  const lowleState = LOWLE_STATES[crypto.lowle];
  const LowleIcon = lowleState.icon;

  const handleLowleClick = (e) => {
    e.stopPropagation();
    const states = ['OFF', 'WATCH', 'LIVE'];
    const nextState = states[(states.indexOf(crypto.lowle) + 1) % states.length];
    onLowleChange(crypto.symbol, nextState);
  };

  return (
    <TechCard
      onClick={() => onSelect(crypto.symbol)}
      active={isSelected}
      className="cursor-pointer"
      glow
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00D9A5]/10 border border-[#00D9A5]/20 flex items-center justify-center">
            <span className="text-xs font-bold text-[#00D9A5]">{crypto.symbol.slice(0, 2)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white/90">{crypto.symbol}</p>
            <p className="text-[10px] text-white/40">{crypto.name}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium"
          style={{
            background: `${biasState.color}15`,
            color: biasState.color,
            border: `1px solid ${biasState.color}30`
          }}
        >
          <biasState.icon className="w-3 h-3" />
          {biasState.label}
        </div>
      </div>

      {/* SparkLine + Price */}
      <div className="flex items-center justify-between mb-3">
        <SparkLine
          data={crypto.sparkData}
          width={80}
          height={32}
          type="area"
          color={isUp ? '#00D9A5' : '#EF4444'}
        />
        <div className="text-right">
          <p className="text-lg font-bold font-mono text-white/90">
            ${crypto.price > 100 ? crypto.price.toLocaleString() : crypto.price.toFixed(4)}
          </p>
          <span className={cn(
            "text-xs font-medium",
            isUp ? "text-[#00D9A5]" : "text-red-400"
          )}>
            {isUp ? '+' : ''}{crypto.change.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* LOWLE Badge */}
      <button
        onClick={handleLowleClick}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all",
          crypto.lowle === 'OFF' && "bg-white/5 text-white/40",
          crypto.lowle === 'WATCH' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
          crypto.lowle === 'LIVE' && "bg-[#00D9A5]/10 text-[#00D9A5] border border-[#00D9A5]/20"
        )}
      >
        <LowleIcon className="w-3 h-3" />
        LOWLE: {lowleState.label}
      </button>

      {/* Whale Indicator */}
      {crypto.whaleActivity.length > 0 && (
        <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-cyan-400">
          <Waves className="w-3 h-3 animate-pulse" />
          {crypto.whaleActivity.length} whale movement{crypto.whaleActivity.length > 1 ? 's' : ''}
        </div>
      )}
    </TechCard>
  );
};

// Bias Engine Panel
const BiasEnginePanel = ({ crypto }) => {
  if (!crypto) return null;

  const biasItems = [
    { key: 'dvol', label: 'DVOL Regime', icon: Activity },
    { key: 'whale', label: 'Whale State', icon: Waves },
    { key: 'crowd', label: 'Crowding', icon: Users },
    { key: 'news', label: 'News Sentiment', icon: Newspaper }
  ];

  return (
    <TechCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-[#00D9A5]" />
          <span className="font-semibold text-white/90">Bias Engine — {crypto.symbol}</span>
        </div>
        <TechBadge variant={crypto.bias.overall === 'BULLISH' ? 'success' : crypto.bias.overall === 'BEARISH' ? 'danger' : 'warning'}>
          {crypto.bias.overall}
        </TechBadge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {biasItems.map((item) => {
          const state = crypto.bias[item.key];
          const biasConfig = state === 'BULLISH' || state === 'ACCUMULATING'
            ? { color: '#00D9A5', label: state }
            : state === 'BEARISH' || state === 'DISTRIBUTING'
              ? { color: '#EF4444', label: state }
              : { color: '#F59E0B', label: state };

          return (
            <div key={item.key} className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-3 h-3 text-white/40" />
                <span className="text-[10px] text-white/40 uppercase">{item.label}</span>
              </div>
              <span className="text-sm font-medium" style={{ color: biasConfig.color }}>
                {biasConfig.label}
              </span>
            </div>
          );
        })}
      </div>
    </TechCard>
  );
};

export default function CryptoPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [cryptos, setCryptos] = useState(initialCryptos);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time Data Loop (every 60s)
  useEffect(() => {
    const fetchMarket = async () => {
      setIsUpdating(true);
      const prices = await MarketService.getPrices();

      if (prices) {
        setCryptos(prev => prev.map(c => {
          const id = c.name.toLowerCase();
          const p = prices[id];
          if (!p) return c;

          const newPrice = p.usd;
          const newChange = p.usd_24h_change;

          // Determine Bias based on change
          let biasOverall = 'NEUTRAL';
          if (newChange > 2) biasOverall = 'BULLISH';
          if (newChange < -2) biasOverall = 'BEARISH';

          return {
            ...c,
            price: newPrice,
            change: newChange,
            marketCap: p.usd_market_cap ? (p.usd_market_cap / 1e9).toFixed(1) + 'B' : c.marketCap,
            volume: p.usd_24h_vol ? (p.usd_24h_vol / 1e9).toFixed(1) + 'B' : c.volume,
            bias: {
              ...c.bias,
              overall: biasOverall,
              dvol: Math.abs(newChange) > 5 ? 'Extreme' : 'Normal'
            }
          };
        }));
      }

      setLoading(false);
      setIsUpdating(false);
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 60000); // 60s loop
    return () => clearInterval(interval);
  }, []);

  // AI Analysis Loop (every 5 mins or on load)
  useEffect(() => {
    const runAI = async () => {
      const keys = JSON.parse(localStorage.getItem('karion_api_keys') || '{}');
      const analysis = await AIService.analyzeMarket({ // Pass data simplified
        bitcoin: { usd: cryptos[0].price, usd_24h_change: cryptos[0].change },
        ethereum: { usd: cryptos[1].price, usd_24h_change: cryptos[1].change },
        solana: { usd: cryptos[2].price, usd_24h_change: cryptos[2].change }
      }, keys.openai);
      setAiAnalysis(analysis);
    };

    if (!loading) runAI();
  }, [loading]); // Run once after initial load

  const handleLowleChange = (symbol, newState) => {
    setCryptos(prev => prev.map(c =>
      c.symbol === symbol ? { ...c, lowle: newState } : c
    ));
  };

  const selectedData = cryptos.find(c => c.symbol === selectedCrypto);
  const liveCount = cryptos.filter(c => c.lowle === 'LIVE').length;
  const watchCount = cryptos.filter(c => c.lowle === 'WATCH').length;

  return (
    <div className="space-y-6 fade-in" data-testid="crypto-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white/95 flex items-center gap-3">
            <Bitcoin className="w-7 h-7 text-[#00D9A5]" />
            Crypto Markets
            {isUpdating && <RefreshCw className="w-4 h-4 animate-spin text-white/40" />}
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Real-time Feed • CoinGecko API • AI Powered
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#00D9A5]/10 border border-[#00D9A5]/20 rounded-lg flex items-center gap-2">
            <Play className="w-3 h-3 text-[#00D9A5]" />
            <span className="text-xs font-medium text-[#00D9A5]">{liveCount} LIVE</span>
          </div>
          <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
            <Eye className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400">{watchCount} WATCH</span>
          </div>
        </div>
      </motion.div>

      {/* AI Overview Header */}
      {aiAnalysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TechCard className="p-4 bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">Karion AI Insight</h3>
                <p className="text-sm text-white/80 leading-relaxed">"{aiAnalysis.text}"</p>
                <p className="text-[10px] text-white/30 mt-2">Source: {aiAnalysis.source} • {new Date(aiAnalysis.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </TechCard>
        </motion.div>
      )}

      {/* Crypto Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cryptos.map((crypto) => (
          <motion.div
            key={crypto.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CryptoCard
              crypto={crypto}
              onSelect={setSelectedCrypto}
              isSelected={selectedCrypto === crypto.symbol}
              onLowleChange={handleLowleChange}
            />
          </motion.div>
        ))}
      </div>

      {/* Bias Engine Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCrypto}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <BiasEnginePanel crypto={selectedData} />
        </motion.div>
      </AnimatePresence>

      {/* LOWLE Protocol */}
      <TechCard className="p-5">
        <TechCardHeader
          icon={Target}
          title="LOWLE Strategy Protocol"
          subtitle="Strategy management"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-4 h-4 text-white/40" />
              <span className="font-medium text-white/50">OFF</span>
            </div>
            <p className="text-xs text-white/40">Strategy disabled.</p>
          </div>
          <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-yellow-400">WATCH</span>
            </div>
            <p className="text-xs text-white/40">Active monitoring.</p>
          </div>
          <div className="p-4 bg-[#00D9A5]/5 rounded-xl border border-[#00D9A5]/20">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-[#00D9A5]" />
              <span className="font-medium text-[#00D9A5]">LIVE</span>
            </div>
            <p className="text-xs text-white/40">Active trading.</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
