import { query } from '../config/db';
import { Deal, CreateDealInput, UpdateDealInput, DealStage } from '@salescore/shared';

export interface DealRow extends Deal {}

export const dealsRepository = {
  async findAll(
    companyId: string,
    stage?: DealStage,
    clientId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ items: DealRow[]; total: number }> {
    const conditions: string[] = ['d.company_id = $1'];
    const values: unknown[] = [companyId];
    let idx = 2;

    if (stage) {
      conditions.push(`d.stage = $${idx++}`);
      values.push(stage);
    }
    if (clientId) {
      conditions.push(`d.client_id = $${idx++}`);
      values.push(clientId);
    }

    const where = conditions.join(' AND ');

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM deals d WHERE ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    const result = await query<DealRow>(
      `SELECT d.*, c.name as client_name
       FROM deals d
       LEFT JOIN clients c ON c.id = d.client_id
       WHERE ${where}
       ORDER BY d.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return { items: result.rows, total };
  },

  async findById(id: string, companyId: string): Promise<DealRow | null> {
    const result = await query<DealRow>(
      `SELECT d.*, c.name as client_name
       FROM deals d
       LEFT JOIN clients c ON c.id = d.client_id
       WHERE d.id = $1 AND d.company_id = $2`,
      [id, companyId]
    );
    return result.rows[0] || null;
  },

  async create(companyId: string, data: CreateDealInput): Promise<DealRow> {
    const result = await query<DealRow>(
      `INSERT INTO deals (company_id, client_id, title, value, stage, close_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        companyId,
        data.client_id,
        data.title,
        data.value ?? 0,
        data.stage ?? 'NEW',
        data.close_date || null,
      ]
    );
    // Fetch with client_name
    return this.findById(result.rows[0].id, companyId) as Promise<DealRow>;
  },

  async update(id: string, companyId: string, data: UpdateDealInput): Promise<DealRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.client_id !== undefined) { fields.push(`client_id = $${idx++}`); values.push(data.client_id); }
    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
    if (data.value !== undefined) { fields.push(`value = $${idx++}`); values.push(data.value); }
    if (data.stage !== undefined) { fields.push(`stage = $${idx++}`); values.push(data.stage); }
    if (data.close_date !== undefined) { fields.push(`close_date = $${idx++}`); values.push(data.close_date || null); }

    if (fields.length === 0) return this.findById(id, companyId);

    values.push(id, companyId);
    const result = await query<DealRow>(
      `UPDATE deals SET ${fields.join(', ')}
       WHERE id = $${idx++} AND company_id = $${idx++}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) return null;
    return this.findById(result.rows[0].id, companyId);
  },

  async updateStage(id: string, companyId: string, stage: DealStage): Promise<DealRow | null> {
    const result = await query<DealRow>(
      `UPDATE deals SET stage = $1 WHERE id = $2 AND company_id = $3 RETURNING *`,
      [stage, id, companyId]
    );
    if (!result.rows[0]) return null;
    return this.findById(result.rows[0].id, companyId);
  },

  async delete(id: string, companyId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM deals WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    return result.rowCount > 0;
  },

  async findByStageGrouped(companyId: string): Promise<Record<string, DealRow[]>> {
    const result = await query<DealRow>(
      `SELECT d.*, c.name as client_name
       FROM deals d
       LEFT JOIN clients c ON c.id = d.client_id
       WHERE d.company_id = $1
       ORDER BY d.created_at DESC`,
      [companyId]
    );

    const grouped: Record<string, DealRow[]> = {};
    for (const deal of result.rows) {
      if (!grouped[deal.stage]) grouped[deal.stage] = [];
      grouped[deal.stage].push(deal);
    }
    return grouped;
  },
};
