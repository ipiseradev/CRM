import { metricsRepository } from '../repositories/metrics.repository';
import { MetricsSummary } from '@salescore/shared';
import { MetricsRangeInput } from '../repositories/metrics.repository';

export const metricsService = {
  async getSummary(companyId: string, input: MetricsRangeInput): Promise<MetricsSummary> {
    return metricsRepository.getSummary(companyId, input);
  },
};
