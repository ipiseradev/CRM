"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_guard_1 = require("../middlewares/tenant.guard");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const shared_1 = require("@salescore/shared");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validate_middleware_1.validateBody)(shared_1.RegisterSchema), auth_controller_1.authController.register);
router.post('/login', (0, validate_middleware_1.validateBody)(shared_1.LoginSchema), auth_controller_1.authController.login);
router.post('/refresh', (0, validate_middleware_1.validateBody)(shared_1.RefreshTokenSchema), auth_controller_1.authController.refresh);
router.post('/logout', auth_controller_1.authController.logout);
// Protected routes
router.get('/me', auth_middleware_1.authMiddleware, tenant_guard_1.tenantGuard, auth_controller_1.authController.me);
router.patch('/branding', auth_middleware_1.authMiddleware, tenant_guard_1.tenantGuard, auth_controller_1.authController.updateBranding);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map