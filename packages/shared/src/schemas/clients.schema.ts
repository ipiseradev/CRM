import { z } from 'zod';

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(6, 'Phone must be at least 6 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export const ClientQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ClientQuery = z.infer<typeof ClientQuerySchema>;

export interface Client {
  id: string;
  company_id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
}
