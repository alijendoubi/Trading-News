import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Application
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  api_base_url: process.env.API_BASE_URL || 'http://localhost:5000',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'trading_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiry: process.env.JWT_EXPIRY || '7d',
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
  },

  // Logging
  log_level: process.env.LOG_LEVEL || 'debug',

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
