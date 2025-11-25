import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'high' | 'medium' | 'low';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantStyles = {
    default: 'bg-zinc-800 text-zinc-300',
    primary: 'bg-blue-900/50 text-blue-300 border border-blue-800',
    success: 'bg-emerald-900/50 text-emerald-300 border border-emerald-800',
    danger: 'bg-red-900/50 text-red-300 border border-red-800',
    warning: 'bg-amber-900/50 text-amber-300 border border-amber-800',
    info: 'bg-blue-900/50 text-blue-300 border border-blue-800',
    high: 'bg-red-900/50 text-red-300 border border-red-800',
    medium: 'bg-amber-900/50 text-amber-300 border border-amber-800',
    low: 'bg-emerald-900/50 text-emerald-300 border border-emerald-800',
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
