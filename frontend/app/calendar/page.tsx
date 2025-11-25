'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar as CalendarIcon, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  impact: string;
  country: string;
  forecast?: number;
  actual?: number;
  previous?: number;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/api/events');
        setEvents(response.data.data?.data || response.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.country.toLowerCase().includes(search.toLowerCase());
    const matchesImpact = filter === 'all' || event.impact === filter;
    return matchesSearch && matchesImpact;
  });

  const getImpactVariant = (impact: string): 'high' | 'medium' | 'low' => {
    switch(impact.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'low';
    }
  };
  
  const renderComparisonIcon = (forecast?: number, previous?: number) => {
    if (!forecast || !previous) return <Minus className="w-4 h-4 text-zinc-500" />;
    if (forecast > previous) return <TrendingUp className="w-4 h-4 text-success" />;
    if (forecast < previous) return <TrendingDown className="w-4 h-4 text-danger" />;
    return <Minus className="w-4 h-4 text-zinc-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-100 flex items-center gap-3">
          <CalendarIcon className="w-10 h-10 text-primary" />
          Economic Calendar
        </h1>
        <p className="text-zinc-400 mt-2">Track high-impact economic events and market-moving data</p>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search events or countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Impact</option>
            <option value="High">High Impact</option>
            <option value="Medium">Medium Impact</option>
            <option value="Low">Low Impact</option>
          </select>
        </div>
      </Card>

      {/* Events Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card hover>
          <div className="text-sm text-zinc-400 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-zinc-100">{events.length}</div>
        </Card>
        <Card hover>
          <div className="text-sm text-zinc-400 mb-1">High Impact</div>
          <div className="text-2xl font-bold text-danger">
            {events.filter(e => e.impact === 'High').length}
          </div>
        </Card>
        <Card hover>
          <div className="text-sm text-zinc-400 mb-1">This Week</div>
          <div className="text-2xl font-bold text-primary">
            {filteredEvents.length}
          </div>
        </Card>
      </div>

      {/* Events Table */}
      {filteredEvents.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Impact</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Forecast</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Previous</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-100">
                        {format(new Date(event.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {format(new Date(event.date), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-zinc-100 max-w-xs">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-zinc-300">{event.country}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getImpactVariant(event.impact)}>
                        {event.impact}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-mono text-zinc-300">
                        {event.forecast ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-mono text-zinc-300">
                        {event.previous ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {renderComparisonIcon(event.forecast, event.previous)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12 text-zinc-400">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No events found matching your criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
}
