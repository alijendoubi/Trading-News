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
export declare class FREDClient {
    private client;
    private apiKey;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get series information
     */
    getSeries(seriesId: string): Promise<FREDSeries | null>;
    /**
     * Get observations (data points) for a series
     */
    getObservations(seriesId: string, startDate?: Date, endDate?: Date, limit?: number): Promise<FREDObservation[]>;
    /**
     * Get latest observation for a series
     */
    getLatestObservation(seriesId: string): Promise<FREDObservation | null>;
    /**
     * Search for series by keywords
     */
    searchSeries(searchText: string, limit?: number): Promise<FREDSeries[]>;
    /**
     * Get popular economic indicators
     */
    getPopularIndicators(): Promise<Record<string, FREDObservation | null>>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const fredClient: FREDClient;
//# sourceMappingURL=fred.client.d.ts.map