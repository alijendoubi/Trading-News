import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export interface EconomicEvent {
  title: string;
  date: Date;
  country: string;
  impact: 'Low' | 'Medium' | 'High';
  forecast?: number;
  previous?: number;
  actual?: number;
  currency?: string;
}

/**
 * Parse numeric values from strings like "3.2%", "200K", "-$65B"
 * Returns number or undefined if parsing fails
 */
function parseNumericValue(value?: string): number | undefined {
  if (!value || typeof value !== 'string') return undefined;
  
  // Remove common symbols
  let cleaned = value.trim().replace(/[$,\s]/g, '');
  
  // Handle percentage
  if (cleaned.endsWith('%')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num;
  }
  
  // Handle K (thousands)
  if (cleaned.toUpperCase().endsWith('K')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num * 1000;
  }
  
  // Handle M (millions)
  if (cleaned.toUpperCase().endsWith('M')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num * 1000000;
  }
  
  // Handle B (billions)
  if (cleaned.toUpperCase().endsWith('B')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num * 1000000000;
  }
  
  // Try parsing as regular number
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

export class EconomicCalendarClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 3600000; // 1 hour cache

  constructor() {
    this.client = axios.create({
      timeout: 10000,
    });
  }

  /**
   * Get upcoming economic events
   * Note: This uses mock data. Replace with real API integration when available.
   */
  async getUpcomingEvents(
    startDate?: Date,
    endDate?: Date,
    country?: string,
    impact?: string
  ): Promise<EconomicEvent[]> {
    const cacheKey = `events:${startDate?.toISOString()}:${endDate?.toISOString()}:${country}:${impact}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Check if real API is configured
      if (env.apis.economic.key && env.apis.economic.url) {
        return await this.fetchFromRealAPI(startDate, endDate, country, impact);
      }

      // Use mock data as fallback
      const events = this.getMockEvents();
      
      // Apply filters
      let filteredEvents = events;

      if (startDate) {
        filteredEvents = filteredEvents.filter(e => e.date >= startDate);
      }

      if (endDate) {
        filteredEvents = filteredEvents.filter(e => e.date <= endDate);
      }

      if (country) {
        filteredEvents = filteredEvents.filter(
          e => e.country.toLowerCase() === country.toLowerCase()
        );
      }

      if (impact) {
        filteredEvents = filteredEvents.filter(
          e => e.impact.toLowerCase() === impact.toLowerCase()
        );
      }

      // Sort by date
      filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

      this.setCache(cacheKey, filteredEvents);
      logger.debug(`Retrieved ${filteredEvents.length} economic events`);
      return filteredEvents;
    } catch (error) {
      logger.error('Error fetching economic events:', error);
      return this.getMockEvents();
    }
  }

  /**
   * Fetch from real economic calendar API (placeholder for future implementation)
   */
  private async fetchFromRealAPI(
    startDate?: Date,
    endDate?: Date,
    country?: string,
    impact?: string
  ): Promise<EconomicEvent[]> {
    try {
      const response = await this.client.get(env.apis.economic.url, {
        params: {
          apikey: env.apis.economic.key,
          start_date: startDate?.toISOString().split('T')[0],
          end_date: endDate?.toISOString().split('T')[0],
          country,
          importance: impact,
        },
      });

      // Transform API response to our format
      return response.data.map((event: any) => ({
        title: event.name || event.event,
        date: new Date(event.date || event.time),
        country: event.country,
        impact: event.importance || event.impact,
        forecast: event.forecast,
        previous: event.previous,
        actual: event.actual,
        currency: event.currency,
      }));
    } catch (error) {
      logger.error('Error fetching from real economic API:', error);
      throw error;
    }
  }

  /**
   * Get mock economic events for testing and development
   */
  getMockEvents(): EconomicEvent[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        title: 'Non-Farm Payrolls',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        country: 'US',
        impact: 'High',
        forecast: parseNumericValue('200K'),
        previous: parseNumericValue('195K'),
        currency: 'USD',
      },
      {
        title: 'Federal Reserve Interest Rate Decision',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        country: 'US',
        impact: 'High',
        forecast: parseNumericValue('5.25%'),
        previous: parseNumericValue('5.00%'),
        currency: 'USD',
      },
      {
        title: 'Consumer Price Index (CPI)',
        date: tomorrow,
        country: 'US',
        impact: 'High',
        forecast: parseNumericValue('3.2%'),
        previous: parseNumericValue('3.0%'),
        currency: 'USD',
      },
      {
        title: 'GDP Growth Rate',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        country: 'UK',
        impact: 'High',
        forecast: parseNumericValue('0.3%'),
        previous: parseNumericValue('0.1%'),
        currency: 'GBP',
      },
      {
        title: 'ECB Press Conference',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        country: 'EU',
        impact: 'High',
        currency: 'EUR',
      },
      {
        title: 'Unemployment Rate',
        date: tomorrow,
        country: 'US',
        impact: 'Medium',
        forecast: parseNumericValue('3.8%'),
        previous: parseNumericValue('3.7%'),
        currency: 'USD',
      },
      {
        title: 'Manufacturing PMI',
        date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        country: 'US',
        impact: 'Medium',
        forecast: parseNumericValue('51.2'),
        previous: parseNumericValue('50.8'),
        currency: 'USD',
      },
      {
        title: 'Retail Sales',
        date: nextWeek,
        country: 'US',
        impact: 'Medium',
        forecast: parseNumericValue('0.5%'),
        previous: parseNumericValue('0.3%'),
        currency: 'USD',
      },
      {
        title: 'Bank of Japan Policy Decision',
        date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        country: 'JP',
        impact: 'High',
        currency: 'JPY',
      },
      {
        title: 'Trade Balance',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        country: 'US',
        impact: 'Low',
        forecast: parseNumericValue('-$65B'),
        previous: parseNumericValue('-$63B'),
        currency: 'USD',
      },
    ];
  }

  /**
   * Get events by country
   */
  async getEventsByCountry(country: string): Promise<EconomicEvent[]> {
    return this.getUpcomingEvents(undefined, undefined, country);
  }

  /**
   * Get high-impact events only
   */
  async getHighImpactEvents(): Promise<EconomicEvent[]> {
    return this.getUpcomingEvents(undefined, undefined, undefined, 'High');
  }

  /**
   * Get events for today
   */
  async getTodayEvents(): Promise<EconomicEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getUpcomingEvents(today, tomorrow);
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

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const economicCalendarClient = new EconomicCalendarClient();
