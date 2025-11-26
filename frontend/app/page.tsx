'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, Newspaper, Bell, Star, Activity, ArrowRight, Clock, ChevronDown, BarChart3, LineChart, Maximize2, RefreshCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PriceChange } from '@/components/ui/PriceChange';
import { MiniChart } from '@/components/charts/MiniChart';
import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { AssetSelectorModal } from '@/components/modals/AssetSelectorModal';
import { QuickAlertModal } from '@/components/modals/QuickAlertModal';

export default function Home() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'forex' | 'crypto' | 'commodities' | 'indices'>('forex');
  const [loading, setLoading] = useState(true);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [alertAsset, setAlertAsset] = useState<any>(null);
  const [chartInterval, setChartInterval] = useState('D');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all markets
      const marketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/markets`);
      const marketsData = await marketsRes.json();
      const allMarkets = marketsData.data || [];
      setMarkets(allMarkets);
      
      // Set default selected asset (EUR/USD or first available)
      if (!selectedAsset && allMarkets.length > 0) {
        const defaultAsset = allMarkets.find((m: any) => m.symbol === 'EURUSD') || allMarkets[0];
        setSelectedAsset(defaultAsset);
      }

      // Fetch upcoming events
      const eventsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events?limit=5`);
      const eventsData = await eventsRes.json();
      setEvents(eventsData.events || []);

      // Fetch latest news
      const newsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?limit=4`);
      const newsData = await newsRes.json();
      setNews(newsData.articles || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = markets.filter(m => m.type === activeTab);
  
  const getAssetIcon = (type: string) => {
    const symbols: any = {
      forex: '€',
      crypto: '₿',
      commodity: '🥇',
      index: '📊'
    };
    return symbols[type] || '💱';
  };

  return (
    <div className="min-h-screen space-y-4">
      {/* Top Bar with Asset Selector */}
      <div className="flex items-center justify-between gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <button 
          onClick={() => setIsAssetModalOpen(true)}
          className="flex items-center gap-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            {selectedAsset ? getAssetIcon(selectedAsset.type) : '💱'}
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-zinc-100">{selectedAsset?.symbol || 'Select Asset'}</div>
            <div className="text-xs text-zinc-500">Click to change</div>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100" />
        </button>
        
        {selectedAsset && (
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold font-mono text-zinc-100">
                {selectedAsset.currentPrice?.toFixed(selectedAsset.type === 'forex' ? 5 : 2)}
              </div>
              <PriceChange value={selectedAsset.change24h} showIcon className="text-sm" />
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={fetchData}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          {selectedAsset && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setAlertAsset(selectedAsset)}
            >
              <Bell className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column - Chart & Markets Table (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Chart Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-zinc-100">{selectedAsset?.symbol || 'Market'} Chart</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setChartInterval('1')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chartInterval === '1' ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  1D
                </button>
                <button 
                  onClick={() => setChartInterval('W')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chartInterval === 'W' ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  1W
                </button>
                <button 
                  onClick={() => setChartInterval('D')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chartInterval === 'D' ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  1M
                </button>
                <button 
                  onClick={() => setChartInterval('M')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chartInterval === 'M' ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  1Y
                </button>
              </div>
            </div>
            
            {/* TradingView Chart */}
            {selectedAsset ? (
              <TradingViewChart 
                symbol={selectedAsset.symbol}
                interval={chartInterval}
                height={400}
              />
            ) : (
              <div className="h-96 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">Select an asset to view chart</p>
                </div>
              </div>
            )}
          </Card>

          {/* Markets Table */}
          <Card className="p-4">
            {/* Asset Type Tabs */}
            <div className="flex items-center gap-1 mb-4 border-b border-zinc-800 overflow-x-auto">
              {['forex', 'crypto', 'commodities', 'indices'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-zinc-100 border-b-2 border-primary'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Asset</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Change</th>
                    <th className="pb-2 font-medium text-right hidden sm:table-cell">Change %</th>
                    <th className="pb-2 font-medium text-center hidden md:table-cell">Forecast</th>
                    <th className="pb-2 font-medium text-right hidden lg:table-cell">%</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-zinc-800/50">
                        <td colSpan={6} className="py-3">
                          <div className="h-8 bg-zinc-800/50 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filteredMarkets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No {activeTab} markets available
                      </td>
                    </tr>
                  ) : (
                    filteredMarkets.slice(0, 8).map((asset) => (
                      <tr
                        key={asset.id}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                                {getAssetIcon(asset.type)}
                              </div>
                              <div>
                                <div className="font-medium text-zinc-100 text-sm">{asset.symbol}</div>
                                <div className="text-xs text-zinc-500">{asset.name?.slice(0, 20)}</div>
                              </div>
                            </button>
                            <button
                              onClick={() => setAlertAsset(asset)}
                              className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 rounded transition-all"
                              title="Create alert"
                            >
                              <Bell className="w-3 h-3 text-zinc-400" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono text-zinc-100">
                          {asset.currentPrice?.toFixed(asset.type === 'forex' ? 5 : 2)}
                        </td>
                        <td className="py-3 text-right">
                          <PriceChange value={asset.change24h} showIcon={false} />
                        </td>
                        <td className="py-3 text-right hidden sm:table-cell">
                          <PriceChange value={asset.change24h} showIcon />
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <div className="flex justify-center">
                            <MiniChart data={[asset.change24h]} />
                          </div>
                        </td>
                        <td className="py-3 text-right hidden lg:table-cell">
                          <Badge variant={asset.change24h >= 0 ? 'success' : 'danger'} className="text-xs">
                            {asset.change24h >= 0 ? '+' : ''}{(Math.abs(asset.change24h) * 0.5).toFixed(2)}%
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <Link href="/markets">
                <Button variant="ghost" size="sm">
                  View All Markets <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column - Widgets (1/3 width) */}
        <div className="space-y-4">
          {/* Economic Calendar Widget */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-100">Economic Calendar</h2>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="space-y-1">
              {/* Header */}
              <div className="flex items-center text-xs text-zinc-500 pb-2 border-b border-zinc-800">
                <div className="flex-1">Event</div>
                <div className="w-20 text-right">Forecast</div>
              </div>
              
              {/* Events */}
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-2">
                    <div className="h-12 bg-zinc-800/50 rounded animate-pulse" />
                  </div>
                ))
              ) : events.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  No upcoming events
                </div>
              ) : (
                events.slice(0, 5).map((event) => (
                  <div key={event.id} className="py-2 border-b border-zinc-800/50 hover:bg-zinc-800/30 rounded px-2 -mx-2 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1">
                        {event.country === 'US' && '🇺🇸'}
                        {event.country === 'JP' && '🇯🇵'}
                        {event.country === 'EU' && '🇪🇺'}
                        {event.country === 'GB' && '🇬🇧'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-100 truncate">
                          {event.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                          <span>{new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <Badge 
                            variant={event.impact === 'high' ? 'danger' : event.impact === 'medium' ? 'warning' : 'secondary'}
                            className="text-xs px-1 py-0"
                          >
                            {event.impact}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-mono text-success">
                          {event.forecast || '-'}
                        </div>
                        <div className="text-xs text-zinc-600">
                          {event.previous || ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Financial News Widget */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-100">Financial News</h2>
              <Link href="/news">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-800/50 rounded animate-pulse" />
                ))
              ) : news.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  No news available
                </div>
              ) : (
                news.slice(0, 4).map((article) => (
                  <Link
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="p-2 rounded hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Newspaper className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-xs text-zinc-500">
                          {(() => {
                            const now = new Date();
                            const published = new Date(article.publishedAt);
                            const diffMs = now.getTime() - published.getTime();
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            
                            if (diffHours < 1) return 'Hours ago';
                            if (diffHours < 24) return `${diffHours}h ago`;
                            const diffDays = Math.floor(diffHours / 24);
                            if (diffDays < 7) return `${diffDays}d ago`;
                            return published.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          })()}
                        </span>
                      </div>
                      <h3 className="text-sm text-zinc-100 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-1">
                        {article.source}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AssetSelectorModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelect={setSelectedAsset}
        currentAsset={selectedAsset}
      />
      
      <QuickAlertModal
        isOpen={!!alertAsset}
        onClose={() => setAlertAsset(null)}
        asset={alertAsset}
        onSuccess={() => {
          setAlertAsset(null);
        }}
      />
    </div>
  );
}


