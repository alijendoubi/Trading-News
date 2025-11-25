'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  TrendingUp,
  Newspaper,
  Star,
  Bell,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/markets', label: 'Markets', icon: TrendingUp },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/watchlist', label: 'Watchlist', icon: Star, auth: true },
    { href: '/alerts', label: 'Alerts', icon: Bell, auth: true },
  ];
  
  const isActive = (href: string) => pathname === href;
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-zinc-100">TradingHub</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.auth && !isAuthenticated) return null;
          
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${active
                  ? 'bg-primary text-white shadow-glow-blue'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-zinc-800">
        {isAuthenticated ? (
          <div className="space-y-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-danger hover:bg-zinc-800 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span className="font-medium">Login</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
