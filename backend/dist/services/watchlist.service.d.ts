export declare class WatchlistService {
    /**
     * Get user's watchlist
     */
    static getUserWatchlist(userId: number): Promise<{
        watchlist: any[];
        total: number;
    }>;
    /**
     * Add asset to watchlist
     */
    static addToWatchlist(userId: number, assetId: number): Promise<import("../models/watchlist.model.js").WatchlistRow>;
    /**
     * Remove asset from watchlist
     */
    static removeFromWatchlist(userId: number, assetId: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=watchlist.service.d.ts.map