import { dealsRepository } from '../repositories/deals.repository';
import { AppError } from '../middlewares/error.handler';
import {
  CreateDealInput,
  UpdateDealInput,
  DealStage,
  PaginatedResult,
  Deal,
} from '@salescore/shared';

export const dealsService = {
  async getAll(
    companyId: string,
    stage?: DealStage,
    clientId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PaginatedResult<Deal>> {
    const { items, total } = await dealsRepository.findAll(companyId, stage, clientId, limit, offset);
    return { items, total, limit, offset };
  },

  async getById(id: string, companyId: string): Promise<Deal> {
    const deal = await dealsRepository.findById(id, companyId);
    if (!deal) {
      throw new AppError('Deal not found', 404, 'NOT_FOUND');
    }
    return deal;
  },

  async create(companyId: string, data: CreateDealInput): Promise<Deal> {
    return dealsRepository.create(companyId, data);
  },

  async update(id: string, companyId: string, data: UpdateDealInput): Promise<Deal> {
    const deal = await dealsRepository.update(id, companyId, data);
    if (!deal) {
      throw new AppError('Deal not found', 404, 'NOT_FOUND');
    }
    return deal;
  },

  async updateStage(id: string, companyId: string, stage: DealStage): Promise<Deal> {
    const deal = await dealsRepository.updateStage(id, companyId, stage);
    if (!deal) {
      throw new AppError('Deal not found', 404, 'NOT_FOUND');
    }
    return deal;
  },

  async delete(id: string, companyId: string): Promise<void> {
    const deleted = await dealsRepository.delete(id, companyId);
    if (!deleted) {
      throw new AppError('Deal not found', 404, 'NOT_FOUND');
    }
  },

  async getKanban(companyId: string): Promise<Record<string, Deal[]>> {
    return dealsRepository.findByStageGrouped(companyId);
  },
};
