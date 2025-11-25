import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface FREDSeries {
  id: string;
  title: string;
  observation_start: Date;
  observation_end: Date;
  frequency: string;
  units: string;
  seasonal_adjustment: string;
}

export interface FREDObservation {
  date: Date;
  value: number;
}

/**
 * FRED (Federal Reserve Economic Data) API Client
 * Free with API key
 * Provides comprehensive US economic data
 */
export class FREDClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 3600000; // 1 hour cache

  constructor() {
    this.apiKey = process.env.FRED_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://api.stlouisfed.org/fred',
      timeout: 10000,
    });
  }

  /**
   * Get series information
   */
  async getSeries(seriesId: string): Promise<FREDSeries | null> {
    if (!this.apiKey) {
      logger.warn('FRED API key not configured');
      return null;
    }

    const cacheKey = `series:${seriesId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

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
      const result: FREDSeries = {
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
    } catch (error: any) {
      logger.error(`Error fetching series from FRED for ${seriesId}:`, error.message);
      return null;
    }
  }

  /**
   * Get observations (data points) for a series
   */
  async getObservations(
    seriesId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<FREDObservation[]> {
    if (!this.apiKey) return [];

    const cacheKey = `observations:${seriesId}:${startDate}:${endDate}:${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params: any = {
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

      const observations: FREDObservation[] = response.data.observations
        .filter((obs: any) => obs.value !== '.')
        .map((obs: any) => ({
          date: new Date(obs.date),
          value: parseFloat(obs.value),
        }));

      this.setCache(cacheKey, observations);
      logger.debug(`Fetched ${observations.length} observations for ${seriesId} from FRED`);
      return observations;
    } catch (error: any) {
      logger.error(`Error fetching observations from FRED for ${seriesId}:`, error.message);
      return [];
    }
  }

  /**
   * Get latest observation for a series
   */
  async getLatestObservation(seriesId: string): Promise<FREDObservation | null> {
    const observations = await this.getObservations(seriesId, undefined, undefined, 1);
    return observations.length > 0 ? observations[observations.length - 1] : null;
  }

  /**
   * Search for series by keywords
   */
  async searchSeries(searchText: string, limit: number = 10): Promise<FREDSeries[]> {
    if (!this.apiKey) return [];

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

      return response.data.seriess.map((series: any) => ({
        id: series.id,
        title: series.title,
        observation_start: new Date(series.observation_start),
        observation_end: new Date(series.observation_end),
        frequency: series.frequency,
        units: series.units,
        seasonal_adjustment: series.seasonal_adjustment,
      }));
    } catch (error: any) {
      logger.error('Error searching series on FRED:', error.message);
      return [];
    }
  }

  /**
   * Get popular economic indicators
   */
  async getPopularIndicators(): Promise<Record<string, FREDObservation | null>> {
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

    const results: Record<string, FREDObservation | null> = {};

    for (const [key, seriesId] of Object.entries(indicators)) {
      results[key] = await this.getLatestObservation(seriesId);
    }

    return results;
  }

  /**
   * Cache helpers
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const fredClient = new FREDClient();
