import { EventsService } from '../services/events.service.js';
import { logger } from '../config/logger.js';
/**
 * Fetch and sync economic events from external APIs
 * Runs every 6 hours to keep calendar up to date
 */
export async function fetchEconomicEventsJob() {
    try {
        logger.debug('Running economic events sync job');
        await EventsService.syncEvents();
    }
    catch (error) {
        logger.error('Economic events sync job failed:', error);
    }
}
//# sourceMappingURL=fetchEconomicEvents.job.js.map