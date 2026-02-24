"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activitiesController = void 0;
const activities_service_1 = require("../services/activities.service");
const tenant_guard_1 = require("../middlewares/tenant.guard");
exports.activitiesController = {
    async getAll(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const { related_type, related_id, limit = '20', offset = '0', } = req.query;
            const result = await activities_service_1.activitiesService.getAll(companyId, related_type, related_id, Number(limit), Number(offset));
            res.status(200).json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const activity = await activities_service_1.activitiesService.getById(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { activity } });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const activity = await activities_service_1.activitiesService.create(companyId, req.body);
            res.status(201).json({ ok: true, data: { activity } });
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            await activities_service_1.activitiesService.delete(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { message: 'Activity deleted successfully' } });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=activities.controller.js.map