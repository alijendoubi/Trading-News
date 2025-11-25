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
 * Real Economic Calendar Client
 * Uses Investing.com's economic calendar API (unofficial but public)
 */
export declare class EconomicCalendarRealClient {
    private client;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Fetch economic events from Investing.com
     * This uses their publicly accessible calendar data
     */
    getUpcomingEvents(startDate?: Date, endDate?: Date, country?: string, impact?: string): Promise<EconomicEvent[]>;
    /**
     * Parse Investing.com response data
     */
    private parseInvestingComData;
    /**
     * Alternative: Use FMP (Financial Modeling Prep) economic calendar
     * Requires API key but has generous free tier
     */
    getEventsFromFMP(): Promise<EconomicEvent[]>;
    /**
     * Get fallback events (mock data)
     */
    private getFallbackEvents;
    /**
     * Helper methods
     */
    private parseDate;
    private parseImpact;
    private getCountryIds;
    private getImportanceLevel;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const economicCalendarRealClient: EconomicCalendarRealClient;
//# sourceMappingURL=economicCalendarReal.client.d.ts.map