import { MetricsSummary } from '@salescore/shared';
export type MetricsPeriod = 'today' | 'week' | 'month' | 'custom';
export interface MetricsRangeInput {
    period?: MetricsPeriod;
    from?: string;
    to?: string;
}
export declare const metricsRepository: {
    getSummary(companyId: string, input?: MetricsRangeInput): Promise<MetricsSummary>;
};
//# sourceMappingURL=metrics.repository.d.ts.map