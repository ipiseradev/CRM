// Auth
export * from './schemas/auth.schema';

// Clients
export * from './schemas/clients.schema';

// Deals
export * from './schemas/deals.schema';

// Tasks
export * from './schemas/tasks.schema';

// Activities
export * from './schemas/activities.schema';

// Common API response types
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

// Metrics
export interface MetricsSummary {
  total_clients: number;
  total_deals: number;
  active_deals: number;
  deals_by_stage: Record<string, number>;
  won_value_sum: number;
  conversion_rate: number;
  pipeline_value: number;
  avg_deal_value: number;
  avg_close_days: number;
  pending_tasks: number;
  whatsapp_connected: boolean;
  comparison: {
    clients_vs_previous: number;
    active_deals_vs_previous: number;
    won_value_vs_previous: number;
    conversion_vs_previous: number;
  };
  recent_deals: Array<{
    id: string;
    title: string;
    client_name: string;
    owner_name: string;
    value: number;
    stage: string;
    created_at: string;
  }>;
}

// Settings / Branding
export interface CompanyBranding {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
}

export const UpdateBrandingSchema_placeholder = null; // defined in api
