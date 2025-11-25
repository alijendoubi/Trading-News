export interface PolygonTicker {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    type: string;
    active: boolean;
    currency_name: string;
}
export interface PolygonQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    timestamp: Date;
}
export interface PolygonAggregate {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    volumeWeighted: number;
}
/**
 * Polygon.io API Client
 * Free tier: 5 API calls/minute
 * Provides comprehensive stock market data
 */
export declare class PolygonClient {
    private client;
    private apiKey;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get previous day's OHLC for a ticker
     */
    getPreviousClose(ticker: string): Promise<PolygonQuote | null>;
    /**
     * Get aggregates (bars) for a ticker
     */
    getAggregates(ticker: string, multiplier: number | undefined, timespan: string | undefined, from: string, to: string): Promise<PolygonAggregate[]>;
    /**
     * Get snapshot of all tickers
     */
    getTickersSnapshot(): Promise<any[]>;
    /**
     * Get gainers/losers
     */
    getGainersLosers(direction?: 'gainers' | 'losers'): Promise<any[]>;
    /**
     * Search for ticker symbols
     */
    searchTickers(search: string, limit?: number): Promise<PolygonTicker[]>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const polygonClient: PolygonClient;
//# sourceMappingURL=polygon.client.d.ts.map