import { Deal, CreateDealInput, UpdateDealInput, DealStage } from '@salescore/shared';
export interface DealRow extends Deal {
}
export declare const dealsRepository: {
    findAll(companyId: string, stage?: DealStage, clientId?: string, limit?: number, offset?: number): Promise<{
        items: DealRow[];
        total: number;
    }>;
    findById(id: string, companyId: string): Promise<DealRow | null>;
    create(companyId: string, data: CreateDealInput): Promise<DealRow>;
    update(id: string, companyId: string, data: UpdateDealInput): Promise<DealRow | null>;
    updateStage(id: string, companyId: string, stage: DealStage): Promise<DealRow | null>;
    delete(id: string, companyId: string): Promise<boolean>;
    findByStageGrouped(companyId: string): Promise<Record<string, DealRow[]>>;
};
//# sourceMappingURL=deals.repository.d.ts.map