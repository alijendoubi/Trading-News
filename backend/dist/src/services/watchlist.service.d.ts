export declare class WatchlistService {
    /**
     * Get user's watchlist
     */
    static getUserWatchlist(userId: string): Promise<{
        watchlist: any[];
        total: number;
    }>;
    /**
     * Add asset to watchlist
     */
    static addToWatchlist(userId: string, assetId: string): Promise<import("../models/watchlist.model.js").WatchlistRow>;
    /**
     * Remove asset from watchlist
     */
    static removeFromWatchlist(userId: string, assetId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=watchlist.service.d.ts.map