import { query } from '../config/db';
import { Task, CreateTaskInput, UpdateTaskInput, RelatedType } from '@salescore/shared';

export interface TaskRow extends Task {}

export const tasksRepository = {
  async findAll(
    companyId: string,
    filter: 'today' | 'overdue' | 'upcoming' | 'all' = 'all',
    relatedType?: RelatedType,
    relatedId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: TaskRow[]; total: number }> {
    const conditions: string[] = ['company_id = $1'];
    const values: unknown[] = [companyId];
    let idx = 2;

    if (filter === 'today') {
      conditions.push(`due_date::date = CURRENT_DATE AND done = false`);
    } else if (filter === 'overdue') {
      conditions.push(`due_date::date < CURRENT_DATE AND done = false`);
    } else if (filter === 'upcoming') {
      conditions.push(`due_date::date > CURRENT_DATE AND done = false`);
    }

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
      `SELECT COUNT(*) as count FROM tasks WHERE ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    const result = await query<TaskRow>(
      `SELECT * FROM tasks WHERE ${where}
       ORDER BY due_date ASC, created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return { items: result.rows, total };
  },

  async findById(id: string, companyId: string): Promise<TaskRow | null> {
    const result = await query<TaskRow>(
      `SELECT * FROM tasks WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    return result.rows[0] || null;
  },

  async create(companyId: string, data: CreateTaskInput): Promise<TaskRow> {
    const result = await query<TaskRow>(
      `INSERT INTO tasks (company_id, related_type, related_id, title, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyId, data.related_type, data.related_id, data.title, data.due_date]
    );
    return result.rows[0];
  },

  async update(id: string, companyId: string, data: UpdateTaskInput): Promise<TaskRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
    if (data.due_date !== undefined) { fields.push(`due_date = $${idx++}`); values.push(data.due_date); }
    if (data.related_type !== undefined) { fields.push(`related_type = $${idx++}`); values.push(data.related_type); }
    if (data.related_id !== undefined) { fields.push(`related_id = $${idx++}`); values.push(data.related_id); }

    if (fields.length === 0) return this.findById(id, companyId);

    values.push(id, companyId);
    const result = await query<TaskRow>(
      `UPDATE tasks SET ${fields.join(', ')}
       WHERE id = $${idx++} AND company_id = $${idx++}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async markDone(id: string, companyId: string, done: boolean = true): Promise<TaskRow | null> {
    const result = await query<TaskRow>(
      `UPDATE tasks SET done = $1 WHERE id = $2 AND company_id = $3 RETURNING *`,
      [done, id, companyId]
    );
    return result.rows[0] || null;
  },

  async delete(id: string, companyId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM tasks WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    return result.rowCount > 0;
  },
};
