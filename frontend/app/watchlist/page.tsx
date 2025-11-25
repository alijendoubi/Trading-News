'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { apiClient } from '@/lib/apiClient';

interface WatchlistItem {
  assetId: string;
  assetType: string;
  assetName: string;
  currentPrice?: number;
  change24h?: number;
}

export default function WatchlistPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAssetId, setNewAssetId] = useState('');
  const [newAssetType, setNewAssetType] = useState('crypto');
  const [newAssetName, setNewAssetName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchWatchlist();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchWatchlist = async () => {
    try {
      const response = await apiClient.get('/api/watchlists');
      setWatchlist(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/api/watchlists', {
        assetId: newAssetId,
        assetType: newAssetType,
        assetName: newAssetName,
      });
      setNewAssetId('');
      setNewAssetName('');
      fetchWatchlist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const handleRemove = async (assetId: string) => {
    try {
      await apiClient.delete(`/api/watchlists/${assetId}`);
      fetchWatchlist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove from watchlist');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Asset</h2>
          <form onSubmit={handleAdd} className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Asset ID (e.g., bitcoin, AAPL)"
              value={newAssetId}
              onChange={(e) => setNewAssetId(e.target.value)}
              required
              className="flex-1 min-w-[200px] px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Display Name"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              required
              className="flex-1 min-w-[200px] px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newAssetType}
              onChange={(e) => setNewAssetType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="crypto">Crypto</option>
              <option value="stock">Stock</option>
              <option value="forex">Forex</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        <div className="grid gap-4">
          {watchlist.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              <p>Your watchlist is empty. Add some assets to get started!</p>
            </div>
          ) : (
            watchlist.map((item) => (
              <div
                key={item.assetId}
                className="bg-gray-800 rounded-lg p-6 flex items-center justify-between hover:bg-gray-750 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-semibold">{item.assetName}</h3>
                  <p className="text-sm text-gray-400">
                    {item.assetType.toUpperCase()} • {item.assetId}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {item.currentPrice && (
                    <div className="text-right">
                      <p className="text-xl font-bold">${item.currentPrice.toLocaleString()}</p>
                      {item.change24h !== undefined && (
                        <p
                          className={`text-sm ${
                            item.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {item.change24h >= 0 ? '+' : ''}
                          {item.change24h.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(item.assetId)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
