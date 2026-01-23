import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function NewsPage() {
  const calendarRef = useRef(null);
  const [importanceLevel, setImportanceLevel] = useState(3); // 1, 2, or 3 lines

  const loadWidget = (importance) => {
    if (calendarRef.current) {
      calendarRef.current.innerHTML = '';
      
      // Set importance filter based on level
      let importanceFilter;
      if (importance === 1) {
        importanceFilter = "-1"; // Only low importance
      } else if (importance === 2) {
        importanceFilter = "-1,0"; // Low and medium
      } else {
        importanceFilter = "-1,0,1"; // All importance levels
      }
      
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.style.height = '100%';
      widgetContainer.style.width = '100%';
      
      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget';
      widgetDiv.style.height = '100%';
      widgetDiv.style.width = '100%';
      
      widgetContainer.appendChild(widgetDiv);
      calendarRef.current.appendChild(widgetContainer);
      
      // Create and load script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "isTransparent": false,
        "width": "100%",
        "height": "100%",
        "locale": "it",
        "importanceFilter": importanceFilter,
        "countryFilter": "us,eu,gb,jp,cn,de,fr,it,au,ca,ch,nz,br,mx,kr,in,ru,za,se,no,pl,tr,sg,hk"
      });
      
      widgetContainer.appendChild(script);
    }
  };

  useEffect(() => {
    loadWidget(importanceLevel);
    
    return () => {
      if (calendarRef.current) {
        calendarRef.current.innerHTML = '';
      }
    };
  }, [importanceLevel]);

  const cycleImportance = () => {
    setImportanceLevel(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return 1;
    });
  };

  const getImportanceLabel = () => {
    if (importanceLevel === 1) return "Bassa";
    if (importanceLevel === 2) return "Media";
    return "Tutte";
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col fade-in" data-testid="news-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" />
            Economic Calendar & News
          </h1>
          <p className="text-muted-foreground mt-1">News e eventi economici in tempo reale da TradingView</p>
        </div>
        
        {/* Importance Filter Button */}
        <button
          onClick={cycleImportance}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
          data-testid="importance-filter"
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={cn(
                  "w-1 rounded-full transition-all",
                  level <= importanceLevel ? "bg-primary" : "bg-muted",
                  level === 1 ? "h-3" : level === 2 ? "h-4" : "h-5"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            Importanza: {getImportanceLabel()}
          </span>
        </button>
      </motion.div>

      {/* TradingView Economic Calendar - Full Height */}
      <div 
        className="flex-1 rounded-xl overflow-hidden border border-border bg-card/80"
        style={{ minHeight: '600px' }}
      >
        <div 
          ref={calendarRef}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}
