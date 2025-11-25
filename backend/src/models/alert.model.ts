import { queryDb, queryDbSingle } from '../config/db.js';

export interface AlertRow {
  id: number;
  user_id: number;
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
  static async getUserAlerts(userId: number): Promise<AlertRow[]> {
    return queryDb<AlertRow>(
      `SELECT * FROM user_alerts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
  }

  /**
   * Get single alert by ID
   */
  static async findById(id: number): Promise<AlertRow | null> {
    return queryDbSingle<AlertRow>(
      `SELECT * FROM user_alerts WHERE id = $1`,
      [id]
    );
  }

  /**
   * Create new alert
   */
  static async create(
    userId: number,
    type: string,
    settings: any
  ): Promise<AlertRow> {
    const result = await queryDb<AlertRow>(
      `INSERT INTO user_alerts (user_id, type, settings)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, type, JSON.stringify(settings)]
    );
    return result[0];
  }

  /**
   * Update alert
   */
  static async update(
    id: number,
    userId: number,
    settings: any,
    isActive: boolean
  ): Promise<AlertRow | null> {
    const result = await queryDb<AlertRow>(
      `UPDATE user_alerts
       SET settings = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [JSON.stringify(settings), isActive, id, userId]
    );
    return result[0] || null;
  }

  /**
   * Delete alert
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await queryDb(
      `DELETE FROM user_alerts
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
    return result.length > 0;
  }

  /**
   * Get all active price alerts
   */
  static async getActivePriceAlerts(): Promise<AlertRow[]> {
    return queryDb<AlertRow>(
      `SELECT * FROM user_alerts
       WHERE is_active = true AND type = 'price'`
    );
  }
}
