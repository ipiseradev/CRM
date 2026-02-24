"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = exports.getCompanyId = exports.tenantGuard = void 0;
const error_handler_1 = require("./error.handler");
/**
 * Tenant Guard — ensures every request has a valid companyId from JWT.
 * Must be used AFTER authMiddleware.
 * All queries must be scoped to req.user.companyId.
 */
const tenantGuard = (req, res, next) => {
    if (!req.user || !req.user.companyId) {
        next(new error_handler_1.AppError('Tenant context missing', 401, 'UNAUTHORIZED'));
        return;
    }
    next();
};
exports.tenantGuard = tenantGuard;
/**
 * Helper to extract companyId safely from request.
 * Throws if not present (should never happen after tenantGuard).
 */
const getCompanyId = (req) => {
    if (!req.user?.companyId) {
        throw new error_handler_1.AppError('Tenant context missing', 401, 'UNAUTHORIZED');
    }
    return req.user.companyId;
};
exports.getCompanyId = getCompanyId;
const getUserId = (req) => {
    if (!req.user?.userId) {
        throw new error_handler_1.AppError('User context missing', 401, 'UNAUTHORIZED');
    }
    return req.user.userId;
};
exports.getUserId = getUserId;
//# sourceMappingURL=tenant.guard.js.map