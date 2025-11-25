import { MarketsService } from '../services/markets.service.js';
import { logger } from '../config/logger.js';

/**
 * Fetch and update market data from external APIs
 * Runs every minute for real-time price updates
 */
export async function fetchMarketDataJob(): Promise<void> {
  try {
    logger.debug('Running market data sync job');
    await MarketsService.updatePrices();
  } catch (error) {
    logger.error('Market data sync job failed:', error);
  }
}
