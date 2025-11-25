import { Pool } from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';
import { initializeSchema } from '../database/init.js';

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

export async function queryDb<T>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms): ${text}`);
    }
    return result.rows;
  } catch (error) {
    logger.error('Database query error', { error, query: text });
    throw error;
  }
}

export async function queryDbSingle<T>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<T | null> {
  const results = await queryDb<T>(text, params);
  return results.length > 0 ? results[0] : null;
}

export async function initializeDb(): Promise<void> {
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connection successful', { timestamp: result.rows[0] });
    
    // Initialize database schema (create tables if they don't exist)
    await initializeSchema();
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
}

export async function closeDb(): Promise<void> {
  await pool.end();
  logger.info('Database connection closed');
}
