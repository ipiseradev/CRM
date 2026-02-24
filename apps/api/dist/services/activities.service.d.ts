import { CreateActivityInput, PaginatedResult, Activity } from '@salescore/shared';
export declare const activitiesService: {
    getAll(companyId: string, relatedType?: "CLIENT" | "DEAL", relatedId?: string, limit?: number, offset?: number): Promise<PaginatedResult<Activity>>;
    getById(id: string, companyId: string): Promise<Activity>;
    create(companyId: string, data: CreateActivityInput): Promise<Activity>;
    delete(id: string, companyId: string): Promise<void>;
};
//# sourceMappingURL=activities.service.d.ts.map