'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Star, TrendingUp, Shield, DollarSign, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Broker {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  regulation: string;
  min_deposit: number;
  max_leverage: string;
  spreads_from: number;
  platforms: string[];
  instruments: string[];
  founded_year: number;
  headquarters: string;
  avg_rating: number;
  review_count: number;
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers`);
      const data = await res.json();
      setBrokers(data.brokers || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? 'text-warning fill-warning' : 'text-zinc-700'}`}
      />
    ));
  };

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div>
        <h1 className=\"text-3xl font-bold text-zinc-100\">Forex & CFD Brokers</h1>
        <p className=\"text-zinc-400 mt-1\">Compare top-rated brokers and read trader reviews</p>
      </div>

      {/* Brokers List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className=\"space-y-4\">
          {brokers.map((broker) => (
            <Card key={broker.id} hover>
              <Link href={`/brokers/${broker.slug}`}>
                <div className=\"flex gap-6\">
                  {/* Logo */}
                  <div className=\"flex-shrink-0 w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center\">
                    {broker.logo_url ? (
                      <img src={broker.logo_url} alt={broker.name} className=\"w-16 h-16 object-contain\" />
                    ) : (
                      <Building2 className=\"w-8 h-8 text-zinc-600\" />
                    )}
                  </div>

                  {/* Content */}
                  <div className=\"flex-1 space-y-3\">
                    <div className=\"flex items-start justify-between\">
                      <div>
                        <h3 className=\"text-xl font-bold text-zinc-100 hover:text-primary transition-colors\">
                          {broker.name}
                        </h3>
                        <p className=\"text-sm text-zinc-500 mt-1\">{broker.headquarters}</p>
                      </div>
                      
                      <div className=\"text-right\">
                        <div className=\"flex items-center gap-2\">
                          {renderStars(parseFloat(broker.avg_rating.toString()))}
                          <span className=\"text-lg font-bold text-zinc-100\">
                            {parseFloat(broker.avg_rating.toString()).toFixed(1)}
                          </span>
                        </div>
                        <p className=\"text-xs text-zinc-500 mt-1\">{broker.review_count} reviews</p>
                      </div>
                    </div>

                    <p className=\"text-sm text-zinc-400 line-clamp-2\">{broker.description}</p>

                    {/* Key Stats */}
                    <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
                      <div>
                        <p className=\"text-xs text-zinc-500\">Min Deposit</p>
                        <p className=\"text-sm font-semibold text-zinc-100\">${broker.min_deposit}</p>
                      </div>
                      <div>
                        <p className=\"text-xs text-zinc-500\">Max Leverage</p>
                        <p className=\"text-sm font-semibold text-zinc-100\">{broker.max_leverage}</p>
                      </div>
                      <div>
                        <p className=\"text-xs text-zinc-500\">Spreads From</p>
                        <p className=\"text-sm font-semibold text-zinc-100\">{broker.spreads_from} pips</p>
                      </div>
                      <div>
                        <p className=\"text-xs text-zinc-500\">Regulation</p>
                        <p className=\"text-sm font-semibold text-zinc-100 line-clamp-1\">{broker.regulation}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className=\"flex flex-wrap gap-2\">
                      {broker.platforms?.slice(0, 3).map((platform, idx) => (
                        <Badge key={idx} variant=\"secondary\" className=\"text-xs\">
                          {platform}
                        </Badge>
                      ))}
                      {broker.instruments?.slice(0, 3).map((instrument, idx) => (
                        <Badge key={idx} variant=\"primary\" className=\"text-xs\">
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
