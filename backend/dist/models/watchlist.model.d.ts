export interface WatchlistRow {
    id: number;
    user_id: number;
    asset_id: number;
    created_at: Date;
}
export declare class WatchlistModel {
    /**
     * Get user's watchlist with asset details
     */
    static getUserWatchlist(userId: number): Promise<any[]>;
    /**
     * Add asset to user's watchlist
     */
    static addToWatchlist(userId: number, assetId: number): Promise<WatchlistRow>;
    /**
     * Remove asset from user's watchlist
     */
    static removeFromWatchlist(userId: number, assetId: number): Promise<boolean>;
    /**
     * Check if asset is in user's watchlist
     */
    static isInWatchlist(userId: number, assetId: number): Promise<boolean>;
}
//# sourceMappingURL=watchlist.model.d.ts.map