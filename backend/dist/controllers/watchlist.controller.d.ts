import { Request, Response } from 'express';
export declare class WatchlistController {
    /**
     * Get user's watchlist
     * GET /api/watchlists
     */
    static getWatchlist(req: Request, res: Response): Promise<void>;
    /**
     * Add asset to watchlist
     * POST /api/watchlists
     */
    static addToWatchlist(req: Request, res: Response): Promise<void>;
    /**
     * Remove asset from watchlist
     * DELETE /api/watchlists/:assetId
     */
    static removeFromWatchlist(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=watchlist.controller.d.ts.map