export declare class AlertsService {
    /**
     * Get user's alerts
     */
    static getUserAlerts(userId: string): Promise<{
        alerts: import("../models/alert.model.js").AlertRow[];
        total: number;
    }>;
    /**
     * Create new alert
     */
    static createAlert(userId: string, type: string, settings: any): Promise<import("../models/alert.model.js").AlertRow>;
    /**
     * Update alert
     */
    static updateAlert(alertId: string, userId: string, settings: any, isActive: boolean): Promise<import("../models/alert.model.js").AlertRow>;
    /**
     * Delete alert
     */
    static deleteAlert(alertId: string, userId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Check price alerts and trigger notifications
     * Called by cron job
     */
    static checkPriceAlerts(): Promise<void>;
}
//# sourceMappingURL=alerts.service.d.ts.map