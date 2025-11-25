'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { apiClient } from '@/lib/apiClient';

interface Alert {
  id: string;
  assetId: string;
  assetType: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    assetType: 'crypto',
    condition: 'above' as 'above' | 'below',
    targetPrice: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.get('/api/alerts');
      setAlerts(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/api/alerts', {
        ...formData,
        targetPrice: parseFloat(formData.targetPrice),
      });
      setFormData({ assetId: '', assetType: 'crypto', condition: 'above', targetPrice: '' });
      setShowForm(false);
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create alert');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await apiClient.put(`/api/alerts/${id}`, { isActive: !isActive });
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update alert');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/alerts/${id}`);
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete alert');
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
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Price Alerts</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            {showForm ? 'Cancel' : 'Create Alert'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Create New Alert</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Asset ID</label>
                  <input
                    type="text"
                    placeholder="e.g., bitcoin, AAPL"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Asset Type</label>
                  <select
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="stock">Stock</option>
                    <option value="forex">Forex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value as 'above' | 'below' })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="above">Price goes above</option>
                    <option value="below">Price goes below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Target Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Create Alert
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {alerts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              <p>No alerts configured. Create one to get notified of price changes!</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gray-800 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold">{alert.assetId}</h3>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {alert.assetType.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        alert.isActive
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-400">
                    Alert when price goes {alert.condition} ${alert.targetPrice.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleToggle(alert.id, alert.isActive)}
                    className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      alert.isActive
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {alert.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                  >
                    Delete
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
