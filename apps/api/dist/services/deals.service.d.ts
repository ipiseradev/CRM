import { CreateDealInput, UpdateDealInput, DealStage, PaginatedResult, Deal } from '@salescore/shared';
export declare const dealsService: {
    getAll(companyId: string, stage?: DealStage, clientId?: string, limit?: number, offset?: number): Promise<PaginatedResult<Deal>>;
    getById(id: string, companyId: string): Promise<Deal>;
    create(companyId: string, data: CreateDealInput): Promise<Deal>;
    update(id: string, companyId: string, data: UpdateDealInput): Promise<Deal>;
    updateStage(id: string, companyId: string, stage: DealStage): Promise<Deal>;
    delete(id: string, companyId: string): Promise<void>;
    getKanban(companyId: string): Promise<Record<string, Deal[]>>;
};
//# sourceMappingURL=deals.service.d.ts.map