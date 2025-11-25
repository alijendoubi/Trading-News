'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Newspaper, Search, ExternalLink, Clock } from 'lucide-react';

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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-100 flex items-center gap-2 sm:gap-3">
          <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          Financial News
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-1 sm:mt-2">Latest market news and analysis from top sources</p>
      </div>
      
      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-full sm:min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* News Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Total Articles</div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100">{articles.length}</div>
        </Card>
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Categories</div>
          <div className="text-xl sm:text-2xl font-bold text-primary">{categories.length - 1}</div>
        </Card>
        <Card hover>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1">Latest Update</div>
          <div className="text-xl sm:text-2xl font-bold text-success">
            {articles.length > 0 ? formatDate(articles[0].publishedAt) : 'N/A'}
          </div>
        </Card>
      </div>

      {/* News Articles */}
      {filteredArticles.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filteredArticles.map((article) => (
            <Card key={article.id} hover className="overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {article.imageUrl && (
                  <div className="w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2 sm:gap-4">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-zinc-100 leading-tight flex-1">
                      {article.title}
                    </h3>
                    <Badge variant="info" className="text-xs">{article.category}</Badge>
                  </div>
                  {article.summary && (
                    <p className="text-xs sm:text-sm text-zinc-400 mb-3 sm:mb-4 line-clamp-2">{article.summary}</p>
                  )}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-500">
                      <span className="font-semibold text-zinc-300">{article.source}</span>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-primary hover:text-primary-light text-xs sm:text-sm font-semibold transition-colors"
                    >
                      Read More
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12 text-zinc-400">
            <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No news found matching your criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
}
