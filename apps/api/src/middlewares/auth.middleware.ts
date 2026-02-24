import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@salescore/shared';
import { env } from '../config/env';
import { AppError } from './error.handler';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
      return;
    }
    next(new AppError('Authentication failed', 401, 'UNAUTHORIZED'));
  }
};

export const requireRole = (role: 'ADMIN' | 'USER') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
      return;
    }
    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
      return;
    }
    next();
  };
};
