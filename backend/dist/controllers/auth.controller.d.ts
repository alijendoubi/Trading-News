import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * Register a new user
     * POST /api/auth/register
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * Login user
     * POST /api/auth/login
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * Refresh access token
     * POST /api/auth/refresh
     */
    static refresh(req: Request, res: Response): Promise<void>;
    /**
     * Get current user profile
     * GET /api/auth/me
     */
    static getProfile(req: Request, res: Response): Promise<void>;
    /**
     * Logout user (client-side token removal)
     * POST /api/auth/logout
     */
    static logout(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map