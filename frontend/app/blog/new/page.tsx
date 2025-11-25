'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/authContext';

export default function NewBlogPostPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Market Analysis',
    'Trading Strategies',
    'Technical Analysis',
    'Fundamental Analysis',
    'Risk Management',
    'Cryptocurrency',
    'Forex',
    'Stocks',
    'Options',
    'Commodities',
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !excerpt.trim() || !content.trim() || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blog/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          featured_image: featuredImage || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create blog post');
      }

      const data = await res.json();
      router.push(`/blog/${data.post.slug || data.post.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create blog post');
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
        <Link href="/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-100">Write New Article</h1>
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
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
              Article Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling title for your article"
              required
              maxLength={255}
            />
            <p className="text-xs text-zinc-500 mt-1">{title.length}/255 characters</p>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-zinc-300 mb-2">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief summary of your article (2-3 sentences)"
              required
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
            <p className="text-xs text-zinc-500 mt-1">{excerpt.length}/500 characters</p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-zinc-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-zinc-300 mb-2">
              Tags
            </label>
            <Input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="trading, forex, technical-analysis (comma separated)"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Separate tags with commas to help readers find your content
            </p>
          </div>

          <div>
            <label htmlFor="featured-image" className="block text-sm font-medium text-zinc-300 mb-2">
              Featured Image URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                id="featured-image"
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Add a featured image to make your article more engaging
            </p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-zinc-300 mb-2">
              Article Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here... Support for markdown formatting"
              required
              rows={20}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Write your full article. You can use markdown formatting.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
            <Link href="/blog">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Article
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Writing Guidelines */}
      <Card className="bg-zinc-800/50">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Writing Guidelines</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Write clear, informative titles that accurately describe your content</li>
          <li>• Provide value through actionable insights and analysis</li>
          <li>• Back up claims with data, charts, or reliable sources</li>
          <li>• Use proper formatting for better readability</li>
          <li>• Be respectful and professional in your writing</li>
          <li>• Avoid pump-and-dump schemes or misleading information</li>
          <li>• Disclose any conflicts of interest or sponsored content</li>
        </ul>
      </Card>
    </div>
  );
}
