import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/http-response.js';
import { logger } from '../config/logger.js';
export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            errorResponse(res, 'Missing or invalid authorization header', 401);
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, env.jwt.secret);
            if (decoded.type !== 'access') {
                errorResponse(res, 'Invalid token type', 401);
                return;
            }
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
            req.user = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                errorResponse(res, 'Token has expired', 401);
                return;
            }
            errorResponse(res, 'Invalid token', 401);
        }
    }
    catch (error) {
        logger.error('Auth middleware error', { error });
        errorResponse(res, 'Internal server error', 500);
    }
}
// Alias for consistency
export const authenticate = authMiddleware;
export function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, env.jwt.secret);
                if (decoded.type === 'access') {
                    req.userId = decoded.userId;
                    req.userEmail = decoded.email;
                    req.user = decoded;
                }
            }
            catch (error) {
                logger.warn('Optional auth token invalid', { error });
            }
        }
        next();
    }
    catch (error) {
        logger.error('Optional auth middleware error', { error });
        errorResponse(res, 'Internal server error', 500);
    }
}
//# sourceMappingURL=auth.js.map