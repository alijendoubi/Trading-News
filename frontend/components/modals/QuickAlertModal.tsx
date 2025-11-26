'use client';

import { useState } from 'react';
import { X, Bell, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuickAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onSuccess?: () => void;
}

export function QuickAlertModal({ isOpen, onClose, asset, onSuccess }: QuickAlertModalProps) {
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState(asset?.currentPrice?.toString() || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          assetId: asset.id,
          assetType: asset.type,
          assetSymbol: asset.symbol,
          condition: alertType === 'above' ? 'price_above' : 'price_below',
          targetValue: parseFloat(targetPrice),
          isActive: true
        })
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        // Show success toast
        showToast('Alert created successfully!', 'success');
      } else {
        throw new Error('Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      showToast('Failed to create alert', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const percentDiff = targetPrice && asset.currentPrice
    ? (((parseFloat(targetPrice) - asset.currentPrice) / asset.currentPrice) * 100).toFixed(2)
    : '0';

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
          className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Create Price Alert</h2>
                <p className="text-sm text-zinc-500">{asset.symbol}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Price */}
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="text-sm text-zinc-500 mb-1">Current Price</div>
              <div className="text-2xl font-bold font-mono text-zinc-100">
                {asset.currentPrice?.toFixed(asset.type === 'forex' ? 5 : 2)}
              </div>
            </div>

            {/* Alert Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Alert When Price Goes
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAlertType('above')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    alertType === 'above'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
                    alertType === 'above' ? 'text-emerald-500' : 'text-zinc-500'
                  }`} />
                  <div className="text-sm font-medium text-zinc-100">Above</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAlertType('below')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    alertType === 'below'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${
                    alertType === 'below' ? 'text-red-500' : 'text-zinc-500'
                  }`} />
                  <div className="text-sm font-medium text-zinc-100">Below</div>
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Target Price
              </label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {percentDiff !== '0' && (
                <div className={`mt-2 text-sm flex items-center gap-1 ${
                  parseFloat(percentDiff) > 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                  {parseFloat(percentDiff) > 0 ? '+' : ''}{percentDiff}% from current price
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-sm text-blue-400">
                💡 You&apos;ll receive a notification when {asset.symbol} {alertType === 'above' ? 'rises above' : 'falls below'} {targetPrice || '___'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading || !targetPrice}
              >
                {loading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
