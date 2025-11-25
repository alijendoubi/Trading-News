export interface AggregatedQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
    source: string;
    timestamp: Date;
}
export interface AggregatedNews {
    title: string;
    url: string;
    source: string;
    publishedAt: Date;
    description?: string;
    category?: string;
}
/**
 * Aggregated Data Service
 * Combines data from multiple free APIs to provide comprehensive market coverage
 */
export declare class AggregatedDataService {
    /**
     * Get stock quote from multiple sources (fallback chain)
     */
    getStockQuote(symbol: string): Promise<AggregatedQuote | null>;
    /**
     * Get crypto quote from multiple sources
     */
    getCryptoQuote(symbol: string): Promise<AggregatedQuote | null>;
    /**
     * Get aggregated news from all sources
     */
    getAggregatedNews(limit?: number): Promise<AggregatedNews[]>;
    /**
     * Get crypto-specific news
     */
    getCryptoNews(limit?: number): Promise<AggregatedNews[]>;
    /**
     * Get economic indicators from multiple sources
     */
    getEconomicIndicators(country?: string): Promise<any>;
    /**
     * Get top market movers (gainers/losers)
     */
    getTopMovers(): Promise<{
        stocks: {
            gainers: any[];
            losers: any[];
        };
        crypto: {
            gainers: any[];
            losers: any[];
        };
    }>;
    /**
     * Remove duplicate news articles based on title similarity
     */
    private deduplicateNews;
    /**
     * Clear all caches across all clients
     */
    clearAllCaches(): void;
}
export declare const aggregatedDataService: AggregatedDataService;
//# sourceMappingURL=aggregatedData.service.d.ts.map