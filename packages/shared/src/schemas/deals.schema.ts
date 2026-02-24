import { z } from 'zod';

export const DealStageEnum = z.enum([
  'NEW',
  'CONTACTED',
  'QUOTE_SENT',
  'WAITING',
  'WON',
  'LOST',
]);

export type DealStage = z.infer<typeof DealStageEnum>;

export const DEAL_STAGES: DealStage[] = [
  'NEW',
  'CONTACTED',
  'QUOTE_SENT',
  'WAITING',
  'WON',
  'LOST',
];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  QUOTE_SENT: 'Cotización Enviada',
  WAITING: 'En Espera',
  WON: 'Ganado',
  LOST: 'Perdido',
};

export const CreateDealSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  value: z.coerce.number().min(0, 'Value must be positive').default(0),
  stage: DealStageEnum.default('NEW'),
  close_date: z.string().optional().nullable(),
});

export const UpdateDealSchema = CreateDealSchema.partial();

export const UpdateDealStageSchema = z.object({
  stage: DealStageEnum,
});

export const DealQuerySchema = z.object({
  stage: DealStageEnum.optional(),
  client_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
export type UpdateDealStageInput = z.infer<typeof UpdateDealStageSchema>;
export type DealQuery = z.infer<typeof DealQuerySchema>;

export interface Deal {
  id: string;
  company_id: string;
  client_id: string;
  client_name?: string;
  title: string;
  value: number;
  stage: DealStage;
  close_date: string | null;
  created_at: string;
}
