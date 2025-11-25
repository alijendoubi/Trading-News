import { Router } from 'express';
import { HttpResponse } from '../utils/http-response.js';
import { aggregatedDataService } from '../services/aggregatedData.service.js';
import { fredClient } from '../integrations/fred.client.js';
import { worldBankClient } from '../integrations/worldBank.client.js';
import { logger } from '../config/logger.js';
const router = Router();
// Get economic indicators (US and global)
router.get('/', async (req, res) => {
    try {
        const country = req.query.country || 'USA';
        const indicators = await aggregatedDataService.getEconomicIndicators(country);
        HttpResponse.success(res, indicators);
    }
    catch (error) {
        logger.error('Error fetching economic indicators:', error);
        HttpResponse.error(res, 'Failed to fetch economic indicators', 500);
    }
});
// Get FRED economic data (US only)
router.get('/fred/:seriesId', async (req, res) => {
    try {
        const { seriesId } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const observations = await fredClient.getObservations(seriesId, undefined, undefined, limit);
        HttpResponse.success(res, observations);
    }
    catch (error) {
        logger.error('Error fetching FRED data:', error);
        HttpResponse.error(res, 'Failed to fetch FRED data', 500);
    }
});
// Get World Bank data for a country
router.get('/worldbank/:country/:indicator', async (req, res) => {
    try {
        const { country, indicator } = req.params;
        const years = parseInt(req.query.years) || 5;
        const currentYear = new Date().getFullYear();
        const data = await worldBankClient.getIndicator(country, indicator, currentYear - years, currentYear);
        HttpResponse.success(res, data);
    }
    catch (error) {
        logger.error('Error fetching World Bank data:', error);
        HttpResponse.error(res, 'Failed to fetch World Bank data', 500);
    }
});
export default router;
//# sourceMappingURL=indicators.routes.js.map