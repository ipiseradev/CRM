"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsController = void 0;
const clients_service_1 = require("../services/clients.service");
const tenant_guard_1 = require("../middlewares/tenant.guard");
exports.clientsController = {
    async getAll(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const { search = '', limit = 20, offset = 0 } = req.query;
            const result = await clients_service_1.clientsService.getAll(companyId, search, Number(limit), Number(offset));
            res.status(200).json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const client = await clients_service_1.clientsService.getById(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { client } });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const client = await clients_service_1.clientsService.create(companyId, req.body);
            res.status(201).json({ ok: true, data: { client } });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const client = await clients_service_1.clientsService.update(req.params.id, companyId, req.body);
            res.status(200).json({ ok: true, data: { client } });
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            await clients_service_1.clientsService.delete(req.params.id, companyId);
            res.status(200).json({ ok: true, data: { message: 'Client deleted successfully' } });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=clients.controller.js.map