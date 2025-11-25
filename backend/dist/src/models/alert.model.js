import { Collections, getDb, getDocumentById, createDocument, updateDocument, deleteDocument } from '../config/firestore.js';
export class AlertModel {
    /**
     * Get user's alerts
     */
    static async getUserAlerts(userId) {
        const db = getDb();
        const snapshot = await db.collection(Collections.USER_ALERTS)
            .where('user_id', '==', userId)
            .orderBy('created_at', 'desc')
            .get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    /**
     * Get single alert by ID
     */
    static async findById(id) {
        return getDocumentById(Collections.USER_ALERTS, id);
    }
    /**
     * Create new alert
     */
    static async create(userId, type, settings) {
        const alertData = {
            user_id: userId,
            type,
            settings,
            is_active: true,
        };
        return createDocument(Collections.USER_ALERTS, alertData);
    }
    /**
     * Update alert
     */
    static async update(id, userId, settings, isActive) {
        const db = getDb();
        const docRef = db.collection(Collections.USER_ALERTS).doc(id);
        const doc = await docRef.get();
        if (!doc.exists || doc.data()?.user_id !== userId) {
            return null;
        }
        return updateDocument(Collections.USER_ALERTS, id, {
            settings,
            is_active: isActive,
        });
    }
    /**
     * Delete alert
     */
    static async delete(id, userId) {
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
    static async getActivePriceAlerts() {
        const db = getDb();
        const snapshot = await db.collection(Collections.USER_ALERTS)
            .where('is_active', '==', true)
            .where('type', '==', 'price')
            .get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
}
//# sourceMappingURL=alert.model.js.map