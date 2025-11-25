import { WatchlistService } from '../services/watchlist.service.js';
import { successResponse, errorResponse } from '../utils/http-response.js';
import { logger } from '../config/logger.js';
export class WatchlistController {
    /**
     * Get user's watchlist
     * GET /api/watchlists
     */
    static async getWatchlist(req, res) {
        try {
            const userId = req.userId;
            const result = await WatchlistService.getUserWatchlist(userId);
            successResponse(res, result);
        }
        catch (error) {
            logger.error('Get watchlist error:', error);
            errorResponse(res, 'Failed to get watchlist', 500);
        }
    }
    /**
     * Add asset to watchlist
     * POST /api/watchlists
     */
    static async addToWatchlist(req, res) {
        try {
            const userId = req.userId;
            const { assetId } = req.body;
            if (!assetId) {
                errorResponse(res, 'Asset ID is required', 400);
                return;
            }
            const result = await WatchlistService.addToWatchlist(userId, assetId);
            successResponse(res, result, 'Asset added to watchlist', 201);
        }
        catch (error) {
            logger.error('Add to watchlist error:', error);
            if (error.message === 'Asset not found') {
                errorResponse(res, error.message, 404);
            }
            else if (error.message === 'Asset already in watchlist') {
                errorResponse(res, error.message, 409);
            }
            else {
                errorResponse(res, 'Failed to add to watchlist', 500);
            }
        }
    }
    /**
     * Remove asset from watchlist
     * DELETE /api/watchlists/:assetId
     */
    static async removeFromWatchlist(req, res) {
        try {
            const userId = req.userId;
            const assetId = req.params.assetId;
            if (!assetId) {
                errorResponse(res, 'Invalid asset ID', 400);
                return;
            }
            const result = await WatchlistService.removeFromWatchlist(userId, assetId);
            successResponse(res, result, 'Asset removed from watchlist');
        }
        catch (error) {
            logger.error('Remove from watchlist error:', error);
            if (error.message === 'Asset not found in watchlist') {
                errorResponse(res, error.message, 404);
            }
            else {
                errorResponse(res, 'Failed to remove from watchlist', 500);
            }
        }
    }
}
//# sourceMappingURL=watchlist.controller.js.map