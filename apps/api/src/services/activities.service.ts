import { activitiesRepository } from '../repositories/activities.repository';
import { AppError } from '../middlewares/error.handler';
import { CreateActivityInput, PaginatedResult, Activity } from '@salescore/shared';

export const activitiesService = {
  async getAll(
    companyId: string,
    relatedType?: 'CLIENT' | 'DEAL',
    relatedId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResult<Activity>> {
    const { items, total } = await activitiesRepository.findAll(
      companyId,
      relatedType,
      relatedId,
      limit,
      offset
    );
    return { items, total, limit, offset };
  },

  async getById(id: string, companyId: string): Promise<Activity> {
    const activity = await activitiesRepository.findById(id, companyId);
    if (!activity) {
      throw new AppError('Activity not found', 404, 'NOT_FOUND');
    }
    return activity;
  },

  async create(companyId: string, data: CreateActivityInput): Promise<Activity> {
    return activitiesRepository.create(companyId, data);
  },

  async delete(id: string, companyId: string): Promise<void> {
    const deleted = await activitiesRepository.delete(id, companyId);
    if (!deleted) {
      throw new AppError('Activity not found', 404, 'NOT_FOUND');
    }
  },
};
