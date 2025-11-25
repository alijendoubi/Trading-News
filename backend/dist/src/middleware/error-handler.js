import { HttpResponse } from '../utils/http-response.js';
import { logger } from '../config/logger.js';
export function errorHandler(err, req, res, _next) {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    const details = err.details;
    HttpResponse.error(res, message, status, details);
}
export function notFoundHandler(req, res) {
    logger.warn('Route not found', { url: req.originalUrl, method: req.method });
    HttpResponse.notFound(res, `Cannot ${req.method} ${req.originalUrl}`);
}
//# sourceMappingURL=error-handler.js.map