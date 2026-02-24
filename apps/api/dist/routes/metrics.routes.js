"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metrics_controller_1 = require("../controllers/metrics.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_guard_1 = require("../middlewares/tenant.guard");
const router = (0, express_1.Router)();
// All routes require auth + tenant
router.use(auth_middleware_1.authMiddleware, tenant_guard_1.tenantGuard);
router.get('/summary', metrics_controller_1.metricsController.getSummary);
exports.default = router;
//# sourceMappingURL=metrics.routes.js.map