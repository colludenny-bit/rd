import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const countries = [
  { code: 'us', name: 'Stati Uniti', flag: '🇺🇸' },
  { code: 'eu', name: 'Europa', flag: '🇪🇺' },
  { code: 'gb', name: 'Regno Unito', flag: '🇬🇧' },
  { code: 'jp', name: 'Giappone', flag: '🇯🇵' },
  { code: 'cn', name: 'Cina', flag: '🇨🇳' },
  { code: 'de', name: 'Germania', flag: '🇩🇪' },
  { code: 'fr', name: 'Francia', flag: '🇫🇷' },
  { code: 'it', name: 'Italia', flag: '🇮🇹' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'ch', name: 'Svizzera', flag: '🇨🇭' },
  { code: 'nz', name: 'Nuova Zelanda', flag: '🇳🇿' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'br', name: 'Brasile', flag: '🇧🇷' },
  { code: 'mx', name: 'Messico', flag: '🇲🇽' },
  { code: 'kr', name: 'Corea del Sud', flag: '🇰🇷' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
];

export default function NewsPage() {
  const calendarRef = useRef(null);
  const [importanceLevel, setImportanceLevel] = useState(3);
  const [selectedCountries, setSelectedCountries] = useState(countries.map(c => c.code));
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const loadWidget = () => {
    if (calendarRef.current) {
      calendarRef.current.innerHTML = '';
      
      // Set importance filter based on level
      let importanceFilter;
      if (importanceLevel === 1) {
        importanceFilter = "1"; // Only high importance
      } else if (importanceLevel === 2) {
        importanceFilter = "0,1"; // Medium and high
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
        "countryFilter": selectedCountries.join(',')
      });
      
      widgetContainer.appendChild(script);
    }
  };

  useEffect(() => {
    loadWidget();
    
    return () => {
      if (calendarRef.current) {
        calendarRef.current.innerHTML = '';
      }
    };
  }, [importanceLevel, selectedCountries]);

  const cycleImportance = () => {
    setImportanceLevel(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return 1;
    });
  };

  const toggleCountry = (code) => {
    setSelectedCountries(prev => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== code);
      }
      return [...prev, code];
    });
  };

  const selectAllCountries = () => {
    setSelectedCountries(countries.map(c => c.code));
  };

  const getImportanceLabel = () => {
    if (importanceLevel === 1) return "Alta";
    if (importanceLevel === 2) return "Media";
    return "Tutte";
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col fade-in" data-testid="news-page">
      {/* CSS to hide TradingView widget header */}
      <style>{`
        .tradingview-widget-container iframe {
          margin-top: -44px !important;
          height: calc(100% + 44px) !important;
        }
      `}</style>

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
          <p className="text-muted-foreground mt-1">News e eventi economici in tempo reale</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-3">
          {/* Analysis Button - Coming Soon */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
            data-testid="analysis-filter"
          >
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
              <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
              <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span className="text-sm font-medium">Analysis</span>
          </button>

          {/* Country Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              data-testid="country-filter"
            >
              <span className="text-lg">
                {selectedCountries.length === countries.length ? '🌍' : countries.find(c => c.code === selectedCountries[0])?.flag}
              </span>
              <span className="text-sm font-medium">
                {selectedCountries.length === countries.length 
                  ? 'Tutti i Paesi' 
                  : `${selectedCountries.length} Paesi`}
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showCountryDropdown && "rotate-180"
              )} />
            </button>

            {/* Country Dropdown */}
            <AnimatePresence>
              {showCountryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50 scrollbar-thin"
                >
                  {/* Select All */}
                  <button
                    onClick={selectAllCountries}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-primary hover:bg-secondary/50 border-b border-border"
                  >
                    Seleziona Tutti
                  </button>
                  
                  {/* Country List */}
                  {countries.map(country => (
                    <button
                      key={country.code}
                      onClick={() => toggleCountry(country.code)}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm flex-1 text-left">{country.name}</span>
                      {selectedCountries.includes(country.code) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
        </div>
      </motion.div>

      {/* Click outside to close dropdown */}
      {showCountryDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowCountryDropdown(false)}
        />
      )}

      {/* TradingView Economic Calendar - Full Height */}
      <div 
        className="flex-1 rounded-xl overflow-hidden border border-border bg-card/80"
        style={{ minHeight: '600px' }}
      >
        <div 
          ref={calendarRef}
          style={{ height: '100%', width: '100%', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}
