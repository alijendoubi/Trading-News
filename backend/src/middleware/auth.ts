import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/http-response.js';
import { logger } from '../config/logger.js';

interface JwtPayload {
  userId: string;
  email: string;
  type: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'Missing or invalid authorization header', 401);
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
      
      if (decoded.type !== 'access') {
        errorResponse(res, 'Invalid token type', 401);
        return;
      }
      
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        errorResponse(res, 'Token has expired', 401);
        return;
      }
      errorResponse(res, 'Invalid token', 401);
    }
  } catch (error) {
    logger.error('Auth middleware error', { error });
    errorResponse(res, 'Internal server error', 500);
  }
}

// Alias for consistency
export const authenticate = authMiddleware;

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
        
        if (decoded.type === 'access') {
          req.userId = decoded.userId;
          req.userEmail = decoded.email;
          req.user = decoded;
        }
      } catch (error) {
        logger.warn('Optional auth token invalid', { error });
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', { error });
    errorResponse(res, 'Internal server error', 500);
  }
}
