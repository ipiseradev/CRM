import { Request, Response, NextFunction } from 'express';
/**
 * Tenant Guard — ensures every request has a valid companyId from JWT.
 * Must be used AFTER authMiddleware.
 * All queries must be scoped to req.user.companyId.
 */
export declare const tenantGuard: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Helper to extract companyId safely from request.
 * Throws if not present (should never happen after tenantGuard).
 */
export declare const getCompanyId: (req: Request) => string;
export declare const getUserId: (req: Request) => string;
//# sourceMappingURL=tenant.guard.d.ts.map