"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsService = void 0;
const deals_repository_1 = require("../repositories/deals.repository");
const error_handler_1 = require("../middlewares/error.handler");
exports.dealsService = {
    async getAll(companyId, stage, clientId, limit = 50, offset = 0) {
        const { items, total } = await deals_repository_1.dealsRepository.findAll(companyId, stage, clientId, limit, offset);
        return { items, total, limit, offset };
    },
    async getById(id, companyId) {
        const deal = await deals_repository_1.dealsRepository.findById(id, companyId);
        if (!deal) {
            throw new error_handler_1.AppError('Deal not found', 404, 'NOT_FOUND');
        }
        return deal;
    },
    async create(companyId, data) {
        return deals_repository_1.dealsRepository.create(companyId, data);
    },
    async update(id, companyId, data) {
        const deal = await deals_repository_1.dealsRepository.update(id, companyId, data);
        if (!deal) {
            throw new error_handler_1.AppError('Deal not found', 404, 'NOT_FOUND');
        }
        return deal;
    },
    async updateStage(id, companyId, stage) {
        const deal = await deals_repository_1.dealsRepository.updateStage(id, companyId, stage);
        if (!deal) {
            throw new error_handler_1.AppError('Deal not found', 404, 'NOT_FOUND');
        }
        return deal;
    },
    async delete(id, companyId) {
        const deleted = await deals_repository_1.dealsRepository.delete(id, companyId);
        if (!deleted) {
            throw new error_handler_1.AppError('Deal not found', 404, 'NOT_FOUND');
        }
    },
    async getKanban(companyId) {
        return deals_repository_1.dealsRepository.findByStageGrouped(companyId);
    },
};
//# sourceMappingURL=deals.service.js.map