import { z } from 'zod';
export declare const DealStageEnum: z.ZodEnum<["NEW", "CONTACTED", "QUOTE_SENT", "WAITING", "WON", "LOST"]>;
export type DealStage = z.infer<typeof DealStageEnum>;
export declare const DEAL_STAGES: DealStage[];
export declare const DEAL_STAGE_LABELS: Record<DealStage, string>;
export declare const CreateDealSchema: z.ZodObject<{
    client_id: z.ZodString;
    title: z.ZodString;
    value: z.ZodDefault<z.ZodNumber>;
    stage: z.ZodDefault<z.ZodEnum<["NEW", "CONTACTED", "QUOTE_SENT", "WAITING", "WON", "LOST"]>>;
    close_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    value: number;
    client_id: string;
    title: string;
    stage: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST";
    close_date?: string | null | undefined;
}, {
    client_id: string;
    title: string;
    value?: number | undefined;
    stage?: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST" | undefined;
    close_date?: string | null | undefined;
}>;
export declare const UpdateDealSchema: z.ZodObject<{
    client_id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    stage: z.ZodOptional<z.ZodDefault<z.ZodEnum<["NEW", "CONTACTED", "QUOTE_SENT", "WAITING", "WON", "LOST"]>>>;
    close_date: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    value?: number | undefined;
    client_id?: string | undefined;
    title?: string | undefined;
    stage?: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST" | undefined;
    close_date?: string | null | undefined;
}, {
    value?: number | undefined;
    client_id?: string | undefined;
    title?: string | undefined;
    stage?: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST" | undefined;
    close_date?: string | null | undefined;
}>;
export declare const UpdateDealStageSchema: z.ZodObject<{
    stage: z.ZodEnum<["NEW", "CONTACTED", "QUOTE_SENT", "WAITING", "WON", "LOST"]>;
}, "strip", z.ZodTypeAny, {
    stage: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST";
}, {
    stage: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST";
}>;
export declare const DealQuerySchema: z.ZodObject<{
    stage: z.ZodOptional<z.ZodEnum<["NEW", "CONTACTED", "QUOTE_SENT", "WAITING", "WON", "LOST"]>>;
    client_id: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    client_id?: string | undefined;
    stage?: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST" | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    client_id?: string | undefined;
    stage?: "NEW" | "CONTACTED" | "QUOTE_SENT" | "WAITING" | "WON" | "LOST" | undefined;
}>;
export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
export type UpdateDealStageInput = z.infer<typeof UpdateDealStageSchema>;
export type DealQuery = z.infer<typeof DealQuerySchema>;
export interface Deal {
    id: string;
    company_id: string;
    client_id: string;
    client_name?: string;
    title: string;
    value: number;
    stage: DealStage;
    close_date: string | null;
    created_at: string;
}
//# sourceMappingURL=deals.schema.d.ts.map