export interface AlertRow {
    id: string;
    user_id: string;
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
    static getUserAlerts(userId: string): Promise<AlertRow[]>;
    /**
     * Get single alert by ID
     */
    static findById(id: string): Promise<AlertRow | null>;
    /**
     * Create new alert
     */
    static create(userId: string, type: string, settings: any): Promise<AlertRow>;
    /**
     * Update alert
     */
    static update(id: string, userId: string, settings: any, isActive: boolean): Promise<AlertRow | null>;
    /**
     * Delete alert
     */
    static delete(id: string, userId: string): Promise<boolean>;
    /**
     * Get all active price alerts
     */
    static getActivePriceAlerts(): Promise<AlertRow[]>;
}
//# sourceMappingURL=alert.model.d.ts.map