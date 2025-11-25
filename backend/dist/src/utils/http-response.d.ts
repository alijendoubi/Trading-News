import { Response } from 'express';
export declare class HttpResponse {
    static success<T>(res: Response, data: T, message?: string, status?: number): Response;
    static paginated<T>(res: Response, data: T[], total: number, page: number, pageSize: number, status?: number): Response;
    static error(res: Response, error: string, status?: number, details?: unknown): Response;
    static created<T>(res: Response, data: T, message?: string): Response;
    static noContent(res: Response): Response;
    static notFound(res: Response, message?: string): Response;
    static unauthorized(res: Response, message?: string): Response;
    static forbidden(res: Response, message?: string): Response;
    static conflict(res: Response, message?: string): Response;
    static unprocessable(res: Response, message?: string, details?: unknown): Response;
    static internalError(res: Response, message?: string): Response;
}
export declare const successResponse: <T>(res: Response, data: T, message?: string, status?: number) => Response;
export declare const errorResponse: (res: Response, error: string, status?: number, details?: unknown) => Response;
//# sourceMappingURL=http-response.d.ts.map