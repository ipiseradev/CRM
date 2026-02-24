"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksService = void 0;
const tasks_repository_1 = require("../repositories/tasks.repository");
const error_handler_1 = require("../middlewares/error.handler");
exports.tasksService = {
    async getAll(companyId, filter = 'all', relatedType, relatedId, limit = 20, offset = 0) {
        const { items, total } = await tasks_repository_1.tasksRepository.findAll(companyId, filter, relatedType, relatedId, limit, offset);
        return { items, total, limit, offset };
    },
    async getById(id, companyId) {
        const task = await tasks_repository_1.tasksRepository.findById(id, companyId);
        if (!task) {
            throw new error_handler_1.AppError('Task not found', 404, 'NOT_FOUND');
        }
        return task;
    },
    async create(companyId, data) {
        return tasks_repository_1.tasksRepository.create(companyId, data);
    },
    async update(id, companyId, data) {
        const task = await tasks_repository_1.tasksRepository.update(id, companyId, data);
        if (!task) {
            throw new error_handler_1.AppError('Task not found', 404, 'NOT_FOUND');
        }
        return task;
    },
    async markDone(id, companyId, done = true) {
        const task = await tasks_repository_1.tasksRepository.markDone(id, companyId, done);
        if (!task) {
            throw new error_handler_1.AppError('Task not found', 404, 'NOT_FOUND');
        }
        return task;
    },
    async delete(id, companyId) {
        const deleted = await tasks_repository_1.tasksRepository.delete(id, companyId);
        if (!deleted) {
            throw new error_handler_1.AppError('Task not found', 404, 'NOT_FOUND');
        }
    },
};
//# sourceMappingURL=tasks.service.js.map