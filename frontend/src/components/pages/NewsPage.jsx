import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

export default function NewsPage() {
  const calendarRef = useRef(null);

  useEffect(() => {
    // Clean up previous widget
    if (calendarRef.current) {
      calendarRef.current.innerHTML = '';
      
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
        "importanceFilter": "-1,0,1",
        "countryFilter": "us,eu,gb,jp,cn,de,fr,it,au,ca,ch,nz,br,mx,kr,in,ru,za,se,no,pl,tr,sg,hk"
      });
      
      widgetContainer.appendChild(script);
    }
    
    return () => {
      if (calendarRef.current) {
        calendarRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col fade-in" data-testid="news-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" />
          Economic Calendar & News
        </h1>
        <p className="text-muted-foreground mt-1">News e eventi economici in tempo reale da TradingView</p>
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
