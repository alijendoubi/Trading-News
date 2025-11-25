export interface AlertRow {
    id: number;
    user_id: number;
    type: string;
    settings: any;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class AlertModel {
    /**
     * Get user's alerts
     */
    static getUserAlerts(userId: number): Promise<AlertRow[]>;
    /**
     * Get single alert by ID
     */
    static findById(id: number): Promise<AlertRow | null>;
    /**
     * Create new alert
     */
    static create(userId: number, type: string, settings: any): Promise<AlertRow>;
    /**
     * Update alert
     */
    static update(id: number, userId: number, settings: any, isActive: boolean): Promise<AlertRow | null>;
    /**
     * Delete alert
     */
    static delete(id: number, userId: number): Promise<boolean>;
    /**
     * Get all active price alerts
     */
    static getActivePriceAlerts(): Promise<AlertRow[]>;
}
//# sourceMappingURL=alert.model.d.ts.map