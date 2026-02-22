import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, RefreshCw, Activity, Search,
  ArrowUpRight, ArrowDownRight, ArrowRight, Layers, Zap,
  Crosshair, LineChart, Table as TableIcon, Filter,
  LayoutGrid, BarChart3, ChevronDown, Check, Target,
  Shield, Timer, ShieldCheck, Users, Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TechCard } from '../ui/TechCard';
import { GlowingChart } from '../ui/SparkLine';
import { MacroService } from '../../services/MacroService';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { WeeklyBiasScale } from '../ui/WeeklyBiasScale';

const TechnicalMetric = ({ label, value, subValue, suffix = '', variant = 'default' }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center font-apple">
    <span className="text-[10px] font-medium text-white uppercase tracking-[0.2em] mb-2 font-apple opacity-80">{label}</span>
    <span className={cn(
      "text-3xl font-medium mb-1 tracking-tighter font-apple",
      variant === 'bull' ? "text-[#00D9A5] drop-shadow-[0_0_10px_#00D9A5/30]" :
        variant === 'bear' ? "text-red-400 drop-shadow-[0_0_10px_#EF4444/30]" : "text-white"
    )}>
      {value}<span className="text-lg align-top ml-0.5 opacity-60">{suffix}</span>
    </span>
    {subValue && <span className="text-[9px] font-medium text-white uppercase tracking-widest mt-1 font-apple opacity-60">{subValue}</span>}
  </div>
);

