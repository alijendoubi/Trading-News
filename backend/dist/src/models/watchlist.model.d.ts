export interface WatchlistRow {
    id: string;
    user_id: string;
    asset_id: string;
    created_at: Date;
}
export declare class WatchlistModel {
    /**
     * Get user's watchlist with asset details
     */
    static getUserWatchlist(userId: string): Promise<any[]>;
    /**
     * Add asset to user's watchlist
     */
    static addToWatchlist(userId: string, assetId: string): Promise<WatchlistRow>;
    /**
     * Remove asset from user's watchlist
     */
    static removeFromWatchlist(userId: string, assetId: string): Promise<boolean>;
    /**
     * Check if asset is in user's watchlist
     */
    static isInWatchlist(userId: string, assetId: string): Promise<boolean>;
}
//# sourceMappingURL=watchlist.model.d.ts.map