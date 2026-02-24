import { clientsRepository } from '../repositories/clients.repository';
import { AppError } from '../middlewares/error.handler';
import { CreateClientInput, UpdateClientInput, PaginatedResult, Client } from '@salescore/shared';

export const clientsService = {
  async getAll(
    companyId: string,
    search: string = '',
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResult<Client>> {
    const { items, total } = await clientsRepository.findAll(companyId, search, limit, offset);
    return { items, total, limit, offset };
  },

  async getById(id: string, companyId: string): Promise<Client> {
    const client = await clientsRepository.findById(id, companyId);
    if (!client) {
      throw new AppError('Client not found', 404, 'NOT_FOUND');
    }
    return client;
  },

  async create(companyId: string, data: CreateClientInput): Promise<Client> {
    return clientsRepository.create(companyId, data);
  },

  async update(id: string, companyId: string, data: UpdateClientInput): Promise<Client> {
    const client = await clientsRepository.update(id, companyId, data);
    if (!client) {
      throw new AppError('Client not found', 404, 'NOT_FOUND');
    }
    return client;
  },

  async delete(id: string, companyId: string): Promise<void> {
    const deleted = await clientsRepository.delete(id, companyId);
    if (!deleted) {
      throw new AppError('Client not found', 404, 'NOT_FOUND');
    }
  },
};
