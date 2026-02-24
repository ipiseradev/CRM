import { z } from 'zod';

export const RelatedTypeEnum = z.enum(['CLIENT', 'DEAL']);
export type RelatedType = z.infer<typeof RelatedTypeEnum>;

export const CreateTaskSchema = z.object({
  related_type: RelatedTypeEnum,
  related_id: z.string().uuid('Invalid related ID'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  due_date: z.string().min(1, 'Due date is required'),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const TaskQuerySchema = z.object({
  filter: z.enum(['today', 'overdue', 'upcoming', 'all']).default('all'),
  related_type: RelatedTypeEnum.optional(),
  related_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskQuery = z.infer<typeof TaskQuerySchema>;

export interface Task {
  id: string;
  company_id: string;
  related_type: RelatedType;
  related_id: string;
  title: string;
  due_date: string;
  done: boolean;
  created_at: string;
}
