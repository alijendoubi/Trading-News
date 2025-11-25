import { Collections, getDb, getDocumentById, createDocument, updateDocument, queryWithPagination } from '../config/firestore.js';
import type { EconomicEvent } from '../types/common.types.js';
import admin from 'firebase-admin';

export interface EventRow {
  id: string;
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

  static async findById(id: string): Promise<EconomicEvent | null> {
    const row = await getDocumentById<EventRow>(Collections.ECONOMIC_EVENTS, id);
    return row ? this.rowToEvent(row) : null;
  }

  static async findUpcoming(limit = 20, offset = 0): Promise<{ events: EconomicEvent[]; total: number }> {
    const now = admin.firestore.Timestamp.now();
    const result = await queryWithPagination<EventRow>(
      Collections.ECONOMIC_EVENTS,
      (ref) => ref.where('event_date', '>=', now).orderBy('event_date', 'asc'),
      limit,
      offset
    );
    return {
      events: result.items.map(this.rowToEvent),
      total: result.total,
    };
  }

  static async findByCountry(country: string, limit = 20, offset = 0): Promise<{ events: EconomicEvent[]; total: number }> {
    const now = admin.firestore.Timestamp.now();
    const result = await queryWithPagination<EventRow>(
      Collections.ECONOMIC_EVENTS,
      (ref) => ref.where('country', '==', country).where('event_date', '>=', now).orderBy('event_date', 'asc'),
      limit,
      offset
    );
    return {
      events: result.items.map(this.rowToEvent),
      total: result.total,
    };
  }

  static async findByImpact(impact: string, limit = 20, offset = 0): Promise<{ events: EconomicEvent[]; total: number }> {
    const now = admin.firestore.Timestamp.now();
    const result = await queryWithPagination<EventRow>(
      Collections.ECONOMIC_EVENTS,
      (ref) => ref.where('impact', '==', impact).where('event_date', '>=', now).orderBy('event_date', 'asc'),
      limit,
      offset
    );
    return {
      events: result.items.map(this.rowToEvent),
      total: result.total,
    };
  }

  static async create(event: Omit<EventRow, 'id' | 'created_at' | 'updated_at'>): Promise<EconomicEvent> {
    const row = await createDocument<EventRow>(Collections.ECONOMIC_EVENTS, event);
    return this.rowToEvent(row);
  }

  static async update(id: string, event: Partial<Omit<EventRow, 'id' | 'created_at' | 'updated_at'>>): Promise<EconomicEvent> {
    const row = await updateDocument<EventRow>(Collections.ECONOMIC_EVENTS, id, event);
    return this.rowToEvent(row);
  }

  static async deleteOld(days = 90): Promise<number> {
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

  static async findByTitleAndDate(title: string, date: Date): Promise<EconomicEvent | null> {
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
    const row = { id: doc.id, ...doc.data() } as EventRow;
    return this.rowToEvent(row);
  }
}
