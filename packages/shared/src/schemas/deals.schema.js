"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealQuerySchema = exports.UpdateDealStageSchema = exports.UpdateDealSchema = exports.CreateDealSchema = exports.DEAL_STAGE_LABELS = exports.DEAL_STAGES = exports.DealStageEnum = void 0;
const zod_1 = require("zod");
exports.DealStageEnum = zod_1.z.enum([
    'NEW',
    'CONTACTED',
    'QUOTE_SENT',
    'WAITING',
    'WON',
    'LOST',
]);
exports.DEAL_STAGES = [
    'NEW',
    'CONTACTED',
    'QUOTE_SENT',
    'WAITING',
    'WON',
    'LOST',
];
exports.DEAL_STAGE_LABELS = {
    NEW: 'Nuevo',
    CONTACTED: 'Contactado',
    QUOTE_SENT: 'Cotización Enviada',
    WAITING: 'En Espera',
    WON: 'Ganado',
    LOST: 'Perdido',
};
exports.CreateDealSchema = zod_1.z.object({
    client_id: zod_1.z.string().uuid('Invalid client ID'),
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters'),
    value: zod_1.z.coerce.number().min(0, 'Value must be positive').default(0),
    stage: exports.DealStageEnum.default('NEW'),
    close_date: zod_1.z.string().optional().nullable(),
});
exports.UpdateDealSchema = exports.CreateDealSchema.partial();
exports.UpdateDealStageSchema = zod_1.z.object({
    stage: exports.DealStageEnum,
});
exports.DealQuerySchema = zod_1.z.object({
    stage: exports.DealStageEnum.optional(),
    client_id: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
//# sourceMappingURL=deals.schema.js.map