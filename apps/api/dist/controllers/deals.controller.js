"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsController = void 0;
const deals_service_1 = require("../services/deals.service");
const tenant_guard_1 = require("../middlewares/tenant.guard");
exports.dealsController = {
    async getAll(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const { stage, client_id, limit = '50', offset = '0' } = req.query;
            const result = await deals_service_1.dealsService.getAll(companyId, stage, client_id, Number(limit), Number(offset));
            res.status(200).json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async getKanban(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const kanban = await deals_service_1.dealsService.getKanban(companyId);
            res.status(200).json({ ok: true, data: { kanban } });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const deal = await deals_service_1.dealsService.getById(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { deal } });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const deal = await deals_service_1.dealsService.create(companyId, req.body);
            res.status(201).json({ ok: true, data: { deal } });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const deal = await deals_service_1.dealsService.update(req.params.id, companyId, req.body);
            res.status(200).json({ ok: true, data: { deal } });
        }
        catch (error) {
            next(error);
        }
    },
    async updateStage(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const { stage } = req.body;
            const deal = await deals_service_1.dealsService.updateStage(req.params.id, companyId, stage);
            res.status(200).json({ ok: true, data: { deal } });
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            await deals_service_1.dealsService.delete(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { message: 'Deal deleted successfully' } });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=deals.controller.js.map