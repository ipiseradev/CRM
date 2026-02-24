import { Task, CreateTaskInput, UpdateTaskInput, RelatedType } from '@salescore/shared';
export interface TaskRow extends Task {
}
export declare const tasksRepository: {
    findAll(companyId: string, filter?: "today" | "overdue" | "upcoming" | "all", relatedType?: RelatedType, relatedId?: string, limit?: number, offset?: number): Promise<{
        items: TaskRow[];
        total: number;
    }>;
    findById(id: string, companyId: string): Promise<TaskRow | null>;
    create(companyId: string, data: CreateTaskInput): Promise<TaskRow>;
    update(id: string, companyId: string, data: UpdateTaskInput): Promise<TaskRow | null>;
    markDone(id: string, companyId: string, done?: boolean): Promise<TaskRow | null>;
    delete(id: string, companyId: string): Promise<boolean>;
};
//# sourceMappingURL=tasks.repository.d.ts.map