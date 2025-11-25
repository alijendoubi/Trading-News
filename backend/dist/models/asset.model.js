import { queryDb, queryDbSingle } from '../config/db.js';
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
        const row = await queryDbSingle('SELECT * FROM market_assets WHERE symbol = $1', [symbol]);
        return row ? this.rowToAsset(row) : null;
    }
    static async findById(id) {
        const row = await queryDbSingle('SELECT * FROM market_assets WHERE id = $1', [id]);
        return row ? this.rowToAsset(row) : null;
    }
    static async findByType(type, limit = 50, offset = 0) {
        const [rows, countResult] = await Promise.all([
            queryDb('SELECT * FROM market_assets WHERE type = $1 ORDER BY symbol ASC LIMIT $2 OFFSET $3', [type, limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM market_assets WHERE type = $1', [type]),
        ]);
        return {
            assets: rows.map(this.rowToAsset),
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    static async getAll(limit = 100, offset = 0) {
        const [rows, countResult] = await Promise.all([
            queryDb('SELECT * FROM market_assets ORDER BY symbol ASC LIMIT $1 OFFSET $2', [limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM market_assets'),
        ]);
        return {
            assets: rows.map(this.rowToAsset),
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    static async create(asset) {
        const result = await queryDb(`INSERT INTO market_assets (symbol, type, name, last_price, change, change_amount, high_24h, low_24h, volume)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [asset.symbol, asset.type, asset.name, asset.last_price, asset.change, asset.change_amount, asset.high_24h, asset.low_24h, asset.volume]);
        return this.rowToAsset(result[0]);
    }
    static async update(id, asset) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.entries(asset).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });
        values.push(id);
        const result = await queryDb(`UPDATE market_assets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`, values);
        return this.rowToAsset(result[0]);
    }
    static async search(query, limit = 20) {
        const searchQuery = `%${query}%`;
        const rows = await queryDb('SELECT * FROM market_assets WHERE symbol ILIKE $1 OR name ILIKE $1 ORDER BY symbol ASC LIMIT $2', [searchQuery, limit]);
        return rows.map(this.rowToAsset);
    }
    static async getTopMovers(limit = 10) {
        const rows = await queryDb('SELECT * FROM market_assets ORDER BY ABS(change) DESC LIMIT $1', [limit]);
        return rows.map(this.rowToAsset);
    }
}
//# sourceMappingURL=asset.model.js.map