const InstitutionalBreakdown = ({ type, data }) => {
  const safeLong = data?.long || 0;
  const safeShort = data?.short || 0;
  const total = safeLong + safeShort;
  const longPct = (safeLong / (total || 1)) * 100;
  const shortPct = (safeShort / (total || 1)) * 100;

  return (
    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 mb-4 group hover:bg-white/5 transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <span className="text-base font-medium text-white uppercase tracking-widest font-apple">{type}</span>
          <span className="text-base text-white font-medium uppercase tracking-widest font-apple">{data.oiPct}% of Total OI</span>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-base font-black tracking-tighter block leading-none mb-1 font-apple",
            data.net >= 0 ? "text-[#00D9A5]" : "text-red-400"
          )}>
            {data.net >= 0 ? '+' : ''}{(data.net / 1000).toFixed(1)}k
          </span>
          <div className={cn(
            "text-base font-medium uppercase tracking-widest font-apple",
            (data?.change || 0) >= 0 ? "text-[#00D9A5]" : "text-red-400"
          )}>
            {(data?.change || 0) > 0 ? '+' : ''}{(data?.change || 0).toLocaleString()} wk
          </div>
        </div>
      </div>

      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-[2px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${longPct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-[#00D9A5] shadow-[0_0_15px_rgba(0,217,165,0.3)]"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${shortPct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        />
      </div>

      <div className="flex justify-between mt-3 px-1">
        <div className="flex flex-col">
          <span className="text-base font-medium text-white tracking-widest leading-none font-apple">{longPct.toFixed(1)}%</span>
          <span className="text-base font-medium text-[#00D9A5] uppercase tracking-widest mt-1 font-apple">Institutional Long</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-base font-medium text-white tracking-widest leading-none font-apple">{shortPct.toFixed(1)}%</span>
          <span className="text-base font-medium text-red-500 uppercase tracking-widest mt-1 font-apple">Institutional Short</span>
        </div>
      </div>
    </div>
  );
};



const OverviewCard = ({ symbol, data, onClick }) => {
  const isBullish = data.sentiment === 'BULLISH';
  const isBearish = data.sentiment === 'BEARISH';

  return (
    <button
      onClick={onClick}
      className="bg-[#0A0E14] border border-white/10 p-6 rounded-[32px] text-left hover:bg-white/5 transition-all group relative flex flex-col"
    >
      {/* Absolute Eye Icon */}
      <div className="absolute top-6 right-6 p-1.5 rounded-xl bg-white/5 border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity z-10">
        <Eye className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Asset Name & Large Net Position */}
      <div className="mb-4">
        <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight leading-none">{data.symbol === 'XAU' ? 'XAUUSD' : (data.symbol === 'SPX' ? 'SPX500' : data.symbol)}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tighter leading-none">
            {data.netPosition > 0 ? '+' : ''}{(data.netPosition / 1000).toFixed(1)}k
          </span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Net Position</span>
        </div>
      </div>

      {/* Rolling Bias Scale - IMAGE MATCH */}
      <div className="mb-4 px-1">
        <WeeklyBiasScale data={data.rollingBias} mini={true} showWrapper={false} />
      </div>

      <div className="space-y-4">
        {/* Metrics Bar with Dividers (Image Style) */}
        <div className="grid grid-cols-3 p-4 bg-white/[0.03] rounded-[24px] border border-white/5">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Confidence</span>
            <span className="text-xl font-black text-[#00D9A5]">{data.technical.percentile52W}%</span>
          </div>
          <div className="flex flex-col items-center justify-center border-x border-white/10">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Crowding</span>
            <span className={cn(
              "text-xl font-black",
              (data.technical?.concentration4 || 0) > 75 ? "text-yellow-400" : "text-white"
            )}>{data.technical?.concentration4 || 0}%</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Squeeze</span>
            <span className={cn(
              "text-xl font-black",
              (data.technical?.zScore || 0) > 1 ? "text-red-400" : "text-[#00D9A5]"
            )}>{Math.abs(data.technical?.zScore * 25).toFixed(0)}%</span>
          </div>
        </div>

        {/* Interpretation Box (Image Style) */}
        <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/10">
          <ul className="space-y-2">
            {(data.interpretation || [
              'Posizionamento istituzionale in accumulo.',
              'In attesa della prossima release del report COT.',
              'Struttura tecnica supportiva per il trend.'
            ]).slice(0, 3).map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00D9A5] shadow-[0_0_10px_#00D9A5] flex-shrink-0" />
                <span className="text-base text-white/90 leading-relaxed font-medium">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
};

export default function COTPage() {
  const [cotData, setCotData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAsset, setActiveAsset] = useState('SPX');
  const [viewMode, setViewMode] = useState('overview');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await MacroService.getCOTData();
      setCotData(data);
    } catch (err) {
      console.error('Error fetching COT data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectAsset = (symbol) => {
    setActiveAsset(symbol);
    setViewMode('technical');
  };

  if (isLoading || !cotData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00D9A5]" />
      </div>
    );
  }

  const asset = cotData[activeAsset];
  const historyData = asset.history.map(h => h.value);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] fade-in mt-4">
      {/* Premium Header Navigation */}
      <div className="flex items-center justify-between mb-8 px-2 shrink-0">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none flex items-center gap-3">
              <Users className="w-8 h-8 text-[#00D9A5]" />
              COT Institutional
            </h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-2 pl-11">Smart Money Positioning</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 w-[400px]">
            <button
              onClick={() => setViewMode('overview')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-lg",
                viewMode === 'overview'
                  ? "bg-[#00D9A5] text-[#0A0E14] shadow-lg"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              )}
            >
              <Users className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-lg",
                viewMode === 'technical'
                  ? "bg-[#00D9A5] text-[#0A0E14] shadow-lg"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Technical Detail
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {viewMode === 'technical' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                  <span className="text-xs font-black text-white uppercase tracking-widest">{activeAsset}</span>
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#0B0F17] border border-white/10 rounded-2xl shadow-2xl p-2">
                {Object.keys(cotData).map((symbol) => (
                  <DropdownMenuItem
                    key={symbol}
                    onClick={() => setActiveAsset(symbol)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-all text-sm font-bold",
                      activeAsset === symbol ? "text-[#00D9A5]" : "text-white/60"
                    )}
                  >
                    <span>{symbol}</span>
                    {activeAsset === symbol && <Check className="w-4 h-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-2 overflow-y-auto custom-scrollbar h-full pb-8 items-start">
                {Object.values(cotData).map((assetData) => (
                  <OverviewCard
                    key={assetData.symbol}
                    symbol={assetData.symbol}
                    data={assetData}
                    onClick={() => selectAsset(assetData.symbol)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="technical"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="flex-1 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar pb-8 font-apple"
          >
            <TechCard className="p-10 bg-[#0B0F17]/40 relative overflow-hidden flex flex-col min-h-fit border-white/5">
              <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#00D9A5]/5 blur-[150px] rounded-full pointer-events-none" />

              {/* Header Section */}
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center bg-white/5 rounded-full px-5 py-2 border border-white/10 shadow-2xl backdrop-blur-md">
                      <Zap className="w-4 h-4 text-[#00D9A5] mr-2" />
                      <span className="text-base font-medium text-white uppercase tracking-[0.2em]">{asset.symbol} TECHNICAL DEPTH</span>
                    </div>
                    <Badge className={cn(
                      "px-5 py-1.5 font-medium tracking-widest rounded-full uppercase text-base",
                      asset.sentiment === 'BULLISH' ? "bg-[#00D9A5]/20 text-[#00D9A5] border-[#00D9A5]/30 shadow-[0_0_20_rgba(0,217,165,0.2)]" :
                        "bg-red-500/20 text-red-500 border-red-500/30"
                    )}>
                      {asset.sentiment}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-2 tracking-tighter leading-none uppercase">{asset.name}</h1>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-black text-white tracking-tighter leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                        {asset.netPosition > 0 ? '+' : ''}{(asset.netPosition / 1000).toFixed(1)}k
                      </span>
                      <span className="text-base font-medium text-white uppercase tracking-widest">Net</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base text-white font-medium uppercase tracking-[0.4em] font-apple">Institutional Position</span>
                      <div className="h-4 w-px bg-white/20" />
                      <div className={cn(
                        "flex items-center gap-2 text-base font-medium uppercase tracking-widest font-apple",
                        asset.change >= 0 ? "text-[#00D9A5]" : "text-red-400"
                      )}>
                        {asset.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(asset.change).toLocaleString()} Change
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-10 rounded-[48px] border border-white/10 flex flex-col items-center justify-center min-w-[200px] backdrop-blur-xl">
                  <span className="text-base font-medium text-white uppercase tracking-[0.3em] mb-4">52W Percentile</span>
                  <div className="text-3xl font-black text-white tracking-tighter font-apple">{asset.technical?.percentile52W || 0}%</div>
                  <div className="px-5 py-2 bg-[#00D9A5]/10 rounded-full border border-[#00D9A5]/20 text-base text-[#00D9A5] font-medium mt-4 uppercase tracking-widest shadow-lg">
                    {asset.technical?.percentile52W > 80 ? 'EXTREME BULLISH' : asset.technical?.percentile52W < 20 ? 'EXTREME BEARISH' : 'NORMALIZED BIAS'}
                  </div>
                </div>
              </div>

              {/* Quick Technical Stats Grid */}
              <div className="grid grid-cols-4 gap-6 mb-12 relative z-10">
                <TechnicalMetric
                  label="Institutional Z-Score"
                  value={asset.technical?.zScore > 0 ? '+' + (asset.technical?.zScore || 0) : (asset.technical?.zScore || 0)}
                  subValue="Deviation from Mean"
                  variant={Math.abs(asset.technical?.zScore || 0) > 2 ? (asset.technical?.zScore > 0 ? 'bull' : 'bear') : 'default'}
                />
                <TechnicalMetric
                  label="Concentration Index"
                  value={asset.technical?.concentration4 || 0}
                  suffix="%"
                  subValue="Top 4 Dealers Dominance"
                />
                <TechnicalMetric
                  label="Price Sync Core"
                  value={asset.technical.oiCorrelation}
                  subValue="Positioning Alignment"
                  variant={asset.technical.oiCorrelation > 0.8 ? 'bull' : asset.technical.oiCorrelation < -0.8 ? 'bear' : 'default'}
                />
                <TechnicalMetric
                  label="Active Liquid OI"
                  value={((asset?.openInterest || 0) / 1000000).toFixed(2)}
                  suffix="M"
                  subValue="Total Open Contracts"
                />
              </div>

              {/* Advanced Bias Transition Scales (Rolling 4-Week) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12 relative z-10 items-stretch">
                <div className="lg:col-span-2">
                  <WeeklyBiasScale data={asset.rollingBias} />
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-10 rounded-[48px] border border-[#00D9A5]/20 bg-gradient-to-br from-[#00D9A5]/10 via-[#00D9A5]/5 to-transparent flex flex-col justify-center shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-[#00D9A5]/10 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-[#00D9A5]" />
                    </div>
                    <h4 className="text-base font-medium text-white uppercase tracking-[0.2em] font-apple">Bias Velocity Analysis</h4>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <span className="text-base font-medium text-white uppercase tracking-[0.3em] block mb-3 font-apple">Trend Conviction</span>
                      <p className="text-base font-medium text-white leading-tight font-apple">
                        Smart Money commitment is in an **{asset.rollingBias[3].value > asset.rollingBias[2].value ? 'Acceleration' : 'Correction'}** phase.
                      </p>
                    </div>
                    <div>
                      <span className="text-base font-medium text-white uppercase tracking-[0.3em] block mb-3 font-apple">Momentum Impulse</span>
                      <div className="flex items-center gap-5">
                        <span className="text-2xl font-black text-[#00D9A5] drop-shadow-[0_0_15px_#00D9A5/40]">
                          {Math.abs(asset.rollingBias[3].value - asset.rollingBias[2].value)}%
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white uppercase leading-none tracking-widest font-apple">
                            Weekly
                          </span>
                          <span className="text-sm font-medium text-white uppercase leading-none tracking-widest mt-1 font-apple">
                            Variance
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/10">
                      <p className="text-base text-white leading-relaxed italic font-medium pr-4">
                        "The delta from **{asset.rollingBias[2].value}%** to **{asset.rollingBias[3].value}%** suggests a tactical rotation in institutional desk positioning for the next cycle."
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bias Interpretation Summary - RESTORED & ADAPTED */}
              <div className="mb-12 p-6 rounded-[32px] bg-white/5 border border-white/10 glass-edge relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Activity className="w-24 h-24 text-[#00D9A5]" />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-2 h-6 bg-[#00D9A5] rounded-full shadow-[0_0_15px_#00D9A5]" />
                  <h4 className="text-base font-medium text-white uppercase tracking-[0.3em] font-apple">Institutional Bias Interpretation</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <ul className="space-y-4">
                    {(asset.interpretation || []).map((line, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-[#00D9A5] shadow-[0_0_10px_#00D9A5] flex-shrink-0 mt-1.5" />
                        <span className="text-base text-white leading-relaxed font-medium font-apple">{line}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col justify-center p-6 bg-[#00D9A5]/5 rounded-3xl border border-[#00D9A5]/10">
                    <span className="text-base font-medium text-[#00D9A5] uppercase tracking-[0.2em] mb-2 text-center font-apple">Executive Intelligence</span>
                    <p className="text-base text-white text-center italic leading-relaxed font-medium font-apple">
                      "The current institutional footprint suggests a high-conviction positioning phase. Momentum velocity remains consistent with historical accumulation cycles."
                    </p>
                  </div>
                </div>
              </div>



              {/* Institutional Trend Chart & TFF Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12 relative z-10">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-[48px] p-10 shadow-inner">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <LineChart className="w-5 h-5 text-[#00D9A5]" />
                      </div>
                      <h4 className="text-base font-medium text-white uppercase tracking-[0.2em] font-apple">Net Position Trend Analysis</h4>
                    </div>
                  </div>
                  <div className="h-[300px] w-full overflow-hidden flex justify-center">
                    <GlowingChart
                      data={historyData}
                      width="100%"
                      height={300}
                      color="#00D9A5"
                      showPrice={true}
                    />
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-[48px] p-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <TableIcon className="w-5 h-5 text-[#00D9A5]" />
                    </div>
                    <h4 className="text-base font-medium text-white uppercase tracking-[0.2em] font-apple">TFF Participant Feed</h4>
                  </div>
                  <div className="space-y-1">
                    <InstitutionalBreakdown type="Asset Managers" data={asset.breakdownTFF.assetManagers} />
                    <InstitutionalBreakdown type="Leveraged Funds" data={asset.breakdownTFF.leveragedFunds} />
                    <InstitutionalBreakdown type="Other Reportables" data={asset.breakdownTFF.otherReportables} />
                  </div>
                  <div className="mt-10 p-6 bg-[#00D9A5]/5 rounded-[32px] border border-[#00D9A5]/10 shadow-[0_0_30px_rgba(0,217,165,0.05)]">
                    <div className="text-base font-medium text-[#00D9A5] uppercase tracking-[0.3em] mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" /> Technical Insight
                    </div>
                    <p className="text-base text-white leading-relaxed font-medium font-apple italic">
                      Monitor the **Leveraged Funds** net delta of ({asset.breakdownTFF.leveragedFunds.change > 0 ? '+' : ''}{asset.breakdownTFF.leveragedFunds.change.toLocaleString()}) to anticipate potential momentum capitulation or squeeze events.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Technical Cards */}
              <div className="grid grid-cols-2 gap-10 relative z-10">
                <div className="p-10 rounded-[48px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
                  <div className="flex items-center gap-4 mb-8">
                    <Layers className="w-6 h-6 text-[#00D9A5]" />
                    <h5 className="text-sm font-medium text-white uppercase tracking-[0.2em] font-apple">Microstructure Metrics</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div>
                      <span className="text-[10px] font-medium text-white uppercase tracking-[0.3em] block mb-4 font-apple">Market Concentration</span>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-2xl font-medium text-white tracking-tighter font-apple">{asset.technical?.concentration4 || 0}%</span>
                          <span className="text-[9px] font-medium text-white uppercase tracking-widest mt-1 font-apple">Top 4</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-2xl font-medium text-white tracking-tighter font-apple">{asset.technical?.concentration8 || 0}%</span>
                          <span className="text-[9px] font-medium text-white uppercase tracking-widest mt-1 font-apple">Top 8</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-white uppercase tracking-[0.3em] block mb-4 font-apple">Signal Quality</span>
                      <div className="inline-flex items-center px-6 py-2.5 rounded-2xl bg-[#00D9A5]/10 border border-[#00D9A5]/20 text-[#00D9A5] text-xs font-medium uppercase tracking-[0.2em] shadow-lg font-apple">
                        {asset.technical.oiCorrelation > 0.7 ? 'Strong Conviction' :
                          asset.technical.oiCorrelation < -0.7 ? 'Contra Signal' : 'Neutral Alpha'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/10 flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <Timer className="w-6 h-6 text-[#00D9A5]" />
                    <h5 className="text-sm font-medium text-white uppercase tracking-[0.2em] font-apple">Seasonality Insight</h5>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-3xl font-medium text-white font-apple">FEB</div>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="text-sm font-bold text-[#00D9A5] uppercase tracking-widest font-apple">Bullish Window</div>
                    </div>
                    <p className="text-sm text-white leading-relaxed mb-6 font-medium font-apple">
                      Historically, February shows a **72%** probability of institutional accumulation for {asset.symbol}. The current percentile of **{asset.technical.percentile52W}%** aligns with late-stage accumulation patterns.
                    </p>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '72%' }}
                        className="h-full bg-[#00D9A5] shadow-[0_0_15px_rgba(0,217,165,0.4)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TechCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

