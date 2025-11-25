import { Request, Response } from 'express';
export declare class AlertsController {
    /**
     * Get user's alerts
     * GET /api/alerts
     */
    static getAlerts(req: Request, res: Response): Promise<void>;
    /**
     * Create new alert
     * POST /api/alerts
     */
    static createAlert(req: Request, res: Response): Promise<void>;
    /**
     * Update alert
     * PUT /api/alerts/:id
     */
    static updateAlert(req: Request, res: Response): Promise<void>;
    /**
     * Delete alert
     * DELETE /api/alerts/:id
     */
    static deleteAlert(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=alerts.controller.d.ts.map