'use client';

import Link from 'next/link';
import { TrendingUp, Calendar, Newspaper, Bell, Star, Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-2xl" />
        <Card className="relative" gradient>
          <div className="py-16 text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Real-Time Market Intelligence
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Professional trading platform with live market data, economic insights, and advanced analytics
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/markets">
                <Button variant="primary" size="lg">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Explore Markets
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="secondary" size="lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Markets Tracked</p>
              <p className="text-3xl font-bold text-zinc-100">250+</p>
            </div>
            <Activity className="w-12 h-12 text-primary opacity-50" />
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Economic Events</p>
              <p className="text-3xl font-bold text-zinc-100">1.5K+</p>
            </div>
            <Calendar className="w-12 h-12 text-success opacity-50" />
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">News Sources</p>
              <p className="text-3xl font-bold text-zinc-100">50+</p>
            </div>
            <Newspaper className="w-12 h-12 text-warning opacity-50" />
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Real-Time Updates</p>
              <p className="text-3xl font-bold text-zinc-100">24/7</p>
            </div>
            <Bell className="w-12 h-12 text-danger opacity-50" />
          </div>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card hover className="card-gradient-border">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-zinc-100">Live Markets</h3>
            <p className="text-zinc-400 mb-4">
              Monitor forex, crypto, commodities, and indices with real-time pricing and advanced charts.
            </p>
            <Link href="/markets">
              <Button variant="ghost" size="sm">View Markets →</Button>
            </Link>
          </div>
        </Card>

        <Card hover className="card-gradient-border">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-zinc-100">Economic Calendar</h3>
            <p className="text-zinc-400 mb-4">
              Track upcoming economic events and their market impact with detailed forecasts and analysis.
            </p>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">View Calendar →</Button>
            </Link>
          </div>
        </Card>

        <Card hover className="card-gradient-border">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-4">
              <Newspaper className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-zinc-100">Financial News</h3>
            <p className="text-zinc-400 mb-4">
              Stay informed with aggregated news from leading financial sources and real-time updates.
            </p>
            <Link href="/news">
              <Button variant="ghost" size="sm">Read News →</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="mt-12" gradient>
        <div className="py-12 text-center">
          <Star className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-zinc-100">Start Trading Smarter Today</h2>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            Create custom watchlists, set price alerts, and get real-time notifications for market-moving events.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}


