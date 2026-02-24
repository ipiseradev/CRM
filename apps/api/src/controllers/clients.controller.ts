import { Request, Response, NextFunction } from 'express';
import { clientsService } from '../services/clients.service';
import { getCompanyId } from '../middlewares/tenant.guard';

export const clientsController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const { search = '', limit = 20, offset = 0 } = req.query as Record<string, string>;
      const result = await clientsService.getAll(
        companyId,
        search as string,
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
      const client = await clientsService.getById(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { client } });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const client = await clientsService.create(companyId, req.body);
      res.status(201).json({ ok: true, data: { client } });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const client = await clientsService.update(req.params.id, companyId, req.body);
      res.status(200).json({ ok: true, data: { client } });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      await clientsService.delete(req.params.id, companyId);
      res.status(200).json({ ok: true, data: { message: 'Client deleted successfully' } });
    } catch (error) {
      next(error);
    }
  },
};
