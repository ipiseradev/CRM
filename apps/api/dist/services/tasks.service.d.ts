import { CreateTaskInput, UpdateTaskInput, RelatedType, PaginatedResult, Task } from '@salescore/shared';
export declare const tasksService: {
    getAll(companyId: string, filter?: "today" | "overdue" | "upcoming" | "all", relatedType?: RelatedType, relatedId?: string, limit?: number, offset?: number): Promise<PaginatedResult<Task>>;
    getById(id: string, companyId: string): Promise<Task>;
    create(companyId: string, data: CreateTaskInput): Promise<Task>;
    update(id: string, companyId: string, data: UpdateTaskInput): Promise<Task>;
    markDone(id: string, companyId: string, done?: boolean): Promise<Task>;
    delete(id: string, companyId: string): Promise<void>;
};
//# sourceMappingURL=tasks.service.d.ts.map