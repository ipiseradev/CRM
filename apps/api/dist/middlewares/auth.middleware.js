"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const error_handler_1 = require("./error.handler");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_handler_1.AppError('No token provided', 401, 'UNAUTHORIZED');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new error_handler_1.AppError('No token provided', 401, 'UNAUTHORIZED');
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof error_handler_1.AppError) {
            next(error);
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new error_handler_1.AppError('Token expired', 401, 'TOKEN_EXPIRED'));
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_handler_1.AppError('Invalid token', 401, 'INVALID_TOKEN'));
            return;
        }
        next(new error_handler_1.AppError('Authentication failed', 401, 'UNAUTHORIZED'));
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            next(new error_handler_1.AppError('Unauthorized', 401, 'UNAUTHORIZED'));
            return;
        }
        if (req.user.role !== role && req.user.role !== 'ADMIN') {
            next(new error_handler_1.AppError('Insufficient permissions', 403, 'FORBIDDEN'));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map