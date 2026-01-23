import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Filter } from 'lucide-react';

export default function NewsPage() {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  useEffect(() => {
    // Load TradingView Economic Calendar Widget
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "isTransparent": true,
        "width": "100%",
        "height": "600",
        "locale": "it",
        "importanceFilter": "-1,0,1",
        "countryFilter": "us,eu,gb,jp,cn,de,fr,it,au,ca,ch"
      });
      
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="space-y-6 fade-in" data-testid="news-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          Economic Calendar
        </h1>
        <p className="text-muted-foreground mt-1">News e eventi economici in tempo reale</p>
      </motion.div>

      {/* TradingView Economic Calendar */}
      <Card className="bg-card/80 border-border/50 overflow-hidden" data-testid="economic-calendar">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendario Economico
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Tutte le categorie
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={containerRef}
            className="tradingview-widget-container"
            style={{ minHeight: '600px' }}
          >
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Legend */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div>
              <p className="font-medium text-sm">Alta Importanza</p>
              <p className="text-xs text-muted-foreground">Impatto forte sul mercato</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div>
              <p className="font-medium text-sm">Media Importanza</p>
              <p className="text-xs text-muted-foreground">Impatto moderato</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <div>
              <p className="font-medium text-sm">Bassa Importanza</p>
              <p className="text-xs text-muted-foreground">Impatto limitato</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
