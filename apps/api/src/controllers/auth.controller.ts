import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { getUserId, getCompanyId } from '../middlewares/tenant.guard';
import { z } from 'zod';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);
      res.status(201).json({
        ok: true,
        data: { user, tokens },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body);
      res.status(200).json({
        ok: true,
        data: { user, tokens },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const { tokens } = await authService.refreshTokens(refreshToken);
      res.status(200).json({
        ok: true,
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.status(200).json({
        ok: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserId(req);
      const user = await authService.getMe(userId);
      res.status(200).json({
        ok: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateBranding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = getCompanyId(req);
      const schema = z.object({
        name: z.string().min(2),
        logo_url: z.string().url().optional().nullable(),
        primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
      });
      const data = schema.parse(req.body);
      const company = await authService.updateBranding(
        companyId,
        data.name,
        data.logo_url ?? null,
        data.primary_color
      );
      res.status(200).json({
        ok: true,
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  },
};
