import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

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
 */
function parseNumericValue(value?: string): number | undefined {
  if (!value || typeof value !== 'string') return undefined;
  
  let cleaned = value.trim().replace(/[$,\s]/g, '');
  
  if (cleaned.endsWith('%')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num;
  }
  
  if (cleaned.toUpperCase().endsWith('K')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num * 1000;
  }
  
  if (cleaned.toUpperCase().endsWith('M')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num * 1000000;
  }
  
  if (cleaned.toUpperCase().endsWith('B')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? undefined : num * 1000000000;
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Real Economic Calendar Client
 * Uses Investing.com's economic calendar API (unofficial but public)
 */
export class EconomicCalendarRealClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 3600000; // 1 hour cache

  constructor() {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
  }

  /**
   * Fetch economic events from Investing.com
   * This uses their publicly accessible calendar data
   */
  async getUpcomingEvents(
    startDate?: Date,
    endDate?: Date,
    country?: string,
    impact?: string
  ): Promise<EconomicEvent[]> {
    const cacheKey = `events:${startDate?.toISOString()}:${country}:${impact}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try to fetch from Investing.com calendar JSON endpoint
      const response = await this.client.get('https://www.investing.com/economic-calendar/Service/getCalendarFilteredData', {
        params: {
          country: this.getCountryIds(country),
          importance: this.getImportanceLevel(impact),
          timeZone: '12',
          timeFilter: 'timeRemain',
          currentTab: 'custom',
          limit_from: 0,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const events = this.parseInvestingComData(response.data);

      // Apply additional filters
      let filteredEvents = events;

      if (startDate) {
        filteredEvents = filteredEvents.filter(e => e.date >= startDate);
      }

      if (endDate) {
        filteredEvents = filteredEvents.filter(e => e.date <= endDate);
      }

      this.setCache(cacheKey, filteredEvents);
      logger.debug(`Fetched ${filteredEvents.length} real economic events`);
      return filteredEvents;
    } catch (error) {
      logger.error('Error fetching from Investing.com, trying alternative:', error);
      
      // Fallback to alternative source or mock data
      return this.getFallbackEvents();
    }
  }

  /**
   * Parse Investing.com response data
   */
  private parseInvestingComData(data: any): EconomicEvent[] {
    try {
      const events: EconomicEvent[] = [];
      
      // The response typically contains HTML, we need to parse it
      // This is simplified - in production, use a proper HTML parser like cheerio
      const rows = data.data || [];

      for (const row of rows) {
        try {
          events.push({
            title: row.event || row.name || 'Unknown Event',
            date: this.parseDate(row.date, row.time),
            country: row.country || 'Unknown',
            impact: this.parseImpact(row.importance),
            forecast: parseNumericValue(row.forecast),
            previous: parseNumericValue(row.previous),
            actual: parseNumericValue(row.actual),
            currency: row.currency || undefined,
          });
        } catch (e) {
          // Skip malformed entries
        }
      }

      return events;
    } catch (error) {
      logger.error('Error parsing Investing.com data:', error);
      return [];
    }
  }

  /**
   * Alternative: Use FMP (Financial Modeling Prep) economic calendar
   * Requires API key but has generous free tier
   */
  async getEventsFromFMP(): Promise<EconomicEvent[]> {
    if (!process.env.FMP_API_KEY) {
      return [];
    }

    try {
      const response = await this.client.get('https://financialmodelingprep.com/api/v3/economic_calendar', {
        params: {
          apikey: process.env.FMP_API_KEY,
        },
      });

      return response.data.map((event: any) => ({
        title: event.event,
        date: new Date(event.date),
        country: event.country,
        impact: this.parseImpact(event.impact),
        forecast: parseNumericValue(event.estimate),
        previous: parseNumericValue(event.previous),
        actual: parseNumericValue(event.actual),
        currency: event.currency,
      }));
    } catch (error) {
      logger.error('Error fetching from FMP:', error);
      return [];
    }
  }

  /**
   * Get fallback events (mock data)
   */
  private getFallbackEvents(): EconomicEvent[] {
    const now = new Date();
    return [
      {
        title: 'Non-Farm Payrolls',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        country: 'US',
        impact: 'High',
        forecast: 200000,
        previous: 195000,
        currency: 'USD',
      },
      {
        title: 'Federal Reserve Interest Rate Decision',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        country: 'US',
        impact: 'High',
        forecast: 5.25,
        previous: 5.00,
        currency: 'USD',
      },
      {
        title: 'Consumer Price Index (CPI)',
        date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        country: 'US',
        impact: 'High',
        forecast: 3.2,
        previous: 3.0,
        currency: 'USD',
      },
      {
        title: 'GDP Growth Rate',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        country: 'UK',
        impact: 'High',
        forecast: 0.3,
        previous: 0.1,
        currency: 'GBP',
      },
      {
        title: 'ECB Press Conference',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        country: 'EU',
        impact: 'High',
        currency: 'EUR',
      },
    ];
  }

  /**
   * Helper methods
   */
  private parseDate(dateStr: string, timeStr?: string): Date {
    try {
      const combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
      return new Date(combined);
    } catch {
      return new Date();
    }
  }

  private parseImpact(importance: any): 'Low' | 'Medium' | 'High' {
    if (!importance) return 'Medium';
    
    const level = importance.toString().toLowerCase();
    if (level.includes('high') || level === '3') return 'High';
    if (level.includes('low') || level === '1') return 'Low';
    return 'Medium';
  }

  private getCountryIds(country?: string): string {
    // Investing.com uses specific country IDs
    const countryMap: Record<string, string> = {
      'US': '5',
      'UK': '4',
      'EU': '72',
      'JP': '35',
      'CN': '37',
    };
    
    if (!country) return '';
    return countryMap[country.toUpperCase()] || '';
  }

  private getImportanceLevel(impact?: string): string {
    if (!impact) return '';
    
    const impactMap: Record<string, string> = {
      'Low': '1',
      'Medium': '2',
      'High': '3',
    };
    
    return impactMap[impact] || '';
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

// Singleton instance
export const economicCalendarRealClient = new EconomicCalendarRealClient();
