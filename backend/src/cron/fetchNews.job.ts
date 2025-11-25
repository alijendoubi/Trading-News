import { NewsService } from '../services/news.service.js';
import { logger } from '../config/logger.js';

/**
 * Fetch and sync news articles from external sources
 * Runs every 30 minutes to keep news feed fresh
 */
export async function fetchNewsJob(): Promise<void> {
  try {
    logger.debug('Running news sync job');
    await NewsService.syncNews();
  } catch (error) {
    logger.error('News sync job failed:', error);
  }
}
