import { WatchlistModel } from '../models/watchlist.model.js';
import { AssetModel } from '../models/asset.model.js';
import { logger } from '../config/logger.js';

export class WatchlistService {
  /**
   * Get user's watchlist
   */
  static async getUserWatchlist(userId: string) {
    try {
      const watchlist = await WatchlistModel.getUserWatchlist(userId);
      return { watchlist, total: watchlist.length };
    } catch (error) {
      logger.error('Error getting watchlist:', error);
      throw error;
    }
  }

  /**
   * Add asset to watchlist
   */
  static async addToWatchlist(userId: string, assetId: string) {
    try {
      // Check if asset exists
      const asset = await AssetModel.findById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      // Check if already in watchlist
      const exists = await WatchlistModel.isInWatchlist(userId, assetId);
      if (exists) {
        throw new Error('Asset already in watchlist');
      }

      const result = await WatchlistModel.addToWatchlist(userId, assetId);
      logger.info(`User ${userId} added asset ${assetId} to watchlist`);
      return result;
    } catch (error) {
      logger.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  /**
   * Remove asset from watchlist
   */
  static async removeFromWatchlist(userId: string, assetId: string) {
    try {
      const removed = await WatchlistModel.removeFromWatchlist(userId, assetId);
      if (!removed) {
        throw new Error('Asset not found in watchlist');
      }
      logger.info(`User ${userId} removed asset ${assetId} from watchlist`);
      return { success: true };
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
      throw error;
    }
  }
}
