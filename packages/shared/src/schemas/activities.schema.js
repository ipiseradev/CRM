"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityQuerySchema = exports.CreateActivitySchema = exports.ACTIVITY_TYPE_LABELS = exports.ActivityTypeEnum = void 0;
const zod_1 = require("zod");
exports.ActivityTypeEnum = zod_1.z.enum(['NOTE', 'CALL', 'WHATSAPP', 'MEETING']);
exports.ACTIVITY_TYPE_LABELS = {
    NOTE: 'Nota',
    CALL: 'Llamada',
    WHATSAPP: 'WhatsApp',
    MEETING: 'Reunión',
};
exports.CreateActivitySchema = zod_1.z.object({
    related_type: zod_1.z.enum(['CLIENT', 'DEAL']),
    related_id: zod_1.z.string().uuid('Invalid related ID'),
    type: exports.ActivityTypeEnum,
    content: zod_1.z.string().min(1, 'Content is required'),
});
exports.ActivityQuerySchema = zod_1.z.object({
    related_type: zod_1.z.enum(['CLIENT', 'DEAL']).optional(),
    related_id: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
//# sourceMappingURL=activities.schema.js.map