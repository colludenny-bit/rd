import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';
import { 
  Globe, TrendingUp, TrendingDown, Calendar, Clock, AlertTriangle,
  BarChart3, DollarSign, Percent, Building, RefreshCw, ExternalLink,
  Newspaper, Filter, ChevronRight
} from 'lucide-react';

// Simulated Macro News Data
const generateMacroNews = () => {
  const news = [
    {
      id: 1,
      time: '14:30',
      title: 'US Core CPI m/m',
      impact: 'high',
      actual: '0.3%',
      forecast: '0.2%',
      previous: '0.3%',
      surprise: 'positive',
      analysis: 'Inflazione core sopra attese. Fed potrebbe mantenere tassi alti più a lungo. Bearish per equity, bullish per USD.',
      source: 'Bloomberg'
    },
    {
      id: 2,
      time: '15:00',
      title: 'ECB President Lagarde Speech',
      impact: 'high',
      actual: '-',
      forecast: '-',
      previous: '-',
      surprise: 'neutral',
      analysis: 'Attesa retorica hawkish. Focus su persistenza inflazione eurozona.',
      source: 'Reuters'
    },
    {
      id: 3,
      time: '16:00',
      title: 'US Retail Sales m/m',
      impact: 'medium',
      actual: '-0.2%',
      forecast: '0.1%',
      previous: '0.4%',
      surprise: 'negative',
      analysis: 'Consumi sotto attese. Segnale di rallentamento economico. Mixed per equity.',
      source: 'Investing'
    },
    {
      id: 4,
      time: '20:00',
      title: 'FOMC Member Speech',
      impact: 'medium',
      actual: '-',
      forecast: '-',
      previous: '-',
      surprise: 'neutral',
      analysis: 'Da monitorare toni su politica monetaria.',
      source: 'Fed'
    },
    {
      id: 5,
      time: '22:00',
      title: 'US Crude Oil Inventories',
      impact: 'low',
      actual: '-1.5M',
      forecast: '-0.8M',
      previous: '-2.5M',
      surprise: 'positive',
      analysis: 'Scorte in calo supportano prezzi oil.',
      source: 'EIA'
    }
  ];
  return news;
};

// Simulated Finviz Screener Data
const generateScreenerData = () => ({
  topGainers: [
    { symbol: 'NVDA', name: 'NVIDIA', change: 5.2, price: 142.50, volume: '85M' },
    { symbol: 'AMD', name: 'AMD Inc', change: 3.8, price: 178.20, volume: '45M' },
    { symbol: 'TSLA', name: 'Tesla', change: 3.1, price: 248.90, volume: '120M' },
    { symbol: 'META', name: 'Meta', change: 2.8, price: 612.30, volume: '25M' },
    { symbol: 'AAPL', name: 'Apple', change: 1.9, price: 198.50, volume: '55M' }
  ],
  topLosers: [
    { symbol: 'INTC', name: 'Intel', change: -4.2, price: 19.80, volume: '65M' },
    { symbol: 'BA', name: 'Boeing', change: -3.1, price: 178.40, volume: '12M' },
    { symbol: 'DIS', name: 'Disney', change: -2.5, price: 112.30, volume: '18M' },
    { symbol: 'NKE', name: 'Nike', change: -2.1, price: 78.90, volume: '8M' },
    { symbol: 'WMT', name: 'Walmart', change: -1.8, price: 92.40, volume: '15M' }
  ],
  sectorPerf: [
    { name: 'Technology', change: 2.1, color: 'primary' },
    { name: 'Healthcare', change: 0.8, color: 'primary' },
    { name: 'Financials', change: 0.5, color: 'primary' },
    { name: 'Energy', change: -0.3, color: 'red' },
    { name: 'Utilities', change: -0.8, color: 'red' },
    { name: 'Real Estate', change: -1.2, color: 'red' }
  ]
});

// News Card Component
const NewsCard = ({ news, onClick }) => {
  const impactColors = {
    high: 'border-red-500/50 bg-red-500/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    low: 'border-border/50 bg-card/80'
  };
  
  const surpriseIcons = {
    positive: <TrendingUp className="w-4 h-4 text-primary" />,
    negative: <TrendingDown className="w-4 h-4 text-red-400" />,
    neutral: <span className="w-4 h-4 text-muted-foreground">—</span>
  };

  return (
    <Card 
      className={cn("cursor-pointer hover:scale-[1.01] transition-all", impactColors[news.impact])}
      onClick={() => onClick(news)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">{news.time}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded",
                news.impact === 'high' ? "bg-red-500/20 text-red-400" :
                news.impact === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                "bg-secondary text-muted-foreground"
              )}>
                {news.impact.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">{news.source}</span>
            </div>
            <h4 className="font-medium text-sm mb-2">{news.title}</h4>
            <div className="flex items-center gap-4 text-xs">
              {news.actual !== '-' && (
                <>
                  <span>Actual: <strong className={news.surprise === 'positive' ? 'text-primary' : news.surprise === 'negative' ? 'text-red-400' : ''}>{news.actual}</strong></span>
                  <span className="text-muted-foreground">Forecast: {news.forecast}</span>
                  <span className="text-muted-foreground">Prev: {news.previous}</span>
                </>
              )}
            </div>
          </div>
          {surpriseIcons[news.surprise]}
        </div>
      </CardContent>
    </Card>
  );
};

