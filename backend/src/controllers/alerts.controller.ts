import { Request, Response } from 'express';
import { AlertsService } from '../services/alerts.service.js';
import { successResponse, errorResponse } from '../utils/http-response.js';
import { logger } from '../config/logger.js';

export class AlertsController {
  /**
   * Get user's alerts
   * GET /api/alerts
   */
  static async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const result = await AlertsService.getUserAlerts(userId);
      successResponse(res, result);
    } catch (error) {
      logger.error('Get alerts error:', error);
      errorResponse(res, 'Failed to get alerts', 500);
    }
  }

  /**
   * Create new alert
   * POST /api/alerts
   */
  static async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { type, settings } = req.body;

      if (!type || !settings) {
        errorResponse(res, 'Type and settings are required', 400);
        return;
      }

      const result = await AlertsService.createAlert(userId, type, settings);
      successResponse(res, result, 'Alert created', 201);
    } catch (error: any) {
      logger.error('Create alert error:', error);
      if (error.message.includes('Invalid')) {
        errorResponse(res, error.message, 400);
      } else if (error.message === 'Asset not found') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, 'Failed to create alert', 500);
      }
    }
  }

  /**
   * Update alert
   * PUT /api/alerts/:id
   */
  static async updateAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const alertId = parseInt(req.params.id);
      const { settings, isActive } = req.body;

      if (isNaN(alertId)) {
        errorResponse(res, 'Invalid alert ID', 400);
        return;
      }

      if (!settings || isActive === undefined) {
        errorResponse(res, 'Settings and isActive are required', 400);
        return;
      }

      const result = await AlertsService.updateAlert(alertId, userId, settings, isActive);
      successResponse(res, result, 'Alert updated');
    } catch (error: any) {
      logger.error('Update alert error:', error);
      if (error.message === 'Alert not found') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, 'Failed to update alert', 500);
      }
    }
  }

  /**
   * Delete alert
   * DELETE /api/alerts/:id
   */
  static async deleteAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const alertId = parseInt(req.params.id);

      if (isNaN(alertId)) {
        errorResponse(res, 'Invalid alert ID', 400);
        return;
      }

      const result = await AlertsService.deleteAlert(alertId, userId);
      successResponse(res, result, 'Alert deleted');
    } catch (error: any) {
      logger.error('Delete alert error:', error);
      if (error.message === 'Alert not found') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, 'Failed to delete alert', 500);
      }
    }
  }
}
