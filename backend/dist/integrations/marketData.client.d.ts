export interface CryptoPrice {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume: number;
}
export interface ForexPrice {
    symbol: string;
    price: number;
    change: number;
    timestamp: Date;
}
export declare class MarketDataClient {
    private coinGeckoClient;
    private alphaVantageClient;
    private cryptoCompareClient;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get cryptocurrency prices from CoinGecko
     */
    getCryptoPrices(symbols?: string[]): Promise<CryptoPrice[]>;
    /**
     * Get single crypto price by ID
     */
    getCryptoPrice(coinId: string): Promise<CryptoPrice | null>;
    /**
     * Get multiple crypto prices from Cryptocompare (alternative to CoinGecko)
     */
    getCryptoPricesFromCryptoCompare(symbols: string[]): Promise<CryptoPrice[]>;
    /**
     * Get forex prices using Alpha Vantage (free tier: 5 calls/min, 500/day)
     */
    getForexPrice(fromCurrency: string, toCurrency?: string): Promise<ForexPrice | null>;
    /**
     * Get trending cryptocurrencies
     */
    getTrendingCrypto(): Promise<CryptoPrice[]>;
    /**
     * Search for coins
     */
    searchCoins(query: string): Promise<any[]>;
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
export declare const marketDataClient: MarketDataClient;
//# sourceMappingURL=marketData.client.d.ts.map