// Stock Row Component
const StockRow = ({ stock, isGainer }) => (
  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
    <div className="flex items-center gap-3">
      <span className="font-bold text-sm w-14">{stock.symbol}</span>
      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{stock.name}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm">${stock.price}</span>
      <span className={cn(
        "font-bold text-sm w-16 text-right",
        isGainer ? "text-primary" : "text-red-400"
      )}>
        {isGainer ? '+' : ''}{stock.change}%
      </span>
    </div>
  </div>
);

export default function MacroEconomyPage() {
  const [news, setNews] = useState([]);
  const [screenerData, setScreenerData] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [impactFilter, setImpactFilter] = useState('all');

  useEffect(() => {
    setNews(generateMacroNews());
    setScreenerData(generateScreenerData());
  }, []);

  const filteredNews = impactFilter === 'all' 
    ? news 
    : news.filter(n => n.impact === impactFilter);

  return (
    <div className="space-y-6 fade-in" data-testid="macro-economy-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          MacroEconomia
        </h1>
        <p className="text-muted-foreground mt-1">
          News macro • Dati economici • Market Screener
        </p>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="bg-secondary/50 p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger value="calendar" className="rounded-lg">
            <Calendar className="w-4 h-4 mr-2" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="news" className="rounded-lg">
            <Newspaper className="w-4 h-4 mr-2" />
            News
          </TabsTrigger>
          <TabsTrigger value="screener" className="rounded-lg">
            <BarChart3 className="w-4 h-4 mr-2" />
            Screener
          </TabsTrigger>
          <TabsTrigger value="sectors" className="rounded-lg">
            <Building className="w-4 h-4 mr-2" />
            Settori
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="high">High Impact</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* News List */}
          <div className="space-y-3">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} news={item} onClick={setSelectedNews} />
            ))}
          </div>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Latest Headlines */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-primary" />
                  Headlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'Fed signals patience on rate cuts amid sticky inflation',
                  'ECB officials debate pace of future rate decisions',
                  'US jobs data stronger than expected, markets reassess',
                  'Oil prices rise on Middle East tensions',
                  'Tech stocks lead rally on AI optimism'
                ].map((headline, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <span className="text-sm">{headline}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Market Summary */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Market Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'S&P 500', value: '6,051', change: 0.8 },
                    { name: 'NASDAQ', value: '21,450', change: 1.2 },
                    { name: 'DOW', value: '44,200', change: 0.5 },
                    { name: 'VIX', value: '15.6', change: -5.2 }
                  ].map((index) => (
                    <div key={index.name} className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">{index.name}</p>
                      <p className="font-bold">{index.value}</p>
                      <p className={cn(
                        "text-xs",
                        index.change > 0 ? "text-primary" : "text-red-400"
                      )}>
                        {index.change > 0 ? '+' : ''}{index.change}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Screener Tab */}
        <TabsContent value="screener" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Gainers */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {screenerData?.topGainers.map((stock) => (
                  <StockRow key={stock.symbol} stock={stock} isGainer={true} />
                ))}
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {screenerData?.topLosers.map((stock) => (
                  <StockRow key={stock.symbol} stock={stock} isGainer={false} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sectors Tab */}
        <TabsContent value="sectors" className="space-y-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {screenerData?.sectorPerf.map((sector) => (
                  <div 
                    key={sector.name}
                    className={cn(
                      "p-4 rounded-xl text-center",
                      sector.change > 0 ? "bg-primary/10" : "bg-red-500/10"
                    )}
                  >
                    <p className="text-sm font-medium mb-1">{sector.name}</p>
                    <p className={cn(
                      "text-xl font-bold",
                      sector.change > 0 ? "text-primary" : "text-red-400"
                    )}>
                      {sector.change > 0 ? '+' : ''}{sector.change}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* News Detail Modal */}
      {selectedNews && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNews(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">{selectedNews.title}</h3>
            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              <span>{selectedNews.time}</span>
              <span>•</span>
              <span>{selectedNews.source}</span>
            </div>
            
            {selectedNews.actual !== '-' && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Actual</p>
                  <p className="font-bold">{selectedNews.actual}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Forecast</p>
                  <p className="font-bold">{selectedNews.forecast}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className="font-bold">{selectedNews.previous}</p>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-primary/10 rounded-xl mb-4">
              <h4 className="text-sm font-medium text-primary mb-2">Analisi AI</h4>
              <p className="text-sm">{selectedNews.analysis}</p>
            </div>
            
            <Button onClick={() => setSelectedNews(null)} className="w-full rounded-xl">
              Chiudi
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
