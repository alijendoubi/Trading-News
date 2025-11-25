export interface TwelveDataQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    percentChange: number;
    volume: number;
    timestamp: Date;
}
export interface TwelveDataTimeSeries {
    datetime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
/**
 * Twelve Data API Client
 * Free tier: 800 API calls/day
 * Provides stocks, forex, crypto, and more
 */
export declare class TwelveDataClient {
    private client;
    private apiKey;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get real-time quote for a symbol
     */
    getQuote(symbol: string): Promise<TwelveDataQuote | null>;
    /**
     * Get multiple quotes at once
     */
    getQuotes(symbols: string[]): Promise<TwelveDataQuote[]>;
    /**
     * Get time series data (historical prices)
     */
    getTimeSeries(symbol: string, interval?: string, outputsize?: number): Promise<TwelveDataTimeSeries[]>;
    /**
     * Get forex pair rate
     */
    getForexRate(symbol1: string, symbol2: string): Promise<number | null>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const twelveDataClient: TwelveDataClient;
//# sourceMappingURL=twelveData.client.d.ts.map