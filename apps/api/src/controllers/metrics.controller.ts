import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics.service';
import { getCompanyId } from '../middlewares/tenant.guard';
import { MetricsPeriod } from '../repositories/metrics.repository';

export const metricsController = {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const { period, from, to } = req.query as Record<string, string | undefined>;
      const selectedPeriod: MetricsPeriod =
        period === 'today' || period === 'week' || period === 'month' || period === 'custom'
          ? period
          : 'month';

      const summary = await metricsService.getSummary(companyId, {
        period: selectedPeriod,
        from,
        to,
      });
      res.status(200).json({ ok: true, data: { summary } });
    } catch (error) {
      next(error);
    }
  },
};
