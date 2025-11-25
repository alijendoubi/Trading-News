import { Collections, getDb, createDocument, deleteDocument } from '../config/firestore.js';
export class WatchlistModel {
    /**
     * Get user's watchlist with asset details
     */
    static async getUserWatchlist(userId) {
        const db = getDb();
        const snapshot = await db.collection(Collections.USER_WATCHLISTS)
            .where('user_id', '==', userId)
            .orderBy('created_at', 'desc')
            .get();
        const watchlistItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        // Fetch asset details for each watchlist item
        const results = [];
        for (const item of watchlistItems) {
            const assetDoc = await db.collection(Collections.MARKET_ASSETS).doc(item.asset_id).get();
            if (assetDoc.exists) {
                const assetData = assetDoc.data();
                results.push({
                    id: item.id,
                    asset_id: item.asset_id,
                    created_at: item.created_at,
                    symbol: assetData?.symbol,
                    name: assetData?.name,
                    type: assetData?.type,
                    last_price: assetData?.last_price,
                    change_24h: assetData?.change,
                });
            }
        }
        return results;
    }
    /**
     * Add asset to user's watchlist
     */
    static async addToWatchlist(userId, assetId) {
        const db = getDb();
        // Check if already exists
        const existing = await db.collection(Collections.USER_WATCHLISTS)
            .where('user_id', '==', userId)
            .where('asset_id', '==', assetId)
            .limit(1)
            .get();
        if (!existing.empty) {
            const doc = existing.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        const watchlistData = {
            user_id: userId,
            asset_id: assetId,
        };
        return createDocument(Collections.USER_WATCHLISTS, watchlistData);
    }
    /**
     * Remove asset from user's watchlist
     */
    static async removeFromWatchlist(userId, assetId) {
        const db = getDb();
        const snapshot = await db.collection(Collections.USER_WATCHLISTS)
            .where('user_id', '==', userId)
            .where('asset_id', '==', assetId)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return false;
        }
        await deleteDocument(Collections.USER_WATCHLISTS, snapshot.docs[0].id);
        return true;
    }
    /**
     * Check if asset is in user's watchlist
     */
    static async isInWatchlist(userId, assetId) {
        const db = getDb();
        const snapshot = await db.collection(Collections.USER_WATCHLISTS)
            .where('user_id', '==', userId)
            .where('asset_id', '==', assetId)
            .limit(1)
            .get();
        return !snapshot.empty;
    }
}
//# sourceMappingURL=watchlist.model.js.map