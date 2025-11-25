import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#09090b',   // zinc-950
          secondary: '#18181b', // zinc-900
          tertiary: '#27272a',  // zinc-800
        },
        primary: {
          DEFAULT: '#3b82f6',   // blue-500
          hover: '#2563eb',     // blue-600
          light: '#60a5fa',     // blue-400
        },
        success: {
          DEFAULT: '#10b981',   // emerald-500
          light: '#34d399',     // emerald-400
          dark: '#059669',      // emerald-600
        },
        danger: {
          DEFAULT: '#ef4444',   // red-500
          light: '#f87171',     // red-400
          dark: '#dc2626',      // red-600
        },
        warning: {
          DEFAULT: '#f59e0b',   // amber-500
          light: '#fbbf24',     // amber-400
        },
        positive: '#22c55e',    // green-500
        negative: '#ef4444',    // red-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'price-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'price-md': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'price-lg': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
      },
      animation: {
        'price-up': 'flashGreen 0.5s ease-in-out',
        'price-down': 'flashRed 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        flashGreen: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
        },
        flashRed: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
