import { Activity, CreateActivityInput } from '@salescore/shared';
export interface ActivityRow extends Activity {
}
export declare const activitiesRepository: {
    findAll(companyId: string, relatedType?: "CLIENT" | "DEAL", relatedId?: string, limit?: number, offset?: number): Promise<{
        items: ActivityRow[];
        total: number;
    }>;
    findById(id: string, companyId: string): Promise<ActivityRow | null>;
    create(companyId: string, data: CreateActivityInput): Promise<ActivityRow>;
    delete(id: string, companyId: string): Promise<boolean>;
};
//# sourceMappingURL=activities.repository.d.ts.map