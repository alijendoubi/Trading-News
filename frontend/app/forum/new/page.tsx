'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/authContext';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewThreadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCategories();
  }, [isAuthenticated, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          category_id: parseInt(categoryId),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create thread');
      }

      const data = await res.json();
      router.push(`/forum/${data.thread.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create thread');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-100">Create New Thread</h1>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger/10 border border-danger/50 rounded-lg p-4 text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-zinc-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
              Thread Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your thread about?"
              required
              maxLength={255}
            />
            <p className="text-xs text-zinc-500 mt-1">{title.length}/255 characters</p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-zinc-300 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              required
              rows={12}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Be descriptive and provide as much detail as possible
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Link href="/forum">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Thread
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Guidelines */}
      <Card className="bg-zinc-800/50">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Community Guidelines</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Be respectful and professional in all discussions</li>
          <li>• Stay on topic and choose the appropriate category</li>
          <li>• Provide clear titles that describe your thread</li>
          <li>• Search for existing threads before creating duplicates</li>
          <li>• No spam, promotional content, or offensive language</li>
        </ul>
      </Card>
    </div>
  );
}
