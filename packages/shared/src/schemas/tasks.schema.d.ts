import { z } from 'zod';
export declare const RelatedTypeEnum: z.ZodEnum<["CLIENT", "DEAL"]>;
export type RelatedType = z.infer<typeof RelatedTypeEnum>;
export declare const CreateTaskSchema: z.ZodObject<{
    related_type: z.ZodEnum<["CLIENT", "DEAL"]>;
    related_id: z.ZodString;
    title: z.ZodString;
    due_date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    related_type: "CLIENT" | "DEAL";
    related_id: string;
    due_date: string;
}, {
    title: string;
    related_type: "CLIENT" | "DEAL";
    related_id: string;
    due_date: string;
}>;
export declare const UpdateTaskSchema: z.ZodObject<{
    related_type: z.ZodOptional<z.ZodEnum<["CLIENT", "DEAL"]>>;
    related_id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    related_type?: "CLIENT" | "DEAL" | undefined;
    related_id?: string | undefined;
    due_date?: string | undefined;
}, {
    title?: string | undefined;
    related_type?: "CLIENT" | "DEAL" | undefined;
    related_id?: string | undefined;
    due_date?: string | undefined;
}>;
export declare const TaskQuerySchema: z.ZodObject<{
    filter: z.ZodDefault<z.ZodEnum<["today", "overdue", "upcoming", "all"]>>;
    related_type: z.ZodOptional<z.ZodEnum<["CLIENT", "DEAL"]>>;
    related_id: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    filter: "today" | "overdue" | "upcoming" | "all";
    limit: number;
    offset: number;
    related_type?: "CLIENT" | "DEAL" | undefined;
    related_id?: string | undefined;
}, {
    filter?: "today" | "overdue" | "upcoming" | "all" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    related_type?: "CLIENT" | "DEAL" | undefined;
    related_id?: string | undefined;
}>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskQuery = z.infer<typeof TaskQuerySchema>;
export interface Task {
    id: string;
    company_id: string;
    related_type: RelatedType;
    related_id: string;
    title: string;
    due_date: string;
    done: boolean;
    created_at: string;
}
//# sourceMappingURL=tasks.schema.d.ts.map