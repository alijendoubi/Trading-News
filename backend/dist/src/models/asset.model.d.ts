import type { MarketAsset } from '../../../common/types.js';
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
export declare class AssetModel {
    static rowToAsset(row: AssetRow): MarketAsset;
    static findBySymbol(symbol: string): Promise<MarketAsset | null>;
    static findById(id: string): Promise<MarketAsset | null>;
    static findByType(type: string, limit?: number, offset?: number): Promise<{
        assets: MarketAsset[];
        total: number;
    }>;
    static getAll(limit?: number, offset?: number): Promise<{
        assets: MarketAsset[];
        total: number;
    }>;
    static create(asset: Omit<AssetRow, 'id' | 'created_at' | 'updated_at'>): Promise<MarketAsset>;
    static update(id: string, asset: Partial<Omit<AssetRow, 'id' | 'created_at' | 'updated_at'>>): Promise<MarketAsset>;
    static search(query: string, limit?: number): Promise<MarketAsset[]>;
    static getTopMovers(limit?: number): Promise<MarketAsset[]>;
}
//# sourceMappingURL=asset.model.d.ts.map