import { queryDb, queryDbSingle } from '../config/db.js';
export class WatchlistModel {
    /**
     * Get user's watchlist with asset details
     */
    static async getUserWatchlist(userId) {
        return queryDb(`SELECT w.id, w.asset_id, w.created_at,
              a.symbol, a.name, a.type, a.last_price, a.change_24h
       FROM user_watchlists w
       JOIN market_assets a ON w.asset_id = a.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`, [userId]);
    }
    /**
     * Add asset to user's watchlist
     */
    static async addToWatchlist(userId, assetId) {
        const result = await queryDb(`INSERT INTO user_watchlists (user_id, asset_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, asset_id) DO NOTHING
       RETURNING *`, [userId, assetId]);
        return result[0];
    }
    /**
     * Remove asset from user's watchlist
     */
    static async removeFromWatchlist(userId, assetId) {
        const result = await queryDb(`DELETE FROM user_watchlists
       WHERE user_id = $1 AND asset_id = $2
       RETURNING id`, [userId, assetId]);
        return result.length > 0;
    }
    /**
     * Check if asset is in user's watchlist
     */
    static async isInWatchlist(userId, assetId) {
        const result = await queryDbSingle(`SELECT EXISTS(
         SELECT 1 FROM user_watchlists
         WHERE user_id = $1 AND asset_id = $2
       ) as exists`, [userId, assetId]);
        return result?.exists || false;
    }
}
//# sourceMappingURL=watchlist.model.js.map