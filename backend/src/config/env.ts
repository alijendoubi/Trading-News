import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from parent directory (project root)
dotenv.config({ path: path.join(process.cwd(), '..', '.env.local') });

export const env = {
  // Application
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  api_base_url: process.env.API_BASE_URL || 'http://localhost:5000',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiry: process.env.JWT_EXPIRY || '7d',
  },

  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    databaseUrl: process.env.FIREBASE_DATABASE_URL || '',
  },

  // External APIs
  apis: {
    economic: {
      key: process.env.ECONOMIC_API_KEY || '',
      url: process.env.ECONOMIC_API_URL || '',
    },
    marketData: {
      key: process.env.MARKET_DATA_API_KEY || '',
      url: process.env.MARKET_DATA_API_URL || '',
    },
    news: {
      key: process.env.NEWS_API_KEY || '',
      url: process.env.NEWS_API_URL || '',
    },
    // New API keys
    twelveData: process.env.TWELVE_DATA_API_KEY || '',
    finnhub: process.env.FINNHUB_API_KEY || '',
    polygon: process.env.POLYGON_API_KEY || '',
    alphaVantage: process.env.ALPHA_VANTAGE_API_KEY || '',
    currents: process.env.CURRENTS_API_KEY || '',
    gnews: process.env.GNEWS_API_KEY || '',
    cryptoPanic: process.env.CRYPTOPANIC_API_KEY || '',
    fred: process.env.FRED_API_KEY || '',
    cryptocompare: process.env.CRYPTOCOMPARE_API_KEY || '',
  },

  // Logging
  log_level: process.env.LOG_LEVEL || 'debug',

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
