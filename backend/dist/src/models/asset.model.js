import { Collections, getDb, getDocumentById, createDocument, updateDocument, queryWithPagination } from '../config/firestore.js';
export class AssetModel {
    static rowToAsset(row) {
        return {
            id: row.id.toString(),
            symbol: row.symbol,
            type: row.type,
            name: row.name,
            lastPrice: row.last_price,
            change: row.change,
            changeAmount: row.change_amount,
            high24h: row.high_24h,
            low24h: row.low_24h,
            volume: row.volume,
            updatedAt: row.updated_at,
        };
    }
    static async findBySymbol(symbol) {
        const db = getDb();
        const snapshot = await db.collection(Collections.MARKET_ASSETS)
            .where('symbol', '==', symbol)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return this.rowToAsset({ id: doc.id, ...doc.data() });
    }
    static async findById(id) {
        const row = await getDocumentById(Collections.MARKET_ASSETS, id);
        return row ? this.rowToAsset(row) : null;
    }
    static async findByType(type, limit = 50, offset = 0) {
        const result = await queryWithPagination(Collections.MARKET_ASSETS, (ref) => ref.where('type', '==', type).orderBy('symbol', 'asc'), limit, offset);
        return {
            assets: result.items.map(this.rowToAsset),
            total: result.total,
        };
    }
    static async getAll(limit = 100, offset = 0) {
        const result = await queryWithPagination(Collections.MARKET_ASSETS, (ref) => ref.orderBy('symbol', 'asc'), limit, offset);
        return {
            assets: result.items.map(this.rowToAsset),
            total: result.total,
        };
    }
    static async create(asset) {
        const row = await createDocument(Collections.MARKET_ASSETS, asset);
        return this.rowToAsset(row);
    }
    static async update(id, asset) {
        const row = await updateDocument(Collections.MARKET_ASSETS, id, asset);
        return this.rowToAsset(row);
    }
    static async search(query, limit = 20) {
        const db = getDb();
        const upperQuery = query.toUpperCase();
        // Search by symbol prefix (Firestore doesn't support LIKE, so we use range queries)
        const snapshot = await db.collection(Collections.MARKET_ASSETS)
            .where('symbol', '>=', upperQuery)
            .where('symbol', '<=', upperQuery + '\uf8ff')
            .orderBy('symbol', 'asc')
            .limit(limit)
            .get();
        const rows = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return rows.map(this.rowToAsset);
    }
    static async getTopMovers(limit = 10) {
        const db = getDb();
        // Firestore doesn't support ABS(), so we fetch more and sort in-memory
        const snapshot = await db.collection(Collections.MARKET_ASSETS)
            .orderBy('change', 'desc')
            .limit(limit * 2)
            .get();
        const rows = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        // Sort by absolute value of change
        const sorted = rows.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        return sorted.slice(0, limit).map(this.rowToAsset);
    }
}
//# sourceMappingURL=asset.model.js.map