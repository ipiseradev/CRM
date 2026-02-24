"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQuerySchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.RelatedTypeEnum = void 0;
const zod_1 = require("zod");
exports.RelatedTypeEnum = zod_1.z.enum(['CLIENT', 'DEAL']);
exports.CreateTaskSchema = zod_1.z.object({
    related_type: exports.RelatedTypeEnum,
    related_id: zod_1.z.string().uuid('Invalid related ID'),
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters'),
    due_date: zod_1.z.string().min(1, 'Due date is required'),
});
exports.UpdateTaskSchema = exports.CreateTaskSchema.partial();
exports.TaskQuerySchema = zod_1.z.object({
    filter: zod_1.z.enum(['today', 'overdue', 'upcoming', 'all']).default('all'),
    related_type: exports.RelatedTypeEnum.optional(),
    related_id: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
//# sourceMappingURL=tasks.schema.js.map