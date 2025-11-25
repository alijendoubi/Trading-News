import admin from 'firebase-admin';
import { getFirestore } from './firebase.js';
import { logger } from './logger.js';

/**
 * Get Firestore database instance
 */
export function getDb(): admin.firestore.Firestore {
  return getFirestore();
}

/**
 * Collection names
 */
export const Collections = {
  USERS: 'users',
  ECONOMIC_EVENTS: 'economic_events',
  MARKET_ASSETS: 'market_assets',
  NEWS_ARTICLES: 'news_articles',
  USER_ALERTS: 'user_alerts',
  USER_WATCHLISTS: 'user_watchlists',
} as const;

/**
 * Generic query function with error handling
 */
export async function queryCollection<T>(
  collectionName: string,
  queryFn?: (ref: admin.firestore.CollectionReference) => admin.firestore.Query
): Promise<T[]> {
  const start = Date.now();
  try {
    const db = getDb();
    const collectionRef = db.collection(collectionName);
    const query = queryFn ? queryFn(collectionRef) : collectionRef;
    const snapshot = await query.get();

    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms) on collection: ${collectionName}`);
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    logger.error('Firestore query error', { error, collection: collectionName });
    throw error;
  }
}

/**
 * Get a single document by ID
 */
export async function getDocumentById<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const db = getDb();
    const docRef = db.collection(collectionName).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as T;
  } catch (error) {
    logger.error('Firestore get document error', { error, collection: collectionName, docId });
    throw error;
  }
}

/**
 * Create a new document
 */
export async function createDocument<T>(
  collectionName: string,
  data: Omit<T, 'id' | 'created_at' | 'updated_at'>,
  customId?: string
): Promise<T> {
  try {
    const db = getDb();
    const collectionRef = db.collection(collectionName);
    
    const now = new Date();
    const docData = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    let docRef: admin.firestore.DocumentReference;
    if (customId) {
      docRef = collectionRef.doc(customId);
      await docRef.set(docData);
    } else {
      docRef = await collectionRef.add(docData);
    }

    return {
      id: docRef.id,
      ...docData,
    } as T;
  } catch (error) {
    logger.error('Firestore create document error', { error, collection: collectionName });
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<Omit<T, 'id' | 'created_at'>>
): Promise<T> {
  try {
    const db = getDb();
    const docRef = db.collection(collectionName).doc(docId);

    const updateData = {
      ...data,
      updated_at: new Date(),
    };

    await docRef.update(updateData);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Document not found');
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as T;
  } catch (error) {
    logger.error('Firestore update document error', { error, collection: collectionName, docId });
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const db = getDb();
    await db.collection(collectionName).doc(docId).delete();
    logger.debug(`Document deleted: ${collectionName}/${docId}`);
  } catch (error) {
    logger.error('Firestore delete document error', { error, collection: collectionName, docId });
    throw error;
  }
}

/**
 * Query with pagination
 */
export async function queryWithPagination<T>(
  collectionName: string,
  queryFn: (ref: admin.firestore.CollectionReference) => admin.firestore.Query,
  limit: number,
  offset: number
): Promise<{ items: T[]; total: number }> {
  try {
    const db = getDb();
    const collectionRef = db.collection(collectionName);
    
    // Get total count
    const baseQuery = queryFn(collectionRef);
    const countSnapshot = await baseQuery.count().get();
    const total = countSnapshot.data().count;

    // Get paginated results
    const paginatedQuery = baseQuery.limit(limit).offset(offset);
    const snapshot = await paginatedQuery.get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    return { items, total };
  } catch (error) {
    logger.error('Firestore pagination query error', { error, collection: collectionName });
    throw error;
  }
}

/**
 * Batch write helper
 */
export function getBatch(): admin.firestore.WriteBatch {
  const db = getDb();
  return db.batch();
}

/**
 * Transaction helper
 */
export async function runTransaction<T>(
  updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
): Promise<T> {
  const db = getDb();
  return db.runTransaction(updateFunction);
}
