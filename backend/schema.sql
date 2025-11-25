-- Trading Intelligence Platform Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Economic events table
CREATE TABLE IF NOT EXISTS economic_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  event_date TIMESTAMP NOT NULL,
  impact VARCHAR(50) NOT NULL,
  country VARCHAR(10) NOT NULL,
  forecast DECIMAL,
  actual DECIMAL,
  previous DECIMAL,
  description TEXT,
  source_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(1000) UNIQUE NOT NULL,
  source VARCHAR(255) NOT NULL,
  published_at TIMESTAMP NOT NULL,
  category VARCHAR(100) NOT NULL,
  summary TEXT,
  image_url VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
  id SERIAL PRIMARY KEY,
  asset_id VARCHAR(100) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  current_price DECIMAL NOT NULL,
  change_24h DECIMAL NOT NULL,
  volume_24h DECIMAL,
  market_cap DECIMAL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(asset_id, asset_type)
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id VARCHAR(100) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, asset_id)
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id VARCHAR(100) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  condition VARCHAR(10) NOT NULL CHECK (condition IN ('above', 'below')),
  target_price DECIMAL NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date);
CREATE INDEX IF NOT EXISTS idx_economic_events_country ON economic_events(country);
CREATE INDEX IF NOT EXISTS idx_economic_events_impact ON economic_events(impact);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON price_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_market_data_type ON market_data(asset_type);

-- Insert some sample data
INSERT INTO users (email, password_hash, name) VALUES 
  ('demo@example.com', '$2b$10$dummy.hash.for.demo.user.only', 'Demo User')
ON CONFLICT (email) DO NOTHING;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alijendoubi;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO alijendoubi;
