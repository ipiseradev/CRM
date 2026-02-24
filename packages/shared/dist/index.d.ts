export * from './schemas/auth.schema';
export * from './schemas/clients.schema';
export * from './schemas/deals.schema';
export * from './schemas/tasks.schema';
export * from './schemas/activities.schema';
export interface ApiSuccess<T = unknown> {
    ok: true;
    data: T;
}
export interface ApiError {
    ok: false;
    error: {
        message: string;
        code: string;
    };
}
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}
export interface MetricsSummary {
    total_clients: number;
    total_deals: number;
    deals_by_stage: Record<string, number>;
    won_value_sum: number;
    conversion_rate: number;
    recent_deals: Array<{
        id: string;
        title: string;
        client_name: string;
        value: number;
        stage: string;
        created_at: string;
    }>;
}
export interface CompanyBranding {
    id: string;
    name: string;
    logo_url: string | null;
    primary_color: string;
}
export declare const UpdateBrandingSchema_placeholder: null;
//# sourceMappingURL=index.d.ts.map