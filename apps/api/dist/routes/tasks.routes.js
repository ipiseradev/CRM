"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tasks_controller_1 = require("../controllers/tasks.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_guard_1 = require("../middlewares/tenant.guard");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const shared_1 = require("@salescore/shared");
const router = (0, express_1.Router)();
// All routes require auth + tenant
router.use(auth_middleware_1.authMiddleware, tenant_guard_1.tenantGuard);
router.get('/', tasks_controller_1.tasksController.getAll);
router.get('/:id', tasks_controller_1.tasksController.getById);
router.post('/', (0, validate_middleware_1.validateBody)(shared_1.CreateTaskSchema), tasks_controller_1.tasksController.create);
router.patch('/:id', (0, validate_middleware_1.validateBody)(shared_1.UpdateTaskSchema), tasks_controller_1.tasksController.update);
router.patch('/:id/done', tasks_controller_1.tasksController.markDone);
router.delete('/:id', tasks_controller_1.tasksController.delete);
exports.default = router;
//# sourceMappingURL=tasks.routes.js.map