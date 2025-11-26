'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
  studies?: string[];
  showIndicators?: boolean;
}

const AVAILABLE_INDICATORS = [
  { id: 'RSI@tv-basicstudies', name: 'RSI', description: 'Relative Strength Index' },
  { id: 'MACD@tv-basicstudies', name: 'MACD', description: 'Moving Average Convergence Divergence' },
  { id: 'BB@tv-basicstudies', name: 'Bollinger Bands', description: 'Volatility indicator' },
  { id: 'EMA@tv-basicstudies', name: 'EMA', description: 'Exponential Moving Average' },
  { id: 'SMA@tv-basicstudies', name: 'SMA', description: 'Simple Moving Average' },
  { id: 'Volume@tv-basicstudies', name: 'Volume', description: 'Trading volume' },
  { id: 'Stochastic@tv-basicstudies', name: 'Stochastic', description: 'Momentum indicator' },
];

export function TradingViewChart({ 
  symbol = 'EURUSD', 
  interval = 'D',
  theme = 'dark',
  height = 500,
  studies = [],
  showIndicators = true
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const toggleIndicator = (indicatorId: string) => {
    setActiveIndicators(prev => 
      prev.includes(indicatorId)
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current) return;

    // Map asset symbols to TradingView format
    const getTradingViewSymbol = (sym: string) => {
      // Crypto
      if (['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'LINK'].includes(sym)) {
        return `BINANCE:${sym}USDT`;
      }
      // Forex
      if (sym.includes('USD') || sym.includes('EUR') || sym.includes('GBP') || sym.includes('JPY')) {
        return `FX_IDC:${sym}`;
      }
      // Stocks
      if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'].includes(sym)) {
        return `NASDAQ:${sym}`;
      }
      // Commodities
      if (sym === 'GOLD') return 'TVC:GOLD';
      if (sym === 'SILVER') return 'TVC:SILVER';
      if (sym === 'CRUDE') return 'TVC:USOIL';
      
      // Default
      return `FX_IDC:${sym}`;
    };

    const tvSymbol = getTradingViewSymbol(symbol);

    // @ts-ignore - TradingView widget types
    if (window.TradingView) {
      // @ts-ignore
      new window.TradingView.widget({
        container_id: containerRef.current.id,
        width: '100%',
        height: height,
        symbol: tvSymbol,
        interval: interval,
        timezone: 'Etc/UTC',
        theme: theme,
        style: '1',
        locale: 'en',
        toolbar_bg: theme === 'dark' ? '#18181b' : '#f1f2f6',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: true,
        studies: [...studies, ...activeIndicators],
        backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff',
        gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        hide_top_toolbar: false,
        hide_legend: false,
        withdateranges: true,
        details: true,
        hotlist: true,
        calendar: true,
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
      });
    }
  }, [symbol, interval, theme, height, studies, activeIndicators, isScriptLoaded]);

  return (
    <div className="space-y-2">
      {/* Indicator Selector */}
      {showIndicators && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <TrendingUp className="w-4 h-4" />
            <span>Indicators:</span>
          </div>
          {AVAILABLE_INDICATORS.map(indicator => (
            <button
              key={indicator.id}
              onClick={() => toggleIndicator(indicator.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeIndicators.includes(indicator.id)
                  ? 'bg-primary text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
              title={indicator.description}
            >
              {indicator.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Chart */}
      <div 
        id={`tradingview_${symbol}`} 
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden border border-zinc-800"
      />
    </div>
  );
}
