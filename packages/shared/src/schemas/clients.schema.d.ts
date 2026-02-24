import { z } from 'zod';
export declare const CreateClientSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    email?: string | undefined;
    notes?: string | undefined;
}, {
    name: string;
    phone: string;
    email?: string | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    notes?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    notes?: string | undefined;
}>;
export declare const ClientQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    search?: string | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ClientQuery = z.infer<typeof ClientQuerySchema>;
export interface Client {
    id: string;
    company_id: string;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
    created_at: string;
}
//# sourceMappingURL=clients.schema.d.ts.map