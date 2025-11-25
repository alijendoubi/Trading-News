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
export declare class EconomicCalendarClient {
    private client;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get upcoming economic events
     * Note: This uses mock data. Replace with real API integration when available.
     */
    getUpcomingEvents(startDate?: Date, endDate?: Date, country?: string, impact?: string): Promise<EconomicEvent[]>;
    /**
     * Fetch from real economic calendar API (placeholder for future implementation)
     */
    private fetchFromRealAPI;
    /**
     * Get mock economic events for testing and development
     */
    getMockEvents(): EconomicEvent[];
    /**
     * Get events by country
     */
    getEventsByCountry(country: string): Promise<EconomicEvent[]>;
    /**
     * Get high-impact events only
     */
    getHighImpactEvents(): Promise<EconomicEvent[]>;
    /**
     * Get events for today
     */
    getTodayEvents(): Promise<EconomicEvent[]>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    /**
     * Clear all cache
     */
    clearCache(): void;
}
export declare const economicCalendarClient: EconomicCalendarClient;
//# sourceMappingURL=economicCalendar.client.d.ts.map