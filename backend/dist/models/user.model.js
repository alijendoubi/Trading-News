import { queryDb, queryDbSingle } from '../config/db.js';
export class UserModel {
    static async findByEmail(email) {
        return queryDbSingle('SELECT * FROM users WHERE email = $1', [email]);
    }
    static async findById(id) {
        return queryDbSingle('SELECT * FROM users WHERE id = $1', [id]);
    }
    static async create(email, passwordHash, name) {
        const result = await queryDb('INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *', [email, passwordHash, name]);
        return result[0];
    }
    static async updatePreferences(userId, preferences) {
        const result = await queryDb('UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [JSON.stringify(preferences), userId]);
        return result[0];
    }
    static async getAll(limit = 50, offset = 0) {
        const [users, countResult] = await Promise.all([
            queryDb('SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM users'),
        ]);
        return {
            users,
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
}
//# sourceMappingURL=user.model.js.map