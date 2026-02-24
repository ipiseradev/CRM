import { Request, Response, NextFunction } from 'express';
import { activitiesService } from '../services/activities.service';
import { getCompanyId } from '../middlewares/tenant.guard';

export const activitiesController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const {
        related_type,
        related_id,
        limit = '20',
        offset = '0',
      } = req.query as Record<string, string>;

      const result = await activitiesService.getAll(
        companyId,
        related_type as 'CLIENT' | 'DEAL' | undefined,
        related_id,
        Number(limit),
        Number(offset)
      );
      res.status(200).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const activity = await activitiesService.getById(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { activity } });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const activity = await activitiesService.create(companyId, req.body);
      res.status(201).json({ ok: true, data: { activity } });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      await activitiesService.delete(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { message: 'Activity deleted successfully' } });
    } catch (error) {
      next(error);
    }
  },
};
