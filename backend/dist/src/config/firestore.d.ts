import admin from 'firebase-admin';
/**
 * Get Firestore database instance
 */
export declare function getDb(): admin.firestore.Firestore;
/**
 * Collection names
 */
export declare const Collections: {
    readonly USERS: "users";
    readonly ECONOMIC_EVENTS: "economic_events";
    readonly MARKET_ASSETS: "market_assets";
    readonly NEWS_ARTICLES: "news_articles";
    readonly USER_ALERTS: "user_alerts";
    readonly USER_WATCHLISTS: "user_watchlists";
};
/**
 * Generic query function with error handling
 */
export declare function queryCollection<T>(collectionName: string, queryFn?: (ref: admin.firestore.CollectionReference) => admin.firestore.Query): Promise<T[]>;
/**
 * Get a single document by ID
 */
export declare function getDocumentById<T>(collectionName: string, docId: string): Promise<T | null>;
/**
 * Create a new document
 */
export declare function createDocument<T>(collectionName: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>, customId?: string): Promise<T>;
/**
 * Update a document
 */
export declare function updateDocument<T>(collectionName: string, docId: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T>;
/**
 * Delete a document
 */
export declare function deleteDocument(collectionName: string, docId: string): Promise<void>;
/**
 * Query with pagination
 */
export declare function queryWithPagination<T>(collectionName: string, queryFn: (ref: admin.firestore.CollectionReference) => admin.firestore.Query, limit: number, offset: number): Promise<{
    items: T[];
    total: number;
}>;
/**
 * Batch write helper
 */
export declare function getBatch(): admin.firestore.WriteBatch;
/**
 * Transaction helper
 */
export declare function runTransaction<T>(updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>): Promise<T>;
//# sourceMappingURL=firestore.d.ts.map