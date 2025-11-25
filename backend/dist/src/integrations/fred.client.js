import axios from 'axios';
import { logger } from '../config/logger.js';
/**
 * FRED (Federal Reserve Economic Data) API Client
 * Free with API key
 * Provides comprehensive US economic data
 */
export class FREDClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 3600000; // 1 hour cache
        this.apiKey = process.env.FRED_API_KEY || '';
        this.client = axios.create({
            baseURL: 'https://api.stlouisfed.org/fred',
            timeout: 10000,
        });
    }
    /**
     * Get series information
     */
    async getSeries(seriesId) {
        if (!this.apiKey) {
            logger.warn('FRED API key not configured');
            return null;
        }
        const cacheKey = `series:${seriesId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/series', {
                params: {
                    series_id: seriesId,
                    api_key: this.apiKey,
                    file_type: 'json',
                },
            });
            if (!response.data.seriess || response.data.seriess.length === 0) {
                return null;
            }
            const series = response.data.seriess[0];
            const result = {
                id: series.id,
                title: series.title,
                observation_start: new Date(series.observation_start),
                observation_end: new Date(series.observation_end),
                frequency: series.frequency,
                units: series.units,
                seasonal_adjustment: series.seasonal_adjustment,
            };
            this.setCache(cacheKey, result);
            return result;
        }
        catch (error) {
            logger.error(`Error fetching series from FRED for ${seriesId}:`, error.message);
            return null;
        }
    }
    /**
     * Get observations (data points) for a series
     */
    async getObservations(seriesId, startDate, endDate, limit = 100) {
        if (!this.apiKey)
            return [];
        const cacheKey = `observations:${seriesId}:${startDate}:${endDate}:${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const params = {
                series_id: seriesId,
                api_key: this.apiKey,
                file_type: 'json',
                limit,
            };
            if (startDate) {
                params.observation_start = startDate.toISOString().split('T')[0];
            }
            if (endDate) {
                params.observation_end = endDate.toISOString().split('T')[0];
            }
            const response = await this.client.get('/series/observations', { params });
            if (!response.data.observations) {
                return [];
            }
            const observations = response.data.observations
                .filter((obs) => obs.value !== '.')
                .map((obs) => ({
                date: new Date(obs.date),
                value: parseFloat(obs.value),
            }));
            this.setCache(cacheKey, observations);
            logger.debug(`Fetched ${observations.length} observations for ${seriesId} from FRED`);
            return observations;
        }
        catch (error) {
            logger.error(`Error fetching observations from FRED for ${seriesId}:`, error.message);
            return [];
        }
    }
    /**
     * Get latest observation for a series
     */
    async getLatestObservation(seriesId) {
        const observations = await this.getObservations(seriesId, undefined, undefined, 1);
        return observations.length > 0 ? observations[observations.length - 1] : null;
    }
    /**
     * Search for series by keywords
     */
    async searchSeries(searchText, limit = 10) {
        if (!this.apiKey)
            return [];
        try {
            const response = await this.client.get('/series/search', {
                params: {
                    search_text: searchText,
                    api_key: this.apiKey,
                    file_type: 'json',
                    limit,
                },
            });
            if (!response.data.seriess) {
                return [];
            }
            return response.data.seriess.map((series) => ({
                id: series.id,
                title: series.title,
                observation_start: new Date(series.observation_start),
                observation_end: new Date(series.observation_end),
                frequency: series.frequency,
                units: series.units,
                seasonal_adjustment: series.seasonal_adjustment,
            }));
        }
        catch (error) {
            logger.error('Error searching series on FRED:', error.message);
            return [];
        }
    }
    /**
     * Get popular economic indicators
     */
    async getPopularIndicators() {
        const indicators = {
            GDP: 'GDP',
            UNEMPLOYMENT: 'UNRATE',
            INFLATION: 'CPIAUCSL',
            INTEREST_RATE: 'DFF',
            CONSUMER_SENTIMENT: 'UMCSENT',
            RETAIL_SALES: 'RSXFS',
            HOUSING_STARTS: 'HOUST',
            INDUSTRIAL_PRODUCTION: 'INDPRO',
        };
        const results = {};
        for (const [key, seriesId] of Object.entries(indicators)) {
            results[key] = await this.getLatestObservation(seriesId);
        }
        return results;
    }
    /**
     * Cache helpers
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        return null;
    }
    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
    clearCache() {
        this.cache.clear();
    }
}
export const fredClient = new FREDClient();
//# sourceMappingURL=fred.client.js.map