"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksController = void 0;
const tasks_service_1 = require("../services/tasks.service");
const tenant_guard_1 = require("../middlewares/tenant.guard");
exports.tasksController = {
    async getAll(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const { filter = 'all', related_type, related_id, limit = '20', offset = '0', } = req.query;
            const result = await tasks_service_1.tasksService.getAll(companyId, filter, related_type, related_id, Number(limit), Number(offset));
            res.status(200).json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const task = await tasks_service_1.tasksService.getById(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { task } });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const task = await tasks_service_1.tasksService.create(companyId, req.body);
            res.status(201).json({ ok: true, data: { task } });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const task = await tasks_service_1.tasksService.update(req.params.id, companyId, req.body);
            res.status(200).json({ ok: true, data: { task } });
        }
        catch (error) {
            next(error);
        }
    },
    async markDone(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const { done = true } = req.body;
            const task = await tasks_service_1.tasksService.markDone(req.params.id, companyId, done);
            res.status(200).json({ ok: true, data: { task } });
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            await tasks_service_1.tasksService.delete(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { message: 'Task deleted successfully' } });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=tasks.controller.js.map