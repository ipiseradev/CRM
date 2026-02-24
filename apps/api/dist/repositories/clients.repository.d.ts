import { Client, CreateClientInput, UpdateClientInput } from '@salescore/shared';
export interface ClientRow extends Client {
}
export declare const clientsRepository: {
    findAll(companyId: string, search?: string, limit?: number, offset?: number): Promise<{
        items: ClientRow[];
        total: number;
    }>;
    findById(id: string, companyId: string): Promise<ClientRow | null>;
    create(companyId: string, data: CreateClientInput): Promise<ClientRow>;
    update(id: string, companyId: string, data: UpdateClientInput): Promise<ClientRow | null>;
    delete(id: string, companyId: string): Promise<boolean>;
};
//# sourceMappingURL=clients.repository.d.ts.map