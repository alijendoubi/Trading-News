import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface WorldBankIndicator {
  id: string;
  name: string;
  sourceNote: string;
  sourceOrganization: string;
}

export interface WorldBankData {
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
  countryiso3code: string;
  date: string;
  value: number;
  unit: string;
  decimal: number;
}

/**
 * World Bank API Client
 * Completely free, no API key required
 * Provides global economic indicators
 */
export class WorldBankClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 3600000; // 1 hour cache

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.worldbank.org/v2',
      timeout: 15000,
    });
  }

  /**
   * Get indicator data for a country
   */
  async getIndicator(
    countryCode: string,
    indicatorCode: string,
    startDate?: number,
    endDate?: number
  ): Promise<WorldBankData[]> {
    const cacheKey = `indicator:${countryCode}:${indicatorCode}:${startDate}:${endDate}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params: any = {
        format: 'json',
        per_page: 100,
      };

      if (startDate && endDate) {
        params.date = `${startDate}:${endDate}`;
      }

      const response = await this.client.get(
        `/country/${countryCode}/indicator/${indicatorCode}`,
        { params }
      );

      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        return [];
      }

      const data: WorldBankData[] = response.data[1]
        .filter((item: any) => item.value !== null)
        .map((item: any) => ({
          indicator: {
            id: item.indicator.id,
            value: item.indicator.value,
          },
          country: {
            id: item.country.id,
            value: item.country.value,
          },
          countryiso3code: item.countryiso3code,
          date: item.date,
          value: item.value,
          unit: item.unit || '',
          decimal: item.decimal || 0,
        }));

      this.setCache(cacheKey, data);
      logger.debug(`Fetched ${data.length} data points for ${indicatorCode} from World Bank`);
      return data;
    } catch (error: any) {
      logger.error(
        `Error fetching indicator from World Bank for ${countryCode}/${indicatorCode}:`,
        error.message
      );
      return [];
    }
  }

  /**
   * Get multiple indicators for a country
   */
  async getMultipleIndicators(
    countryCode: string,
    indicatorCodes: string[],
    startDate?: number,
    endDate?: number
  ): Promise<Record<string, WorldBankData[]>> {
    const results: Record<string, WorldBankData[]> = {};

    for (const indicator of indicatorCodes) {
      results[indicator] = await this.getIndicator(countryCode, indicator, startDate, endDate);
    }

    return results;
  }

  /**
   * Get GDP data
   */
  async getGDP(countryCode: string = 'USA', years: number = 5): Promise<WorldBankData[]> {
    const currentYear = new Date().getFullYear();
    return this.getIndicator(
      countryCode,
      'NY.GDP.MKTP.CD',
      currentYear - years,
      currentYear
    );
  }

  /**
   * Get inflation data (CPI)
   */
  async getInflation(countryCode: string = 'USA', years: number = 5): Promise<WorldBankData[]> {
    const currentYear = new Date().getFullYear();
    return this.getIndicator(
      countryCode,
      'FP.CPI.TOTL.ZG',
      currentYear - years,
      currentYear
    );
  }

  /**
   * Get unemployment rate
   */
  async getUnemployment(countryCode: string = 'USA', years: number = 5): Promise<WorldBankData[]> {
    const currentYear = new Date().getFullYear();
    return this.getIndicator(
      countryCode,
      'SL.UEM.TOTL.ZS',
      currentYear - years,
      currentYear
    );
  }

  /**
   * Get interest rate
   */
  async getInterestRate(countryCode: string = 'USA', years: number = 5): Promise<WorldBankData[]> {
    const currentYear = new Date().getFullYear();
    return this.getIndicator(
      countryCode,
      'FR.INR.RINR',
      currentYear - years,
      currentYear
    );
  }

  /**
   * Search for indicators
   */
  async searchIndicators(query: string): Promise<WorldBankIndicator[]> {
    try {
      const response = await this.client.get('/indicator', {
        params: {
          format: 'json',
          per_page: 20,
        },
      });

      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        return [];
      }

      const indicators = response.data[1]
        .filter((item: any) => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.id.toLowerCase().includes(query.toLowerCase())
        )
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          sourceNote: item.sourceNote,
          sourceOrganization: item.sourceOrganization,
        }));

      return indicators;
    } catch (error: any) {
      logger.error('Error searching indicators on World Bank:', error.message);
      return [];
    }
  }

  /**
   * Get all countries
   */
  async getCountries(): Promise<any[]> {
    const cacheKey = 'countries';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/country', {
        params: {
          format: 'json',
          per_page: 300,
        },
      });

      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        return [];
      }

      const countries = response.data[1];
      this.setCache(cacheKey, countries);
      return countries;
    } catch (error: any) {
      logger.error('Error fetching countries from World Bank:', error.message);
      return [];
    }
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

export const worldBankClient = new WorldBankClient();
