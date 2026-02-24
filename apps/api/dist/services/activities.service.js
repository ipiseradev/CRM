"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activitiesService = void 0;
const activities_repository_1 = require("../repositories/activities.repository");
const error_handler_1 = require("../middlewares/error.handler");
exports.activitiesService = {
    async getAll(companyId, relatedType, relatedId, limit = 20, offset = 0) {
        const { items, total } = await activities_repository_1.activitiesRepository.findAll(companyId, relatedType, relatedId, limit, offset);
        return { items, total, limit, offset };
    },
    async getById(id, companyId) {
        const activity = await activities_repository_1.activitiesRepository.findById(id, companyId);
        if (!activity) {
            throw new error_handler_1.AppError('Activity not found', 404, 'NOT_FOUND');
        }
        return activity;
    },
    async create(companyId, data) {
        return activities_repository_1.activitiesRepository.create(companyId, data);
    },
    async delete(id, companyId) {
        const deleted = await activities_repository_1.activitiesRepository.delete(id, companyId);
        if (!deleted) {
            throw new error_handler_1.AppError('Activity not found', 404, 'NOT_FOUND');
        }
    },
};
//# sourceMappingURL=activities.service.js.map