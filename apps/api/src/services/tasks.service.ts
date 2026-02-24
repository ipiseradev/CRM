import { tasksRepository } from '../repositories/tasks.repository';
import { AppError } from '../middlewares/error.handler';
import { CreateTaskInput, UpdateTaskInput, RelatedType, PaginatedResult, Task } from '@salescore/shared';

export const tasksService = {
  async getAll(
    companyId: string,
    filter: 'today' | 'overdue' | 'upcoming' | 'all' = 'all',
    relatedType?: RelatedType,
    relatedId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResult<Task>> {
    const { items, total } = await tasksRepository.findAll(
      companyId,
      filter,
      relatedType,
      relatedId,
      limit,
      offset
    );
    return { items, total, limit, offset };
  },

  async getById(id: string, companyId: string): Promise<Task> {
    const task = await tasksRepository.findById(id, companyId);
    if (!task) {
      throw new AppError('Task not found', 404, 'NOT_FOUND');
    }
    return task;
  },

  async create(companyId: string, data: CreateTaskInput): Promise<Task> {
    return tasksRepository.create(companyId, data);
  },

  async update(id: string, companyId: string, data: UpdateTaskInput): Promise<Task> {
    const task = await tasksRepository.update(id, companyId, data);
    if (!task) {
      throw new AppError('Task not found', 404, 'NOT_FOUND');
    }
    return task;
  },

  async markDone(id: string, companyId: string, done: boolean = true): Promise<Task> {
    const task = await tasksRepository.markDone(id, companyId, done);
    if (!task) {
      throw new AppError('Task not found', 404, 'NOT_FOUND');
    }
    return task;
  },

  async delete(id: string, companyId: string): Promise<void> {
    const deleted = await tasksRepository.delete(id, companyId);
    if (!deleted) {
      throw new AppError('Task not found', 404, 'NOT_FOUND');
    }
  },
};
