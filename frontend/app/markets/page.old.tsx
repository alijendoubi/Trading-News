'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface Asset {
  id: string;
  symbol: string;
  type: string;
  name: string;
  lastPrice: number;
  change: number;
  changeAmount: number;
  high24h?: number;
  low24h?: number;
  volume?: number;
}

export default function MarketsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await apiClient.get('/api/markets/assets');
        setAssets(response.data.data?.data || response.data.data || []);
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
                         asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filter === 'all' || asset.type === filter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'forex': return '💱';
      case 'crypto': return '₿';
      case 'commodity': return '🛢️';
      case 'index': return '📈';
      default: return '📊';
    }
  };

  const assetTypes = ['all', ...new Set(assets.map(a => a.type))];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">📊 Live Markets</h1>
      
      <div className="mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by symbol or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {assetTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Markets' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading market data...</p>
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{getTypeIcon(asset.type)} {asset.symbol}</h3>
                  <p className="text-sm text-gray-600">{asset.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${asset.type === 'forex' ? 'bg-blue-100 text-blue-800' : asset.type === 'crypto' ? 'bg-orange-100 text-orange-800' : asset.type === 'commodity' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                  {asset.type}
                </span>
              </div>
              <div className="mb-3">
                <p className="text-2xl font-bold">${asset.lastPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`font-semibold ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">${asset.changeAmount.toFixed(2)}</p>
                </div>
                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition">
                  Watch
                </button>
              </div>
              {asset.high24h && asset.low24h && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                  <p>24h High: ${asset.high24h.toFixed(2)}</p>
                  <p>24h Low: ${asset.low24h.toFixed(2)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No assets found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
