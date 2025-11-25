import { Collections, getDb, getDocumentById, createDocument, updateDocument, queryWithPagination } from '../config/firestore.js';
import admin from 'firebase-admin';
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
        const row = await getDocumentById(Collections.ECONOMIC_EVENTS, id);
        return row ? this.rowToEvent(row) : null;
    }
    static async findUpcoming(limit = 20, offset = 0) {
        const now = admin.firestore.Timestamp.now();
        const result = await queryWithPagination(Collections.ECONOMIC_EVENTS, (ref) => ref.where('event_date', '>=', now).orderBy('event_date', 'asc'), limit, offset);
        return {
            events: result.items.map(this.rowToEvent),
            total: result.total,
        };
    }
    static async findByCountry(country, limit = 20, offset = 0) {
        const now = admin.firestore.Timestamp.now();
        const result = await queryWithPagination(Collections.ECONOMIC_EVENTS, (ref) => ref.where('country', '==', country).where('event_date', '>=', now).orderBy('event_date', 'asc'), limit, offset);
        return {
            events: result.items.map(this.rowToEvent),
            total: result.total,
        };
    }
    static async findByImpact(impact, limit = 20, offset = 0) {
        const now = admin.firestore.Timestamp.now();
        const result = await queryWithPagination(Collections.ECONOMIC_EVENTS, (ref) => ref.where('impact', '==', impact).where('event_date', '>=', now).orderBy('event_date', 'asc'), limit, offset);
        return {
            events: result.items.map(this.rowToEvent),
            total: result.total,
        };
    }
    static async create(event) {
        const row = await createDocument(Collections.ECONOMIC_EVENTS, event);
        return this.rowToEvent(row);
    }
    static async update(id, event) {
        const row = await updateDocument(Collections.ECONOMIC_EVENTS, id, event);
        return this.rowToEvent(row);
    }
    static async deleteOld(days = 90) {
        const db = getDb();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);
        const snapshot = await db.collection(Collections.ECONOMIC_EVENTS)
            .where('event_date', '<', cutoffTimestamp)
            .get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        return snapshot.size;
    }
    static async findByTitleAndDate(title, date) {
        const db = getDb();
        const timestamp = admin.firestore.Timestamp.fromDate(date);
        const snapshot = await db.collection(Collections.ECONOMIC_EVENTS)
            .where('title', '==', title)
            .where('event_date', '==', timestamp)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        const row = { id: doc.id, ...doc.data() };
        return this.rowToEvent(row);
    }
}
//# sourceMappingURL=event.model.js.map