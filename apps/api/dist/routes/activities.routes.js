"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activities_controller_1 = require("../controllers/activities.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_guard_1 = require("../middlewares/tenant.guard");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const shared_1 = require("@salescore/shared");
const router = (0, express_1.Router)();
// All routes require auth + tenant
router.use(auth_middleware_1.authMiddleware, tenant_guard_1.tenantGuard);
router.get('/', activities_controller_1.activitiesController.getAll);
router.get('/:id', activities_controller_1.activitiesController.getById);
router.post('/', (0, validate_middleware_1.validateBody)(shared_1.CreateActivitySchema), activities_controller_1.activitiesController.create);
router.delete('/:id', activities_controller_1.activitiesController.delete);
exports.default = router;
//# sourceMappingURL=activities.routes.js.map