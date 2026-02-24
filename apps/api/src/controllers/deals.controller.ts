import { Request, Response, NextFunction } from 'express';
import { dealsService } from '../services/deals.service';
import { getCompanyId } from '../middlewares/tenant.guard';
import { DealStage } from '@salescore/shared';

export const dealsController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const { stage, client_id, limit = '50', offset = '0' } = req.query as Record<string, string>;
      const result = await dealsService.getAll(
        companyId,
        stage as DealStage | undefined,
        client_id,
        Number(limit),
        Number(offset)
      );
      res.status(200).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getKanban(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const kanban = await dealsService.getKanban(companyId);
      res.status(200).json({ ok: true, data: { kanban } });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const deal = await dealsService.getById(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { deal } });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const deal = await dealsService.create(companyId, req.body);
      res.status(201).json({ ok: true, data: { deal } });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const deal = await dealsService.update(req.params.id, companyId, req.body);
      res.status(200).json({ ok: true, data: { deal } });
    } catch (error) {
      next(error);
    }
  },

  async updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const { stage } = req.body as { stage: DealStage };
      const deal = await dealsService.updateStage(req.params.id, companyId, stage);
      res.status(200).json({ ok: true, data: { deal } });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      await dealsService.delete(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { message: 'Deal deleted successfully' } });
    } catch (error) {
      next(error);
    }
  },
};
