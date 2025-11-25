import { logger } from '../config/logger.js';
/**
 * Initialize and start all cron jobs
 * Note: Cron jobs are disabled when running without database
 */
export function startCronJobs() {
    logger.info('Cron jobs disabled - running in API-only mode without database');
    logger.info('All data is fetched in real-time from external APIs');
}
//# sourceMappingURL=scheduler.js.map