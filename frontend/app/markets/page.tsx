'use client';

import { useState, useMemo } from 'react';
import { usePolling } from '@/lib/usePolling';
import apiClient from '@/lib/apiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PriceChange } from '@/components/ui/PriceChange';
import { RefreshCw, Search, TrendingUp } from 'lucide-react';

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  type?: string;
}

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'volume' | 'marketCap'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { data, loading, error, refetch } = usePolling<{ data: MarketData[] }>(
    async () => {
      const response = await apiClient.get('/api/markets');
      return response.data;
    },
    30000,
    true
  );

  const markets = data?.data || [];
  
  // Filter and sort logic
  const filteredMarkets = useMemo(() => {
    let filtered = markets.filter(market => {
      const matchesSearch = market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           market.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || market.type === selectedType;
      return matchesSearch && matchesType;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch(sortBy) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'price': aVal = a.currentPrice; bVal = b.currentPrice; break;
        case 'change': aVal = a.change24h; bVal = b.change24h; break;
        case 'volume': aVal = a.volume24h; bVal = b.volume24h; break;
        case 'marketCap': aVal = a.marketCap; bVal = b.marketCap; break;
        default: return 0;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    
    return filtered;
  }, [markets, searchQuery, selectedType, sortBy, sortOrder]);
  
  const marketTypes = ['all', ...new Set(markets.map(m => m.type).filter(Boolean))];
  
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-danger mb-4">Failed to load market data: {error.message}</p>
          <Button onClick={refetch} variant="primary">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-100 flex items-center gap-2 sm:gap-3">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            Live Market Data
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-1 sm:mt-2">Real-time prices and market analytics</p>
        </div>
        <Button onClick={refetch} variant="secondary" disabled={loading} size="sm">
          <RefreshCw className={`w-4 h-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 min-w-full sm:min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            {marketTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : (type || '').toUpperCase()}
              </option>
            ))}
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="marketCap">Market Cap</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="change">24h Change</option>
            <option value="volume">Volume</option>
          </select>
          
          <Button
            variant="ghost"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </Card>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Total Markets</div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100">{markets.length}</div>
        </Card>
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Gainers</div>
          <div className="text-xl sm:text-2xl font-bold text-success">
            {markets.filter(m => m.change24h > 0).length}
          </div>
        </Card>
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Losers</div>
          <div className="text-xl sm:text-2xl font-bold text-danger">
            {markets.filter(m => m.change24h < 0).length}
          </div>
        </Card>
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Avg Change</div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100">
            <PriceChange value={markets.reduce((acc, m) => acc + m.change24h, 0) / markets.length} />
          </div>
        </Card>
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Top Gainer</div>
          <div className="text-xl sm:text-2xl font-bold text-success">
            {markets.length > 0 ? `+${Math.max(...markets.map(m => m.change24h)).toFixed(2)}%` : 'N/A'}
          </div>
        </Card>
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Top Loser</div>
          <div className="text-xl sm:text-2xl font-bold text-danger">
            {markets.length > 0 ? `${Math.min(...markets.map(m => m.change24h)).toFixed(2)}%` : 'N/A'}
          </div>
        </Card>
      </div>

      {/* Markets Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  24h Volume
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-4 lg:px-6 py-8 sm:py-12 text-center text-sm sm:text-base text-zinc-400">
                    No markets found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((market) => (
                  <tr key={market.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-zinc-100">{market.name}</div>
                          <div className="text-xs text-zinc-400">{market.symbol}</div>
                        </div>
                        {market.type && (
                          <Badge variant="default" className="hidden sm:inline-flex">{market.type}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <span className="text-xs sm:text-sm font-mono text-zinc-100">
                        ${market.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <div className="text-xs sm:text-sm">
                        <PriceChange value={market.change24h} showIcon />
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm text-zinc-300 font-mono">
                      ${market.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm text-zinc-300 font-mono">
                      ${market.marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Auto-refresh indicator */}
      <div className="mt-4 text-center text-sm text-zinc-500">
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
