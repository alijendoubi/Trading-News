-- Brokers
CREATE TABLE IF NOT EXISTS brokers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  website VARCHAR(500),
  description TEXT,
  regulation VARCHAR(500), -- Regulatory bodies (e.g., FCA, ASIC, CySEC)
  min_deposit DECIMAL(12, 2),
  max_leverage VARCHAR(50),
  spreads_from DECIMAL(5, 2),
  platforms TEXT[], -- Trading platforms (MT4, MT5, cTrader, etc.)
  account_types TEXT[], -- Account types available
  instruments TEXT[], -- Forex, Stocks, Crypto, etc.
  payment_methods TEXT[],
  support_languages TEXT[],
  demo_account BOOLEAN DEFAULT TRUE,
  mobile_trading BOOLEAN DEFAULT TRUE,
  founded_year INTEGER,
  headquarters VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Broker Reviews
CREATE TABLE IF NOT EXISTS broker_reviews (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER REFERENCES brokers(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  verified BOOLEAN DEFAULT FALSE, -- Mark verified traders
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(broker_id, user_id) -- One review per user per broker
);

-- Broker Rating Categories
CREATE TABLE IF NOT EXISTS broker_rating_categories (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES broker_reviews(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- e.g., 'platform', 'customer_service', 'fees', 'execution'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Review Helpful Votes
CREATE TABLE IF NOT EXISTS broker_review_helpful (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES broker_reviews(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

-- Insert sample brokers
INSERT INTO brokers (name, slug, description, regulation, min_deposit, max_leverage, spreads_from, platforms, account_types, instruments, founded_year, headquarters) VALUES
  (
    'IC Markets',
    'ic-markets',
    'Leading forex and CFD broker with tight spreads and excellent execution',
    'ASIC, CySEC, FSA',
    200.00,
    '1:500',
    0.0,
    ARRAY['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
    ARRAY['Standard', 'Raw Spread', 'cTrader'],
    ARRAY['Forex', 'Indices', 'Commodities', 'Crypto', 'Stocks'],
    2007,
    'Sydney, Australia'
  ),
  (
    'Pepperstone',
    'pepperstone',
    'Award-winning broker with competitive pricing and advanced tools',
    'FCA, ASIC, CySEC, DFSA',
    200.00,
    '1:500',
    0.6,
    ARRAY['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'],
    ARRAY['Standard', 'Razor', 'Swap Free'],
    ARRAY['Forex', 'Indices', 'Commodities', 'Crypto', 'Shares'],
    2010,
    'Melbourne, Australia'
  ),
  (
    'XM Group',
    'xm-group',
    'Global broker serving over 5 million clients worldwide',
    'ASIC, CySEC, IFSC',
    5.00,
    '1:888',
    0.6,
    ARRAY['MetaTrader 4', 'MetaTrader 5'],
    ARRAY['Micro', 'Standard', 'XM Zero'],
    ARRAY['Forex', 'Indices', 'Commodities', 'Crypto', 'Stocks', 'Energies'],
    2009,
    'Limassol, Cyprus'
  )
ON CONFLICT (slug) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_brokers_slug ON brokers(slug);
CREATE INDEX IF NOT EXISTS idx_broker_reviews_broker ON broker_reviews(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_reviews_user ON broker_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_rating_categories_review ON broker_rating_categories(review_id);
