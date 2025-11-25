import { queryDb, queryDbSingle } from '../config/db.js';
export class AlertModel {
    /**
     * Get user's alerts
     */
    static async getUserAlerts(userId) {
        return queryDb(`SELECT * FROM user_alerts
       WHERE user_id = $1
       ORDER BY created_at DESC`, [userId]);
    }
    /**
     * Get single alert by ID
     */
    static async findById(id) {
        return queryDbSingle(`SELECT * FROM user_alerts WHERE id = $1`, [id]);
    }
    /**
     * Create new alert
     */
    static async create(userId, type, settings) {
        const result = await queryDb(`INSERT INTO user_alerts (user_id, type, settings)
       VALUES ($1, $2, $3)
       RETURNING *`, [userId, type, JSON.stringify(settings)]);
        return result[0];
    }
    /**
     * Update alert
     */
    static async update(id, userId, settings, isActive) {
        const result = await queryDb(`UPDATE user_alerts
       SET settings = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`, [JSON.stringify(settings), isActive, id, userId]);
        return result[0] || null;
    }
    /**
     * Delete alert
     */
    static async delete(id, userId) {
        const result = await queryDb(`DELETE FROM user_alerts
       WHERE id = $1 AND user_id = $2
       RETURNING id`, [id, userId]);
        return result.length > 0;
    }
    /**
     * Get all active price alerts
     */
    static async getActivePriceAlerts() {
        return queryDb(`SELECT * FROM user_alerts
       WHERE is_active = true AND type = 'price'`);
    }
}
//# sourceMappingURL=alert.model.js.map