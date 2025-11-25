export declare class MarketsService {
    /**
     * Get all assets with live prices
     */
    static getAssets(limit?: number, offset?: number): Promise<{
        assets: import("../types/common.types.js").MarketAsset[];
        total: number;
    }>;
    /**
     * Get single asset by symbol
     */
    static getAssetBySymbol(symbol: string): Promise<import("../types/common.types.js").MarketAsset | {
        last_price: number;
        change_24h: number;
        id: string;
        symbol: string;
        type: import("../types/common.types.js").AssetType;
        name: string;
        lastPrice: number;
        change: number;
        changeAmount: number;
        high24h?: number;
        low24h?: number;
        volume?: number;
        updatedAt: Date;
    } | null>;
    /**
     * Search assets
     */
    static searchAssets(query: string): Promise<import("../types/common.types.js").MarketAsset[]>;
    /**
     * Get top moving assets
     */
    static getTopMovers(limit?: number): Promise<import("../types/common.types.js").MarketAsset[] | {
        assets: {
            symbol: string;
            name: string;
            type: string;
            last_price: number;
            change_24h: number;
        }[];
        total: number;
    }>;
    /**
     * Get assets by type
     */
    static getAssetsByType(type: string, limit?: number, offset?: number): Promise<{
        assets: import("../types/common.types.js").MarketAsset[];
        total: number;
    }>;
    /**
     * Update prices from external APIs (for cron job)
     */
    static updatePrices(): Promise<void>;
}
//# sourceMappingURL=markets.service.d.ts.map