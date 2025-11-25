import { queryDb, queryDbSingle } from '../config/db.js';
import type { EconomicEvent } from '../../../common/types.js';

export interface EventRow {
  id: number;
  title: string;
  event_date: Date;
  impact: string;
  country: string;
  forecast?: number;
  actual?: number;
  previous?: number;
  description?: string;
  source_id?: string;
  created_at: Date;
  updated_at: Date;
}

export class EventModel {
  static rowToEvent(row: EventRow): EconomicEvent {
    return {
      id: row.id.toString(),
      title: row.title,
      date: row.event_date,
      impact: row.impact as 'Low' | 'Medium' | 'High',
      country: row.country,
      forecast: row.forecast,
      actual: row.actual,
      previous: row.previous,
      description: row.description,
    };
  }

  static async findById(id: number): Promise<EconomicEvent | null> {
    const row = await queryDbSingle<EventRow>(
      'SELECT * FROM economic_events WHERE id = $1',
      [id]
    );
    return row ? this.rowToEvent(row) : null;
  }

  static async findUpcoming(limit = 20, offset = 0): Promise<{ events: EconomicEvent[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      queryDb<EventRow>(
        'SELECT * FROM economic_events WHERE event_date >= NOW() ORDER BY event_date ASC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      queryDb<{ count: string }>('SELECT COUNT(*) as count FROM economic_events WHERE event_date >= NOW()'),
    ]);
    return {
      events: rows.map(this.rowToEvent),
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }

  static async findByCountry(country: string, limit = 20, offset = 0): Promise<{ events: EconomicEvent[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      queryDb<EventRow>(
        'SELECT * FROM economic_events WHERE country = $1 AND event_date >= NOW() ORDER BY event_date ASC LIMIT $2 OFFSET $3',
        [country, limit, offset]
      ),
      queryDb<{ count: string }>(
        'SELECT COUNT(*) as count FROM economic_events WHERE country = $1 AND event_date >= NOW()',
        [country]
      ),
    ]);
    return {
      events: rows.map(this.rowToEvent),
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }

  static async findByImpact(impact: string, limit = 20, offset = 0): Promise<{ events: EconomicEvent[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      queryDb<EventRow>(
        'SELECT * FROM economic_events WHERE impact = $1 AND event_date >= NOW() ORDER BY event_date ASC LIMIT $2 OFFSET $3',
        [impact, limit, offset]
      ),
      queryDb<{ count: string }>(
        'SELECT COUNT(*) as count FROM economic_events WHERE impact = $1 AND event_date >= NOW()',
        [impact]
      ),
    ]);
    return {
      events: rows.map(this.rowToEvent),
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }

  static async create(event: Omit<EventRow, 'id' | 'created_at' | 'updated_at'>): Promise<EconomicEvent> {
    const result = await queryDb<EventRow>(
      `INSERT INTO economic_events (title, event_date, impact, country, forecast, actual, previous, description, source_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [event.title, event.event_date, event.impact, event.country, event.forecast, event.actual, event.previous, event.description, event.source_id]
    );
    return this.rowToEvent(result[0]);
  }

  static async update(id: number, event: Partial<Omit<EventRow, 'id' | 'created_at' | 'updated_at'>>): Promise<EconomicEvent> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(event).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);
    const result = await queryDb<EventRow>(
      `UPDATE economic_events SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return this.rowToEvent(result[0]);
  }

  static async deleteOld(days = 90): Promise<number> {
    const result = await queryDb(
      'DELETE FROM economic_events WHERE event_date < NOW() - INTERVAL $1 DAY',
      [days]
    );
    return result.length;
  }

  static async findByTitleAndDate(title: string, date: Date): Promise<EconomicEvent | null> {
    const row = await queryDbSingle<EventRow>(
      'SELECT * FROM economic_events WHERE title = $1 AND event_date = $2',
      [title, date]
    );
    return row ? this.rowToEvent(row) : null;
  }
}
