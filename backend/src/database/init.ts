import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';

/**
 * Initialize database schema
 */
export async function initializeSchema(): Promise<void> {
  const client = await pool.connect();

  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        preferences JSONB DEFAULT '{"theme":"light","notifications":true,"defaultCurrency":"USD"}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Economic events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS economic_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        event_date TIMESTAMP NOT NULL,
        impact VARCHAR(50) NOT NULL DEFAULT 'Medium',
        country VARCHAR(10) NOT NULL,
        forecast DECIMAL(10,5),
        actual DECIMAL(10,5),
        previous DECIMAL(10,5),
        description TEXT,
        source_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Market assets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_assets (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        last_price DECIMAL(18,8) NOT NULL,
        change DECIMAL(10,4) NOT NULL DEFAULT 0,
        change_amount DECIMAL(18,8) NOT NULL DEFAULT 0,
        high_24h DECIMAL(18,8),
        low_24h DECIMAL(18,8),
        volume DECIMAL(20,8),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // News articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        url VARCHAR(2000) NOT NULL,
        source VARCHAR(255) NOT NULL,
        published_at TIMESTAMP NOT NULL,
        category VARCHAR(100),
        summary TEXT,
        image_url VARCHAR(2000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User watchlists table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_watchlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        asset_id INTEGER NOT NULL REFERENCES market_assets(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, asset_id)
      );
    `);

    // User alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        settings JSONB NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_events_date ON economic_events(event_date);
      CREATE INDEX IF NOT EXISTS idx_events_country ON economic_events(country);
      CREATE INDEX IF NOT EXISTS idx_assets_symbol ON market_assets(symbol);
      CREATE INDEX IF NOT EXISTS idx_assets_type ON market_assets(type);
      CREATE INDEX IF NOT EXISTS idx_news_date ON news_articles(published_at);
      CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
      CREATE INDEX IF NOT EXISTS idx_watchlists_user ON user_watchlists(user_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_user ON user_alerts(user_id);
    `);

    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error('Error initializing database schema', { error });
    throw error;
  } finally {
    client.release();
  }
}
