import { Pool } from 'pg';
export declare const pool: Pool;
export declare function queryDb<T>(text: string, params?: (string | number | boolean | null)[]): Promise<T[]>;
export declare function queryDbSingle<T>(text: string, params?: (string | number | boolean | null)[]): Promise<T | null>;
export declare function initializeDb(): Promise<void>;
export declare function closeDb(): Promise<void>;
//# sourceMappingURL=db.d.ts.map