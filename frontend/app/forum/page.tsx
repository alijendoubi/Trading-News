'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, TrendingUp, Eye, ThumbsUp, Plus, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  thread_count: number;
  post_count: number;
}

interface Thread {
  id: number;
  title: string;
  slug: string;
  content: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  reply_count: number;
  like_count: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchCategories();
    fetchThreads();
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('sort', sortBy);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/threads?${params}`);
      const data = await res.json();
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">Trading Forum</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-1">Discuss strategies, share insights, and learn from fellow traders</p>
        </div>
        <Link href="/forum/new" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="sm:inline">New Thread</span>
          </Button>
        </Link>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card
          hover
          className={`cursor-pointer ${!selectedCategory ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-zinc-100">All</div>
              <div className="text-xs sm:text-sm text-zinc-500 mt-1">All Categories</div>
            </div>
        </Card>
        
        {categories.map((cat) => (
          <Card
            key={cat.id}
            hover
            className={`cursor-pointer ${selectedCategory === cat.slug ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedCategory(cat.slug)}
          >
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-sm sm:text-base font-semibold text-zinc-100">{cat.name}</h3>
              </div>
              <p className="text-xs text-zinc-500">{cat.thread_count} threads</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === 'latest' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSortBy('latest')}
        >
          Latest
        </Button>
        <Button
          variant={sortBy === 'popular' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSortBy('popular')}
        >
          Popular
        </Button>
        <Button
          variant={sortBy === 'views' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSortBy('views')}
        >
          Most Viewed
        </Button>
      </div>

      {/* Threads List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Card key={thread.id} hover>
              <Link href={`/forum/${thread.id}`}>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        {thread.is_pinned && (
                          <Badge variant="warning" className="text-xs">Pinned</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{thread.category_name}</Badge>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-100 hover:text-primary transition-colors">
                        {thread.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 line-clamp-2">{thread.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-zinc-500">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                      <span>by {thread.author_name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDate(thread.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{thread.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{thread.reply_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{thread.like_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
          
          {threads.length === 0 && (
            <Card>
              <div className="text-center py-12 text-zinc-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No threads found in this category</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
