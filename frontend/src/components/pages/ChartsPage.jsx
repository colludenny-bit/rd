import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { LineChart, Search, Star, TrendingUp } from 'lucide-react';

const symbols = [
  { symbol: 'XAUUSD', name: 'Gold', category: 'Commodity' },
  { symbol: 'NAS100', name: 'Nasdaq 100', category: 'Index' },
  { symbol: 'SPX500', name: 'S&P 500', category: 'Index' },
  { symbol: 'DJI', name: 'Dow Jones', category: 'Index' },
  { symbol: 'EURUSD', name: 'EUR/USD', category: 'Forex' },
  { symbol: 'GBPUSD', name: 'GBP/USD', category: 'Forex' },
  { symbol: 'BTCUSD', name: 'Bitcoin', category: 'Crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', category: 'Crypto' },
];

export default function ChartsPage() {
  const { t } = useTranslation();
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(['XAUUSD', 'NAS100']);

  const filteredSymbols = symbols.filter(s => 
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = (symbol) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <div className="space-y-6 fade-in" data-testid="charts-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LineChart className="w-8 h-8 text-primary" />
          {t('nav.charts')}
        </h1>
        <p className="text-muted-foreground mt-1">Grafici TradingView interattivi</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Symbol List */}
        <Card className="bg-card/80 border-border/50 lg:col-span-1" data-testid="symbol-list">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Strumenti</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca..."
                className="pl-10 bg-secondary/50"
                data-testid="symbol-search"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto scrollbar-thin">
            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs text-muted-foreground uppercase mb-2">Preferiti</h4>
                <div className="space-y-1">
                  {symbols.filter(s => favorites.includes(s.symbol)).map(s => (
                    <button
                      key={s.symbol}
                      onClick={() => setSelectedSymbol(s.symbol)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                        selectedSymbol === s.symbol 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{s.symbol}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Symbols */}
            <div className="space-y-1">
              {filteredSymbols.map(s => (
                <button
                  key={s.symbol}
                  onClick={() => setSelectedSymbol(s.symbol)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                    selectedSymbol === s.symbol 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-secondary/50'
                  }`}
                  data-testid={`symbol-${s.symbol}`}
                >
                  <div className="text-left">
                    <span className="font-medium block">{s.symbol}</span>
                    <span className="text-xs text-muted-foreground">{s.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(s.symbol);
                    }}
                    className="p-1 hover:bg-secondary rounded"
                  >
                    <Star className={`w-4 h-4 ${
                      favorites.includes(s.symbol) 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-muted-foreground'
                    }`} />
                  </button>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TradingView Chart */}
        <Card className="bg-card/80 border-border/50 lg:col-span-3" data-testid="chart-container">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {selectedSymbol}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="chart-container" style={{ height: '600px' }}>
              {/* TradingView Widget */}
              <iframe
                title="TradingView Chart"
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${selectedSymbol}&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=it&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${selectedSymbol}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Timeframe', value: 'H1' },
          { label: 'Spread', value: '0.3' },
          { label: 'Session', value: 'London' },
          { label: 'Volatility', value: 'Medium' },
        ].map((item, i) => (
          <Card key={i} className="bg-card/80 border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
