import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
async function seed() {
    const client = await pool.connect();
    try {
        // Insert sample assets
        await client.query(`
      INSERT INTO market_assets (symbol, type, name, last_price, change, change_amount)
      VALUES 
        ('EURUSD', 'forex', 'Euro/US Dollar', 1.0850, 0.25, 0.0027),
        ('GBPUSD', 'forex', 'British Pound/US Dollar', 1.2650, -0.15, -0.0019),
        ('BTC', 'crypto', 'Bitcoin', 45230.50, 2.30, 1020.00),
        ('ETH', 'crypto', 'Ethereum', 2380.40, 1.80, 42.15),
        ('GOLD', 'commodity', 'Gold Spot', 1980.50, 0.85, 16.75),
        ('SPX', 'index', 'S&P 500', 4750.25, 1.20, 56.50),
        ('DAX', 'index', 'DAX', 17850.30, 0.95, 170.25)
      ON CONFLICT (symbol) DO NOTHING;
    `);
        // Insert sample events
        await client.query(`
      INSERT INTO economic_events (title, event_date, impact, country, forecast, actual, previous)
      VALUES 
        ('Federal Reserve Interest Rate Decision', NOW() + INTERVAL '7 days', 'High', 'US', 5.50, NULL, 5.25),
        ('Eurozone Inflation Rate', NOW() + INTERVAL '5 days', 'High', 'EU', 2.40, NULL, 2.60),
        ('UK Retail Sales', NOW() + INTERVAL '3 days', 'Medium', 'GB', 0.5, NULL, 0.8),
        ('Japan GDP', NOW() + INTERVAL '10 days', 'High', 'JP', 1.2, NULL, 0.9)
      ON CONFLICT DO NOTHING;
    `);
        // Insert sample news
        await client.query(`
      INSERT INTO news_articles (title, url, source, published_at, category, summary)
      VALUES 
        ('Federal Reserve Signals Pause on Rate Hikes', 'https://example.com/fed-pause', 'Reuters', NOW() - INTERVAL '2 hours', 'Forex', 'Fed officials suggest a pause in interest rate increases'),
        ('Bitcoin Surges Past $45,000 Resistance', 'https://example.com/bitcoin-rally', 'CoinTelegraph', NOW() - INTERVAL '1 hour', 'Crypto', 'Major cryptocurrency breaks through key technical level'),
        ('Gold Prices Climb on Economic Uncertainty', 'https://example.com/gold-climb', 'Bloomberg', NOW() - INTERVAL '30 minutes', 'Commodity', 'Safe haven asset benefits from geopolitical tensions')
      ON CONFLICT DO NOTHING;
    `);
        logger.info('Database seed completed successfully');
    }
    catch (error) {
        logger.error('Error seeding database', { error });
        throw error;
    }
    finally {
        client.release();
        await pool.end();
    }
}
seed();
//# sourceMappingURL=seed.js.map