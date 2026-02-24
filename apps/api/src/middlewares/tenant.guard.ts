import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.handler';

/**
 * Tenant Guard — ensures every request has a valid companyId from JWT.
 * Must be used AFTER authMiddleware.
 * All queries must be scoped to req.user.companyId.
 */
export const tenantGuard = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.companyId) {
    next(new AppError('Tenant context missing', 401, 'UNAUTHORIZED'));
    return;
  }
  next();
};

/**
 * Helper to extract companyId safely from request.
 * Throws if not present (should never happen after tenantGuard).
 */
export const getCompanyId = (req: Request): string => {
  if (!req.user?.companyId) {
    throw new AppError('Tenant context missing', 401, 'UNAUTHORIZED');
  }
  return req.user.companyId;
};

export const getUserId = (req: Request): string => {
  if (!req.user?.userId) {
    throw new AppError('User context missing', 401, 'UNAUTHORIZED');
  }
  return req.user.userId;
};
