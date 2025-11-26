'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriceChange } from '@/components/ui/PriceChange';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: any) => void;
  currentAsset?: any;
}

export function AssetSelectorModal({ isOpen, onClose, onSelect, currentAsset }: AssetSelectorModalProps) {
  const [markets, setMarkets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'forex' | 'crypto' | 'stock' | 'commodity' | 'index'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMarkets();
    }
  }, [isOpen]);

  const fetchMarkets = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/markets`);
      const data = await res.json();
      setMarkets(data.data || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = useMemo(() => {
    let filtered = markets;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.symbol?.toLowerCase().includes(query) ||
        m.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [markets, selectedType, searchQuery]);

  const handleSelect = (asset: any) => {
    onSelect(asset);
    onClose();
  };

  if (!isOpen) return null;

  const getAssetIcon = (type: string) => {
    const symbols: any = {
      forex: '€',
      crypto: '₿',
      commodity: '🥇',
      stock: '📈',
      index: '📊'
    };
    return symbols[type] || '💱';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-100">Select Asset</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-6 border-b border-zinc-800 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {['all', 'forex', 'crypto', 'stock', 'commodity', 'index'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${
                    selectedType === type
                      ? 'bg-primary text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredMarkets.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No assets found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMarkets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleSelect(asset)}
                    className={`w-full p-4 rounded-lg border transition-all hover:bg-zinc-800/50 text-left ${
                      currentAsset?.id === asset.id
                        ? 'border-primary bg-primary/10'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Asset Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg flex-shrink-0">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-100">{asset.symbol}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                              {asset.type}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500 truncate">{asset.name}</p>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono text-zinc-100 font-bold">
                          {asset.currentPrice?.toFixed(asset.type === 'forex' ? 5 : 2)}
                        </div>
                        <PriceChange value={asset.change24h} showIcon className="text-sm justify-end" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              {filteredMarkets.length} asset{filteredMarkets.length !== 1 ? 's' : ''} found
            </span>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
