"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const tenant_guard_1 = require("../middlewares/tenant.guard");
const zod_1 = require("zod");
exports.authController = {
    async register(req, res, next) {
        try {
            const { user, tokens } = await auth_service_1.authService.register(req.body);
            res.status(201).json({
                ok: true,
                data: { user, tokens },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const { user, tokens } = await auth_service_1.authService.login(req.body);
            res.status(200).json({
                ok: true,
                data: { user, tokens },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const { tokens } = await auth_service_1.authService.refreshTokens(refreshToken);
            res.status(200).json({
                ok: true,
                data: { tokens },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await auth_service_1.authService.logout(refreshToken);
            }
            res.status(200).json({
                ok: true,
                data: { message: 'Logged out successfully' },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async me(req, res, next) {
        try {
            const userId = (0, tenant_guard_1.getUserId)(req);
            const user = await auth_service_1.authService.getMe(userId);
            res.status(200).json({
                ok: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async updateBranding(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const schema = zod_1.z.object({
                name: zod_1.z.string().min(2),
                logo_url: zod_1.z.string().url().optional().nullable(),
                primary_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
            });
            const data = schema.parse(req.body);
            const company = await auth_service_1.authService.updateBranding(companyId, data.name, data.logo_url ?? null, data.primary_color);
            res.status(200).json({
                ok: true,
                data: { company },
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map