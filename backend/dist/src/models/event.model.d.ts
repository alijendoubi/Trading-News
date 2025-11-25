import type { EconomicEvent } from '../../../common/types.js';
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
export declare class EventModel {
    static rowToEvent(row: EventRow): EconomicEvent;
    static findById(id: string): Promise<EconomicEvent | null>;
    static findUpcoming(limit?: number, offset?: number): Promise<{
        events: EconomicEvent[];
        total: number;
    }>;
    static findByCountry(country: string, limit?: number, offset?: number): Promise<{
        events: EconomicEvent[];
        total: number;
    }>;
    static findByImpact(impact: string, limit?: number, offset?: number): Promise<{
        events: EconomicEvent[];
        total: number;
    }>;
    static create(event: Omit<EventRow, 'id' | 'created_at' | 'updated_at'>): Promise<EconomicEvent>;
    static update(id: string, event: Partial<Omit<EventRow, 'id' | 'created_at' | 'updated_at'>>): Promise<EconomicEvent>;
    static deleteOld(days?: number): Promise<number>;
    static findByTitleAndDate(title: string, date: Date): Promise<EconomicEvent | null>;
}
//# sourceMappingURL=event.model.d.ts.map