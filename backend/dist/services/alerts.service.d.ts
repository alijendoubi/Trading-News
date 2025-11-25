export declare class AlertsService {
    /**
     * Get user's alerts
     */
    static getUserAlerts(userId: number): Promise<{
        alerts: import("../models/alert.model.js").AlertRow[];
        total: number;
    }>;
    /**
     * Create new alert
     */
    static createAlert(userId: number, type: string, settings: any): Promise<import("../models/alert.model.js").AlertRow>;
    /**
     * Update alert
     */
    static updateAlert(alertId: number, userId: number, settings: any, isActive: boolean): Promise<import("../models/alert.model.js").AlertRow>;
    /**
     * Delete alert
     */
    static deleteAlert(alertId: number, userId: number): Promise<{
        success: boolean;
    }>;
    /**
     * Check price alerts and trigger notifications
     * Called by cron job
     */
    static checkPriceAlerts(): Promise<void>;
}
//# sourceMappingURL=alerts.service.d.ts.map