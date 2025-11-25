import { AlertModel } from '../models/alert.model.js';
import { AssetModel } from '../models/asset.model.js';
import { logger } from '../config/logger.js';
export class AlertsService {
    /**
     * Get user's alerts
     */
    static async getUserAlerts(userId) {
        try {
            const alerts = await AlertModel.getUserAlerts(userId);
            return { alerts, total: alerts.length };
        }
        catch (error) {
            logger.error('Error getting alerts:', error);
            throw error;
        }
    }
    /**
     * Create new alert
     */
    static async createAlert(userId, type, settings) {
        try {
            // Validate alert type
            if (!['price', 'event'].includes(type)) {
                throw new Error('Invalid alert type');
            }
            // Validate price alert settings
            if (type === 'price') {
                if (!settings.assetId || !settings.condition || !settings.targetPrice) {
                    throw new Error('Invalid price alert settings');
                }
                // Check if asset exists
                const asset = await AssetModel.findById(settings.assetId);
                if (!asset) {
                    throw new Error('Asset not found');
                }
            }
            const alert = await AlertModel.create(userId, type, settings);
            logger.info(`User ${userId} created ${type} alert`);
            return alert;
        }
        catch (error) {
            logger.error('Error creating alert:', error);
            throw error;
        }
    }
    /**
     * Update alert
     */
    static async updateAlert(alertId, userId, settings, isActive) {
        try {
            const alert = await AlertModel.update(alertId, userId, settings, isActive);
            if (!alert) {
                throw new Error('Alert not found');
            }
            logger.info(`User ${userId} updated alert ${alertId}`);
            return alert;
        }
        catch (error) {
            logger.error('Error updating alert:', error);
            throw error;
        }
    }
    /**
     * Delete alert
     */
    static async deleteAlert(alertId, userId) {
        try {
            const deleted = await AlertModel.delete(alertId, userId);
            if (!deleted) {
                throw new Error('Alert not found');
            }
            logger.info(`User ${userId} deleted alert ${alertId}`);
            return { success: true };
        }
        catch (error) {
            logger.error('Error deleting alert:', error);
            throw error;
        }
    }
    /**
     * Check price alerts and trigger notifications
     * Called by cron job
     */
    static async checkPriceAlerts() {
        try {
            const alerts = await AlertModel.getActivePriceAlerts();
            for (const alert of alerts) {
                try {
                    const settings = alert.settings;
                    const asset = await AssetModel.findById(settings.assetId);
                    if (!asset)
                        continue;
                    const currentPrice = asset.lastPrice;
                    const targetPrice = parseFloat(settings.targetPrice);
                    const condition = settings.condition;
                    let triggered = false;
                    if (condition === 'above' && currentPrice > targetPrice) {
                        triggered = true;
                    }
                    else if (condition === 'below' && currentPrice < targetPrice) {
                        triggered = true;
                    }
                    if (triggered) {
                        logger.info(`Alert ${alert.id} triggered: ${asset.symbol} ${condition} ${targetPrice}`);
                        // TODO: Send notification (email, push, etc.)
                        // Deactivate alert after triggering
                        await AlertModel.update(alert.id, alert.user_id, settings, false);
                    }
                }
                catch (error) {
                    logger.warn(`Failed to check alert ${alert.id}:`, error);
                }
            }
        }
        catch (error) {
            logger.error('Error checking price alerts:', error);
        }
    }
}
//# sourceMappingURL=alerts.service.js.map