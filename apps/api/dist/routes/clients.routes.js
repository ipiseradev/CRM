"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clients_controller_1 = require("../controllers/clients.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_guard_1 = require("../middlewares/tenant.guard");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const shared_1 = require("@salescore/shared");
const router = (0, express_1.Router)();
// All routes require auth + tenant
router.use(auth_middleware_1.authMiddleware, tenant_guard_1.tenantGuard);
router.get('/', clients_controller_1.clientsController.getAll);
router.get('/:id', clients_controller_1.clientsController.getById);
router.post('/', (0, validate_middleware_1.validateBody)(shared_1.CreateClientSchema), clients_controller_1.clientsController.create);
router.patch('/:id', (0, validate_middleware_1.validateBody)(shared_1.UpdateClientSchema), clients_controller_1.clientsController.update);
router.delete('/:id', clients_controller_1.clientsController.delete);
exports.default = router;
//# sourceMappingURL=clients.routes.js.map