export declare class EventsService {
    /**
     * Get all events with optional filters
     */
    static getEvents(limit?: number, offset?: number, country?: string, impact?: string): Promise<any>;
    /**
     * Get single event by ID
     */
    static getEventById(id: number): Promise<import("../../../common/types.js").EconomicEvent | null>;
    /**
     * Get events by country
     */
    static getEventsByCountry(country: string, limit?: number): Promise<{
        events: import("../../../common/types.js").EconomicEvent[];
        total: number;
    } | {
        events: import("../integrations/economicCalendar.client.js").EconomicEvent[];
        total: number;
    }>;
    /**
     * Get high impact events
     */
    static getHighImpactEvents(limit?: number): Promise<any>;
    /**
     * Get today's events
     */
    static getTodayEvents(): Promise<{
        events: import("../integrations/economicCalendar.client.js").EconomicEvent[];
        total: number;
    }>;
    /**
     * Sync events from external API to database (for cron job)
     */
    static syncEvents(): Promise<void>;
}
//# sourceMappingURL=events.service.d.ts.map