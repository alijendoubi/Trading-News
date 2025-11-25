export class HttpResponse {
    static success(res, data, message = 'Success', status = 200) {
        return res.status(status).json({
            success: true,
            data,
            message,
        });
    }
    static paginated(res, data, total, page, pageSize, status = 200) {
        const hasMore = page * pageSize < total;
        return res.status(status).json({
            success: true,
            data: {
                data,
                total,
                page,
                pageSize,
                hasMore,
            },
        });
    }
    static error(res, error, status = 400, details) {
        return res.status(status).json({
            success: false,
            error,
            ...(details && { details }),
        });
    }
    static created(res, data, message = 'Created') {
        return this.success(res, data, message, 201);
    }
    static noContent(res) {
        return res.status(204).send();
    }
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }
    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }
    static conflict(res, message = 'Resource already exists') {
        return this.error(res, message, 409);
    }
    static unprocessable(res, message = 'Unprocessable entity', details) {
        return this.error(res, message, 422, details);
    }
    static internalError(res, message = 'Internal server error') {
        return this.error(res, message, 500);
    }
}
// Helper functions for convenience
export const successResponse = (res, data, message = 'Success', status = 200) => {
    return HttpResponse.success(res, data, message, status);
};
export const errorResponse = (res, error, status = 400, details) => {
    return HttpResponse.error(res, error, status, details);
};
//# sourceMappingURL=http-response.js.map