import { query } from '../config/db';
import { Activity, CreateActivityInput } from '@salescore/shared';

export interface ActivityRow extends Activity {}

export const activitiesRepository = {
  async findAll(
    companyId: string,
    relatedType?: 'CLIENT' | 'DEAL',
    relatedId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: ActivityRow[]; total: number }> {
    const conditions: string[] = ['company_id = $1'];
    const values: unknown[] = [companyId];
    let idx = 2;

    if (relatedType) {
      conditions.push(`related_type = $${idx++}`);
      values.push(relatedType);
    }
    if (relatedId) {
      conditions.push(`related_id = $${idx++}`);
      values.push(relatedId);
    }

    const where = conditions.join(' AND ');

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM activities WHERE ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    const result = await query<ActivityRow>(
      `SELECT * FROM activities WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return { items: result.rows, total };
  },

  async findById(id: string, companyId: string): Promise<ActivityRow | null> {
    const result = await query<ActivityRow>(
      `SELECT * FROM activities WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    return result.rows[0] || null;
  },

  async create(companyId: string, data: CreateActivityInput): Promise<ActivityRow> {
    const result = await query<ActivityRow>(
      `INSERT INTO activities (company_id, related_type, related_id, type, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyId, data.related_type, data.related_id, data.type, data.content]
    );
    return result.rows[0];
  },

  async delete(id: string, companyId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM activities WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    return result.rowCount > 0;
  },
};
