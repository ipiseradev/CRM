"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const auth_repository_1 = require("../repositories/auth.repository");
const error_handler_1 = require("../middlewares/error.handler");
const env_1 = require("../config/env");
const SALT_ROUNDS = 12;
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
};
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
const getRefreshExpiry = () => {
    const days = parseInt(env_1.env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10) || 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};
exports.authService = {
    async register(data) {
        // Check if email already exists
        const existing = await auth_repository_1.authRepository.findUserByEmail(data.email);
        if (existing) {
            throw new error_handler_1.AppError('Email already registered', 409, 'EMAIL_EXISTS');
        }
        // Create company
        const company = await auth_repository_1.authRepository.createCompany(data.companyName);
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
        // Create admin user
        const user = await auth_repository_1.authRepository.createUser(company.id, data.name, data.email, passwordHash, 'ADMIN');
        const payload = {
            userId: user.id,
            companyId: company.id,
            role: user.role,
            email: user.email,
        };
        const tokens = generateTokens(payload);
        // Save refresh token hash
        await auth_repository_1.authRepository.saveRefreshToken(user.id, hashToken(tokens.refreshToken), getRefreshExpiry());
        const authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: company.id,
            companyName: company.name,
        };
        return { user: authUser, tokens };
    },
    async login(data) {
        const user = await auth_repository_1.authRepository.findUserByEmail(data.email);
        if (!user) {
            throw new error_handler_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        const passwordMatch = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!passwordMatch) {
            throw new error_handler_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        const company = await auth_repository_1.authRepository.findCompanyById(user.company_id);
        if (!company) {
            throw new error_handler_1.AppError('Company not found', 404, 'NOT_FOUND');
        }
        const payload = {
            userId: user.id,
            companyId: user.company_id,
            role: user.role,
            email: user.email,
        };
        const tokens = generateTokens(payload);
        await auth_repository_1.authRepository.saveRefreshToken(user.id, hashToken(tokens.refreshToken), getRefreshExpiry());
        const authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company_id,
            companyName: company.name,
        };
        return { user: authUser, tokens };
    },
    async refreshTokens(refreshToken) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        }
        catch {
            throw new error_handler_1.AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
        }
        const tokenHash = hashToken(refreshToken);
        const storedToken = await auth_repository_1.authRepository.findRefreshToken(tokenHash);
        if (!storedToken) {
            throw new error_handler_1.AppError('Refresh token not found or expired', 401, 'INVALID_TOKEN');
        }
        // Rotate refresh token
        await auth_repository_1.authRepository.deleteRefreshToken(tokenHash);
        const payload = {
            userId: decoded.userId,
            companyId: decoded.companyId,
            role: decoded.role,
            email: decoded.email,
        };
        const tokens = generateTokens(payload);
        await auth_repository_1.authRepository.saveRefreshToken(decoded.userId, hashToken(tokens.refreshToken), getRefreshExpiry());
        return { tokens };
    },
    async logout(refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await auth_repository_1.authRepository.deleteRefreshToken(tokenHash);
    },
    async getMe(userId) {
        const user = await auth_repository_1.authRepository.findUserById(userId);
        if (!user) {
            throw new error_handler_1.AppError('User not found', 404, 'NOT_FOUND');
        }
        const company = await auth_repository_1.authRepository.findCompanyById(user.company_id);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company_id,
            companyName: company?.name || '',
        };
    },
    async updateBranding(companyId, name, logoUrl, primaryColor) {
        return auth_repository_1.authRepository.updateCompanyBranding(companyId, name, logoUrl, primaryColor);
    },
};
//# sourceMappingURL=auth.service.js.map