import { queryDb, queryDbSingle } from '../config/db.js';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  preferences: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<UserRow | null> {
    return queryDbSingle<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  }

  static async findById(id: number): Promise<UserRow | null> {
    return queryDbSingle<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
  }

  static async create(email: string, passwordHash: string): Promise<UserRow> {
    const result = await queryDb<UserRow>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, passwordHash]
    );
    return result[0];
  }

  static async updatePreferences(
    userId: number,
    preferences: Record<string, unknown>
  ): Promise<UserRow> {
    const result = await queryDb<UserRow>(
      'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [JSON.stringify(preferences), userId]
    );
    return result[0];
  }

  static async getAll(limit = 50, offset = 0): Promise<{ users: UserRow[]; total: number }> {
    const [users, countResult] = await Promise.all([
      queryDb<UserRow>(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      queryDb<{ count: string }>('SELECT COUNT(*) as count FROM users'),
    ]);
    return {
      users,
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }
}
