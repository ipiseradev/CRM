import { CreateClientInput, UpdateClientInput, PaginatedResult, Client } from '@salescore/shared';
export declare const clientsService: {
    getAll(companyId: string, search?: string, limit?: number, offset?: number): Promise<PaginatedResult<Client>>;
    getById(id: string, companyId: string): Promise<Client>;
    create(companyId: string, data: CreateClientInput): Promise<Client>;
    update(id: string, companyId: string, data: UpdateClientInput): Promise<Client>;
    delete(id: string, companyId: string): Promise<void>;
};
//# sourceMappingURL=clients.service.d.ts.map