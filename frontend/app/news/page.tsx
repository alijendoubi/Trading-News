'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  summary?: string;
  imageUrl?: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await apiClient.get('/api/news');
        setArticles(response.data.data?.data || response.data.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
                         article.source.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'all' || article.category === filter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(articles.map(a => a.category))];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">📰 Financial News</h1>
      
      <div className="mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search news..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading news...</p>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <article key={article.id} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500">
              <div className="flex gap-4">
                {article.imageUrl && (
                  <img src={article.imageUrl} alt={article.title} className="w-24 h-24 rounded object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-bold text-lg leading-tight flex-1 line-clamp-2">{article.title}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded whitespace-nowrap flex-shrink-0">
                      {article.category}
                    </span>
                  </div>
                  {article.summary && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-medium">{article.source}</span>
                      <span>•</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No news found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
