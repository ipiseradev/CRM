"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deals_controller_1 = require("../controllers/deals.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_guard_1 = require("../middlewares/tenant.guard");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const shared_1 = require("@salescore/shared");
const router = (0, express_1.Router)();
// All routes require auth + tenant
router.use(auth_middleware_1.authMiddleware, tenant_guard_1.tenantGuard);
router.get('/', deals_controller_1.dealsController.getAll);
router.get('/kanban', deals_controller_1.dealsController.getKanban);
router.get('/:id', deals_controller_1.dealsController.getById);
router.post('/', (0, validate_middleware_1.validateBody)(shared_1.CreateDealSchema), deals_controller_1.dealsController.create);
router.patch('/:id', (0, validate_middleware_1.validateBody)(shared_1.UpdateDealSchema), deals_controller_1.dealsController.update);
router.patch('/:id/stage', (0, validate_middleware_1.validateBody)(shared_1.UpdateDealStageSchema), deals_controller_1.dealsController.updateStage);
router.delete('/:id', deals_controller_1.dealsController.delete);
exports.default = router;
//# sourceMappingURL=deals.routes.js.map