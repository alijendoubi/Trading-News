import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpResponse } from '../utils/http-response.js';
import { logger } from '../config/logger.js';
import type { JwtPayload } from '../../../common/types.js';

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
      HttpResponse.unauthorized(res, 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
      req.userId = decoded.sub;
      req.userEmail = decoded.email;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        HttpResponse.unauthorized(res, 'Token has expired');
        return;
      }
      HttpResponse.unauthorized(res, 'Invalid token');
    }
  } catch (error) {
    logger.error('Auth middleware error', { error });
    HttpResponse.internalError(res);
  }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
        req.userId = decoded.sub;
        req.userEmail = decoded.email;
        req.user = decoded;
      } catch (error) {
        logger.warn('Optional auth token invalid', { error });
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', { error });
    HttpResponse.internalError(res);
  }
}
