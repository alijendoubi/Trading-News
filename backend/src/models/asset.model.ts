import { Collections, getDb, getDocumentById, createDocument, updateDocument, queryWithPagination } from '../config/firestore.js';
import type { MarketAsset, AssetType } from '../types/common.types.js';

export interface AssetRow {
  id: string;
  symbol: string;
  type: string;
  name: string;
  last_price: number;
  change: number;
  change_amount: number;
  high_24h?: number;
  low_24h?: number;
  volume?: number;
  updated_at: Date;
  created_at: Date;
}

export class AssetModel {
  static rowToAsset(row: AssetRow): MarketAsset {
    return {
      id: row.id.toString(),
      symbol: row.symbol,
      type: row.type as AssetType,
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

  static async findBySymbol(symbol: string): Promise<MarketAsset | null> {
    const db = getDb();
    const snapshot = await db.collection(Collections.MARKET_ASSETS)
      .where('symbol', '==', symbol)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.rowToAsset({ id: doc.id, ...doc.data() } as AssetRow);
  }

  static async findById(id: string): Promise<MarketAsset | null> {
    const row = await getDocumentById<AssetRow>(Collections.MARKET_ASSETS, id);
    return row ? this.rowToAsset(row) : null;
  }

  static async findByType(type: string, limit = 50, offset = 0): Promise<{ assets: MarketAsset[]; total: number }> {
    const result = await queryWithPagination<AssetRow>(
      Collections.MARKET_ASSETS,
      (ref) => ref.where('type', '==', type).orderBy('symbol', 'asc'),
      limit,
      offset
    );
    return {
      assets: result.items.map(this.rowToAsset),
      total: result.total,
    };
  }

  static async getAll(limit = 100, offset = 0): Promise<{ assets: MarketAsset[]; total: number }> {
    const result = await queryWithPagination<AssetRow>(
      Collections.MARKET_ASSETS,
      (ref) => ref.orderBy('symbol', 'asc'),
      limit,
      offset
    );
    return {
      assets: result.items.map(this.rowToAsset),
      total: result.total,
    };
  }

  static async create(asset: Omit<AssetRow, 'id' | 'created_at' | 'updated_at'>): Promise<MarketAsset> {
    const row = await createDocument<AssetRow>(Collections.MARKET_ASSETS, asset);
    return this.rowToAsset(row);
  }

  static async update(id: string, asset: Partial<Omit<AssetRow, 'id' | 'created_at' | 'updated_at'>>): Promise<MarketAsset> {
    const row = await updateDocument<AssetRow>(Collections.MARKET_ASSETS, id, asset);
    return this.rowToAsset(row);
  }

  static async search(query: string, limit = 20): Promise<MarketAsset[]> {
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
    })) as AssetRow[];

    return rows.map(this.rowToAsset);
  }

  static async getTopMovers(limit = 10): Promise<MarketAsset[]> {
    const db = getDb();
    // Firestore doesn't support ABS(), so we fetch more and sort in-memory
    const snapshot = await db.collection(Collections.MARKET_ASSETS)
      .orderBy('change', 'desc')
      .limit(limit * 2)
      .get();

    const rows = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AssetRow[];

    // Sort by absolute value of change
    const sorted = rows.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    return sorted.slice(0, limit).map(this.rowToAsset);
  }
}
