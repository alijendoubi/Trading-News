'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChangeProps {
  value: number;
  showIcon?: boolean;
  showSign?: boolean;
  className?: string;
}

export const PriceChange: React.FC<PriceChangeProps> = ({
  value,
  showIcon = false,
  showSign = true,
  className = '',
}) => {
  const isPositive = value >= 0;
  const color = isPositive ? 'text-success-light' : 'text-danger-light';
  const sign = showSign ? (isPositive ? '+' : '') : '';
  
  return (
    <div className={`flex items-center gap-1 ${color} ${className}`}>
      {showIcon && (
        isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )
      )}
      <span className="font-semibold">
        {sign}{value.toFixed(2)}%
      </span>
    </div>
  );
};
