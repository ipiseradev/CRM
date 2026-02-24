import { z } from 'zod';
export declare const ActivityTypeEnum: z.ZodEnum<["NOTE", "CALL", "WHATSAPP", "MEETING"]>;
export type ActivityType = z.infer<typeof ActivityTypeEnum>;
export declare const ACTIVITY_TYPE_LABELS: Record<ActivityType, string>;
export declare const CreateActivitySchema: z.ZodObject<{
    related_type: z.ZodEnum<["CLIENT", "DEAL"]>;
    related_id: z.ZodString;
    type: z.ZodEnum<["NOTE", "CALL", "WHATSAPP", "MEETING"]>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "NOTE" | "CALL" | "WHATSAPP" | "MEETING";
    related_type: "CLIENT" | "DEAL";
    related_id: string;
    content: string;
}, {
    type: "NOTE" | "CALL" | "WHATSAPP" | "MEETING";
    related_type: "CLIENT" | "DEAL";
    related_id: string;
    content: string;
}>;
export declare const ActivityQuerySchema: z.ZodObject<{
    related_type: z.ZodOptional<z.ZodEnum<["CLIENT", "DEAL"]>>;
    related_id: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    related_type?: "CLIENT" | "DEAL" | undefined;
    related_id?: string | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    related_type?: "CLIENT" | "DEAL" | undefined;
    related_id?: string | undefined;
}>;
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type ActivityQuery = z.infer<typeof ActivityQuerySchema>;
export interface Activity {
    id: string;
    company_id: string;
    related_type: 'CLIENT' | 'DEAL';
    related_id: string;
    type: ActivityType;
    content: string;
    created_at: string;
}
//# sourceMappingURL=activities.schema.d.ts.map