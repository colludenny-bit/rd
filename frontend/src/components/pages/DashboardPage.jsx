import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { TrendingUp, TrendingDown, Minus, Activity, Brain, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('greeting.morning');
  if (hour < 17) return t('greeting.afternoon');
  if (hour < 21) return t('greeting.evening');
  return t('greeting.night');
};

const MarketCard = ({ symbol, data, onClick }) => {
  const { t } = useTranslation();
  const trendClass = data.trend === 'Rialzista' ? 'trend-bullish' : 
                     data.trend === 'Ribassista' ? 'trend-bearish' : 'trend-neutral';
  const TrendIcon = data.trend === 'Rialzista' ? TrendingUp : 
                    data.trend === 'Ribassista' ? TrendingDown : Minus;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="market-card card-hover bg-card/80 border-border/50" data-testid={`market-card-${symbol}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-lg">{symbol}</span>
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", trendClass)}>
              <TrendIcon className="w-3 h-3 inline mr-1" />
              {data.trend}
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{t('market.confidence')}</span>
                <span className="font-semibold">{data.confidence}%</span>
              </div>
              <div className="confidence-bar bg-secondary">
                <div 
                  className="confidence-fill bg-primary"
                  style={{ width: `${data.confidence}%` }}
                />
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">↗ {data.win_rate}% WR</span>
              <span className="text-muted-foreground">DD: {data.max_dd}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PriceTicker = ({ prices }) => {
  return (
    <div className="price-ticker mb-6" data-testid="price-ticker">
      {Object.entries(prices).map(([symbol, data]) => (
        <motion.div
          key={symbol}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2 bg-card/60 rounded-xl border border-border/50 min-w-fit"
        >
          <span className="font-bold text-sm">{symbol}</span>
          <span className="font-mono text-sm">${data.price?.toLocaleString()}</span>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded",
            data.change >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          )}>
            {data.change >= 0 ? '+' : ''}{data.change}%
          </span>
        </motion.div>
      ))}
    </div>
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
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh prices every 30 seconds
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/market/prices`);
        setPrices(res.data);
      } catch (e) {
        console.error('Price refresh error:', e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {t('dashboard.assistant_active')}
        </div>
      </motion.div>

      {/* Price Ticker */}
      <PriceTicker prices={prices} />

      {/* Market Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t('dashboard.market_overview')}
          </h2>
          <span className="text-sm text-muted-foreground">{t('dashboard.view_all')} →</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(prices).map(([symbol, data], index) => (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MarketCard symbol={symbol} data={data} />
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
                  { text: 'USD Headline Momentum', time: '1m fa', icon: Activity },
                  { text: 'USD/JPY Algo updates BULLISH Internals', time: '2m fa', icon: TrendingUp, highlight: true },
                  { text: 'XAU USD Algo updates NEUTRAL Australia - Gold', time: '3m fa', icon: Minus },
                  { text: 'NASDAQ support holding strong', time: '4m fa', icon: TrendingUp },
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
