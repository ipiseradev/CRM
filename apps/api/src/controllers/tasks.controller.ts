import { Request, Response, NextFunction } from 'express';
import { tasksService } from '../services/tasks.service';
import { getCompanyId } from '../middlewares/tenant.guard';
import { RelatedType } from '@salescore/shared';

export const tasksController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const {
        filter = 'all',
        related_type,
        related_id,
        limit = '20',
        offset = '0',
      } = req.query as Record<string, string>;

      const result = await tasksService.getAll(
        companyId,
        filter as 'today' | 'overdue' | 'upcoming' | 'all',
        related_type as RelatedType | undefined,
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
      const task = await tasksService.getById(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const task = await tasksService.create(companyId, req.body);
      res.status(201).json({ ok: true, data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const task = await tasksService.update(req.params.id, companyId, req.body);
      res.status(200).json({ ok: true, data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async markDone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const { done = true } = req.body as { done?: boolean };
      const task = await tasksService.markDone(req.params.id, companyId, done);
      res.status(200).json({ ok: true, data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      await tasksService.delete(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { message: 'Task deleted successfully' } });
    } catch (error) {
      next(error);
    }
  },
};
