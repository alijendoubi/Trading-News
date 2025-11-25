import { Collections, getDb, getDocumentById, createDocument, updateDocument, queryWithPagination } from '../config/firestore.js';
export class UserModel {
    static async findByEmail(email) {
        const db = getDb();
        const snapshot = await db.collection(Collections.USERS)
            .where('email', '==', email)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    static async findById(id) {
        return getDocumentById(Collections.USERS, id);
    }
    static async create(email, passwordHash, name) {
        const userData = {
            email,
            password_hash: passwordHash,
            name,
            preferences: { theme: 'light', notifications: true, defaultCurrency: 'USD' },
        };
        return createDocument(Collections.USERS, userData);
    }
    static async updatePreferences(userId, preferences) {
        return updateDocument(Collections.USERS, userId, { preferences });
    }
    static async getAll(limit = 50, offset = 0) {
        const result = await queryWithPagination(Collections.USERS, (ref) => ref.orderBy('created_at', 'desc'), limit, offset);
        return {
            users: result.items,
            total: result.total,
        };
    }
}
//# sourceMappingURL=user.model.js.map