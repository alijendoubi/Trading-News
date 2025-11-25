-- Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Threads
CREATE TABLE IF NOT EXISTS forum_threads (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Posts (replies to threads)
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thread Likes
CREATE TABLE IF NOT EXISTS forum_thread_likes (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(thread_id, user_id)
);

-- Post Likes
CREATE TABLE IF NOT EXISTS forum_post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Insert default forum categories
INSERT INTO forum_categories (name, description, slug, icon) VALUES
  ('General Trading', 'General discussions about trading strategies and market analysis', 'general-trading', 'MessageSquare'),
  ('Forex', 'Foreign exchange market discussions', 'forex', 'DollarSign'),
  ('Cryptocurrency', 'Crypto trading and blockchain technology', 'cryptocurrency', 'Bitcoin'),
  ('Stocks & ETFs', 'Stock market and exchange-traded funds', 'stocks-etfs', 'TrendingUp'),
  ('Technical Analysis', 'Chart patterns, indicators, and TA strategies', 'technical-analysis', 'BarChart'),
  ('Trading Psychology', 'Mental aspects of trading and risk management', 'trading-psychology', 'Brain'),
  ('Brokers & Platforms', 'Reviews and discussions about trading platforms', 'brokers-platforms', 'Building')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user ON forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
