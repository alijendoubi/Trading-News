import { Request, Response, NextFunction } from 'express';
interface JwtPayload {
    userId: number;
    email: string;
    type: string;
}
declare global {
    namespace Express {
        interface Request {
            userId?: number;
            userEmail?: string;
            user?: JwtPayload;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare const authenticate: typeof authMiddleware;
export declare function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=auth.d.ts.map