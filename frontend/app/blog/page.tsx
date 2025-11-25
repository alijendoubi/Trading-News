'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Calendar, User, Eye, Heart, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: string;
  tags: string[];
  author_name: string;
  views: number;
  comment_count: number;
  like_count: number;
  published_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/posts`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Trading Blog</h1>
          <p className="text-zinc-400 mt-1">Insights, analysis, and trading education</p>
        </div>
        <Link href="/blog/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Write Article
          </Button>
        </Link>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} hover className="overflow-hidden">
              <Link href={`/blog/${post.slug}`}>
                <div className="space-y-4">
                  {post.featured_image && (
                    <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {post.category && (
                      <Badge variant="primary">{post.category}</Badge>
                    )}
                    
                    <h3 className="text-xl font-semibold text-zinc-100 line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-zinc-400 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{post.author_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{post.comment_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.like_count}</span>
                      </div>
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
