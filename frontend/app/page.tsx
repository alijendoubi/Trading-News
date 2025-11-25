'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, Newspaper, Bell, Star, Activity, ArrowRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PriceChange } from '@/components/ui/PriceChange';

export default function Home() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch top 4 markets
      const marketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/markets/assets?limit=4`);
      const marketsData = await marketsRes.json();
      setMarkets(marketsData.assets || []);

      // Fetch upcoming events
      const eventsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events?limit=3`);
      const eventsData = await eventsRes.json();
      setEvents(eventsData.events || []);

      // Fetch latest news
      const newsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?limit=3`);
      const newsData = await newsRes.json();
      setNews(newsData.articles || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Live Market Data */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">Live Markets</h2>
          <Link href="/markets">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {markets.slice(0, 4).map((asset) => (
            <Card key={asset.id} hover>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">{asset.type}</p>
                    <h3 className="font-bold text-zinc-100">{asset.symbol}</h3>
                  </div>
                  <Badge variant={asset.change24h >= 0 ? 'success' : 'danger'}>
                    <PriceChange value={asset.change24h} showIcon />
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">
                    ${asset.currentPrice?.toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-500">24h Vol: ${(asset.volume24h / 1000000).toFixed(2)}M</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Economic Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">Upcoming Events</h2>
          <Link href="/calendar">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {events.slice(0, 3).map((event) => (
            <Card key={event.id} hover>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-zinc-100">{event.title}</h3>
                    <Badge
                      variant={event.impact === 'high' ? 'danger' : event.impact === 'medium' ? 'warning' : 'secondary'}
                    >
                      {event.impact}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span>{event.country}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Latest News */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">Latest News</h2>
          <Link href="/news">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {news.slice(0, 3).map((article) => (
            <Card key={article.id} hover>
              <Link href={article.url} target="_blank" rel="noopener noreferrer">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-100 line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {article.category && (
                    <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                  )}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
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


