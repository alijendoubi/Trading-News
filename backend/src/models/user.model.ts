import { Collections, getDb, getDocumentById, createDocument, updateDocument, queryWithPagination } from '../config/firestore.js';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  preferences: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<UserRow | null> {
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
    } as UserRow;
  }

  static async findById(id: string): Promise<UserRow | null> {
    return getDocumentById<UserRow>(Collections.USERS, id);
  }

  static async create(email: string, passwordHash: string, name: string): Promise<UserRow> {
    const userData = {
      email,
      password_hash: passwordHash,
      name,
      preferences: { theme: 'light', notifications: true, defaultCurrency: 'USD' },
    };
    return createDocument<UserRow>(Collections.USERS, userData);
  }

  static async updatePreferences(
    userId: string,
    preferences: Record<string, unknown>
  ): Promise<UserRow> {
    return updateDocument<UserRow>(Collections.USERS, userId, { preferences });
  }

  static async getAll(limit = 50, offset = 0): Promise<{ users: UserRow[]; total: number }> {
    const result = await queryWithPagination<UserRow>(
      Collections.USERS,
      (ref) => ref.orderBy('created_at', 'desc'),
      limit,
      offset
    );
    return {
      users: result.items,
      total: result.total,
    };
  }
}
