import { queryDb, queryDbSingle } from '../config/db.js';
export class EventModel {
    static rowToEvent(row) {
        return {
            id: row.id.toString(),
            title: row.title,
            date: row.event_date,
            impact: row.impact,
            country: row.country,
            forecast: row.forecast,
            actual: row.actual,
            previous: row.previous,
            description: row.description,
        };
    }
    static async findById(id) {
        const row = await queryDbSingle('SELECT * FROM economic_events WHERE id = $1', [id]);
        return row ? this.rowToEvent(row) : null;
    }
    static async findUpcoming(limit = 20, offset = 0) {
        const [rows, countResult] = await Promise.all([
            queryDb('SELECT * FROM economic_events WHERE event_date >= NOW() ORDER BY event_date ASC LIMIT $1 OFFSET $2', [limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM economic_events WHERE event_date >= NOW()'),
        ]);
        return {
            events: rows.map(this.rowToEvent),
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    static async findByCountry(country, limit = 20, offset = 0) {
        const [rows, countResult] = await Promise.all([
            queryDb('SELECT * FROM economic_events WHERE country = $1 AND event_date >= NOW() ORDER BY event_date ASC LIMIT $2 OFFSET $3', [country, limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM economic_events WHERE country = $1 AND event_date >= NOW()', [country]),
        ]);
        return {
            events: rows.map(this.rowToEvent),
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    static async findByImpact(impact, limit = 20, offset = 0) {
        const [rows, countResult] = await Promise.all([
            queryDb('SELECT * FROM economic_events WHERE impact = $1 AND event_date >= NOW() ORDER BY event_date ASC LIMIT $2 OFFSET $3', [impact, limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM economic_events WHERE impact = $1 AND event_date >= NOW()', [impact]),
        ]);
        return {
            events: rows.map(this.rowToEvent),
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    static async create(event) {
        const result = await queryDb(`INSERT INTO economic_events (title, event_date, impact, country, forecast, actual, previous, description, source_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [event.title, event.event_date, event.impact, event.country, event.forecast, event.actual, event.previous, event.description, event.source_id]);
        return this.rowToEvent(result[0]);
    }
    static async update(id, event) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.entries(event).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });
        values.push(id);
        const result = await queryDb(`UPDATE economic_events SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`, values);
        return this.rowToEvent(result[0]);
    }
    static async deleteOld(days = 90) {
        const result = await queryDb('DELETE FROM economic_events WHERE event_date < NOW() - INTERVAL $1 DAY', [days]);
        return result.length;
    }
    static async findByTitleAndDate(title, date) {
        const row = await queryDbSingle('SELECT * FROM economic_events WHERE title = $1 AND event_date = $2', [title, date]);
        return row ? this.rowToEvent(row) : null;
    }
}
//# sourceMappingURL=event.model.js.map