import { z } from 'zod';

export const ActivityTypeEnum = z.enum(['NOTE', 'CALL', 'WHATSAPP', 'MEETING']);
export type ActivityType = z.infer<typeof ActivityTypeEnum>;

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  NOTE: 'Nota',
  CALL: 'Llamada',
  WHATSAPP: 'WhatsApp',
  MEETING: 'Reunión',
};

export const CreateActivitySchema = z.object({
  related_type: z.enum(['CLIENT', 'DEAL']),
  related_id: z.string().uuid('Invalid related ID'),
  type: ActivityTypeEnum,
  content: z.string().min(1, 'Content is required'),
});

export const ActivityQuerySchema = z.object({
  related_type: z.enum(['CLIENT', 'DEAL']).optional(),
  related_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type ActivityQuery = z.infer<typeof ActivityQuerySchema>;

export interface Activity {
  id: string;
  company_id: string;
  related_type: 'CLIENT' | 'DEAL';
  related_id: string;
  type: ActivityType;
  content: string;
  created_at: string;
}
