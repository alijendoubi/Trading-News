import { Collections, getDb, getDocumentById, createDocument, updateDocument, deleteDocument } from '../config/firestore.js';

export interface AlertRow {
  id: string;
  user_id: string;
  type: string;
  settings: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AlertModel {
  /**
   * Get user's alerts
   */
  static async getUserAlerts(userId: string): Promise<AlertRow[]> {
    const db = getDb();
    const snapshot = await db.collection(Collections.USER_ALERTS)
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AlertRow[];
  }

  /**
   * Get single alert by ID
   */
  static async findById(id: string): Promise<AlertRow | null> {
    return getDocumentById<AlertRow>(Collections.USER_ALERTS, id);
  }

  /**
   * Create new alert
   */
  static async create(
    userId: string,
    type: string,
    settings: any
  ): Promise<AlertRow> {
    const alertData = {
      user_id: userId,
      type,
      settings,
      is_active: true,
    };
    return createDocument<AlertRow>(Collections.USER_ALERTS, alertData);
  }

  /**
   * Update alert
   */
  static async update(
    id: string,
    userId: string,
    settings: any,
    isActive: boolean
  ): Promise<AlertRow | null> {
    const db = getDb();
    const docRef = db.collection(Collections.USER_ALERTS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.user_id !== userId) {
      return null;
    }

    return updateDocument<AlertRow>(Collections.USER_ALERTS, id, {
      settings,
      is_active: isActive,
    });
  }

  /**
   * Delete alert
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const db = getDb();
    const docRef = db.collection(Collections.USER_ALERTS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.user_id !== userId) {
      return false;
    }

    await deleteDocument(Collections.USER_ALERTS, id);
    return true;
  }

  /**
   * Get all active price alerts
   */
  static async getActivePriceAlerts(): Promise<AlertRow[]> {
    const db = getDb();
    const snapshot = await db.collection(Collections.USER_ALERTS)
      .where('is_active', '==', true)
      .where('type', '==', 'price')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AlertRow[];
  }
}
