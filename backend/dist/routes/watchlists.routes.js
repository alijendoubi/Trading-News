import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlist.controller.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// All watchlist routes require authentication
router.use(authenticate);
/**
 * @route   GET /api/watchlists
 * @desc    Get user's watchlist
 * @access  Private
 */
router.get('/', WatchlistController.getWatchlist);
/**
 * @route   POST /api/watchlists
 * @desc    Add asset to watchlist
 * @access  Private
 */
router.post('/', WatchlistController.addToWatchlist);
/**
 * @route   DELETE /api/watchlists/:assetId
 * @desc    Remove asset from watchlist
 * @access  Private
 */
router.delete('/:assetId', WatchlistController.removeFromWatchlist);
export default router;
//# sourceMappingURL=watchlists.routes.js.map