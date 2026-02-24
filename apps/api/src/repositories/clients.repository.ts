import { query } from '../config/db';
import { Client, CreateClientInput, UpdateClientInput } from '@salescore/shared';

export interface ClientRow extends Client {}

export const clientsRepository = {
  async findAll(
    companyId: string,
    search: string = '',
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: ClientRow[]; total: number }> {
    const searchParam = `%${search}%`;
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM clients
       WHERE company_id = $1
         AND ($2 = '%%' OR name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2)`,
      [companyId, searchParam]
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    const result = await query<ClientRow>(
      `SELECT * FROM clients
       WHERE company_id = $1
         AND ($2 = '%%' OR name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [companyId, searchParam, limit, offset]
    );

    return { items: result.rows, total };
  },

  async findById(id: string, companyId: string): Promise<ClientRow | null> {
    const result = await query<ClientRow>(
      `SELECT * FROM clients WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    return result.rows[0] || null;
  },

  async create(companyId: string, data: CreateClientInput): Promise<ClientRow> {
    const result = await query<ClientRow>(
      `INSERT INTO clients (company_id, name, phone, email, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyId, data.name, data.phone, data.email || null, data.notes || null]
    );
    return result.rows[0];
  },

  async update(id: string, companyId: string, data: UpdateClientInput): Promise<ClientRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email || null); }
    if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(data.notes); }

    if (fields.length === 0) return this.findById(id, companyId);

    values.push(id, companyId);
    const result = await query<ClientRow>(
      `UPDATE clients SET ${fields.join(', ')}
       WHERE id = $${idx++} AND company_id = $${idx++}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: string, companyId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM clients WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    return result.rowCount > 0;
  },
};
