import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    status?: number;
    details?: unknown;
}
export declare function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=error-handler.d.ts.map