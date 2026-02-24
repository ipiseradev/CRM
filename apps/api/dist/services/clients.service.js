"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsService = void 0;
const clients_repository_1 = require("../repositories/clients.repository");
const error_handler_1 = require("../middlewares/error.handler");
exports.clientsService = {
    async getAll(companyId, search = '', limit = 20, offset = 0) {
        const { items, total } = await clients_repository_1.clientsRepository.findAll(companyId, search, limit, offset);
        return { items, total, limit, offset };
    },
    async getById(id, companyId) {
        const client = await clients_repository_1.clientsRepository.findById(id, companyId);
        if (!client) {
            throw new error_handler_1.AppError('Client not found', 404, 'NOT_FOUND');
        }
        return client;
    },
    async create(companyId, data) {
        return clients_repository_1.clientsRepository.create(companyId, data);
    },
    async update(id, companyId, data) {
        const client = await clients_repository_1.clientsRepository.update(id, companyId, data);
        if (!client) {
            throw new error_handler_1.AppError('Client not found', 404, 'NOT_FOUND');
        }
        return client;
    },
    async delete(id, companyId) {
        const deleted = await clients_repository_1.clientsRepository.delete(id, companyId);
        if (!deleted) {
            throw new error_handler_1.AppError('Client not found', 404, 'NOT_FOUND');
        }
    },
};
//# sourceMappingURL=clients.service.js.map