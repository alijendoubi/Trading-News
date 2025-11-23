'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

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

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">📅 Economic Calendar</h1>
      
      <div className="mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search events or countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Impact</option>
          <option value="High">High Impact</option>
          <option value="Medium">Medium Impact</option>
          <option value="Low">Low Impact</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading economic events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Date & Time</th>
                <th className="px-6 py-3 text-left font-semibold">Event</th>
                <th className="px-6 py-3 text-left font-semibold">Country</th>
                <th className="px-6 py-3 text-left font-semibold">Impact</th>
                <th className="px-6 py-3 text-left font-semibold">Forecast</th>
                <th className="px-6 py-3 text-left font-semibold">Previous</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm">
                    {new Date(event.date).toLocaleDateString()} <br/>
                    <span className="text-gray-500 text-xs">{new Date(event.date).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-3 font-medium">{event.title}</td>
                  <td className="px-6 py-3">{event.country}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(event.impact)}`}>
                      {event.impact}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">{event.forecast ?? 'N/A'}</td>
                  <td className="px-6 py-3 text-sm">{event.previous ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
