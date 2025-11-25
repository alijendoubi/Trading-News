import { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '../types/api.js';

export class HttpResponse {
  static success<T>(res: Response, data: T, message = 'Success', status = 200): Response {
    return res.status(status).json({
      success: true,
      data,
      message,
    } as ApiResponse<T>);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    status = 200
  ): Response {
    const hasMore = page * pageSize < total;
    return res.status(status).json({
      success: true,
      data: {
        data,
        total,
        page,
        pageSize,
        hasMore,
      } as PaginatedResponse<T>,
    } as ApiResponse<PaginatedResponse<T>>);
  }

  static error(res: Response, error: string, status = 400, details?: unknown): Response {
    const response: any = {
      success: false,
      error,
    };
    if (details) {
      response.details = details;
    }
    return res.status(status).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static conflict(res: Response, message = 'Resource already exists'): Response {
    return this.error(res, message, 409);
  }

  static unprocessable(res: Response, message = 'Unprocessable entity', details?: unknown): Response {
    return this.error(res, message, 422, details);
  }

  static internalError(res: Response, message = 'Internal server error'): Response {
    return this.error(res, message, 500);
  }
}

// Helper functions for convenience
export const successResponse = <T>(res: Response, data: T, message = 'Success', status = 200): Response => {
  return HttpResponse.success(res, data, message, status);
};

export const errorResponse = (res: Response, error: string, status = 400, details?: unknown): Response => {
  return HttpResponse.error(res, error, status, details);
};
