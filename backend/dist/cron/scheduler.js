import cron from 'node-cron';
import { fetchMarketDataJob } from './fetchMarketData.job.js';
import { fetchEconomicEventsJob } from './fetchEconomicEvents.job.js';
import { fetchNewsJob } from './fetchNews.job.js';
import { AlertsService } from '../services/alerts.service.js';
import { logger } from '../config/logger.js';
/**
 * Initialize and start all cron jobs
 */
export function startCronJobs() {
    logger.info('Starting cron jobs');
    // Market data - every minute
    cron.schedule('* * * * *', async () => {
        await fetchMarketDataJob();
    });
    logger.info('Market data job scheduled (every minute)');
    // Economic events - every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        await fetchEconomicEventsJob();
    });
    logger.info('Economic events job scheduled (every 6 hours)');
    // News - every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        await fetchNewsJob();
    });
    logger.info('News job scheduled (every 30 minutes)');
    // Price alerts - every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        await AlertsService.checkPriceAlerts();
    });
    logger.info('Price alerts check scheduled (every 5 minutes)');
    // Run initial sync on startup
    logger.info('Running initial data sync');
    setTimeout(async () => {
        await fetchMarketDataJob();
        await fetchEconomicEventsJob();
        await fetchNewsJob();
    }, 5000); // Wait 5 seconds after server start
}
//# sourceMappingURL=scheduler.js.map