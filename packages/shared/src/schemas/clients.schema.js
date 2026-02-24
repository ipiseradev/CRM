"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientQuerySchema = exports.UpdateClientSchema = exports.CreateClientSchema = void 0;
const zod_1 = require("zod");
exports.CreateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    phone: zod_1.z.string().min(6, 'Phone must be at least 6 characters'),
    email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
    notes: zod_1.z.string().optional(),
});
exports.UpdateClientSchema = exports.CreateClientSchema.partial();
exports.ClientQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
//# sourceMappingURL=clients.schema.js.map