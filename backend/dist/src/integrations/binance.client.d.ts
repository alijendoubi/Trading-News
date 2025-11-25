export interface BinanceTicker {
    symbol: string;
    price: number;
    priceChange: number;
    priceChangePercent: number;
    volume: number;
    quoteVolume: number;
    high: number;
    low: number;
    openPrice: number;
}
export interface BinanceKline {
    openTime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: Date;
}
/**
 * Binance API Client
 * No API key required for public endpoints
 * Completely free real-time crypto data
 */
export declare class BinanceClient {
    private client;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get 24hr ticker price change statistics
     */
    get24hrTicker(symbol?: string): Promise<BinanceTicker[]>;
    /**
     * Get current price for symbol(s)
     */
    getPrice(symbol?: string): Promise<Record<string, number>>;
    /**
     * Get kline/candlestick data
     */
    getKlines(symbol: string, interval?: string, limit?: number): Promise<BinanceKline[]>;
    /**
     * Get order book depth
     */
    getOrderBook(symbol: string, limit?: number): Promise<any>;
    /**
     * Get exchange info
     */
    getExchangeInfo(): Promise<any>;
    /**
     * Get top gainers and losers
     */
    getTopMovers(): Promise<{
        gainers: BinanceTicker[];
        losers: BinanceTicker[];
    }>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const binanceClient: BinanceClient;
//# sourceMappingURL=binance.client.d.ts.map