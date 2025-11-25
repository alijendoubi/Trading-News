import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  glass = false,
}) => {
  const baseStyles = 'rounded-lg p-6 border border-zinc-800';
  const bgStyles = glass ? 'glass' : gradient ? 'card-gradient' : 'bg-zinc-900';
  const hoverStyles = hover ? 'hover:border-zinc-700 hover:shadow-lg transition-all duration-300' : '';
  
  return (
    <div className={`${baseStyles} ${bgStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
