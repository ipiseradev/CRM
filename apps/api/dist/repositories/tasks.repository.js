"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRepository = void 0;
const db_1 = require("../config/db");
exports.tasksRepository = {
    async findAll(companyId, filter = 'all', relatedType, relatedId, limit = 20, offset = 0) {
        const conditions = ['company_id = $1'];
        const values = [companyId];
        let idx = 2;
        if (filter === 'today') {
            conditions.push(`due_date::date = CURRENT_DATE AND done = false`);
        }
        else if (filter === 'overdue') {
            conditions.push(`due_date::date < CURRENT_DATE AND done = false`);
        }
        else if (filter === 'upcoming') {
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
        const countResult = await (0, db_1.query)(`SELECT COUNT(*) as count FROM tasks WHERE ${where}`, values);
        const total = parseInt(countResult.rows[0]?.count || '0', 10);
        const result = await (0, db_1.query)(`SELECT * FROM tasks WHERE ${where}
       ORDER BY due_date ASC, created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`, [...values, limit, offset]);
        return { items: result.rows, total };
    },
    async findById(id, companyId) {
        const result = await (0, db_1.query)(`SELECT * FROM tasks WHERE id = $1 AND company_id = $2`, [id, companyId]);
        return result.rows[0] || null;
    },
    async create(companyId, data) {
        const result = await (0, db_1.query)(`INSERT INTO tasks (company_id, related_type, related_id, title, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [companyId, data.related_type, data.related_id, data.title, data.due_date]);
        return result.rows[0];
    },
    async update(id, companyId, data) {
        const fields = [];
        const values = [];
        let idx = 1;
        if (data.title !== undefined) {
            fields.push(`title = $${idx++}`);
            values.push(data.title);
        }
        if (data.due_date !== undefined) {
            fields.push(`due_date = $${idx++}`);
            values.push(data.due_date);
        }
        if (data.related_type !== undefined) {
            fields.push(`related_type = $${idx++}`);
            values.push(data.related_type);
        }
        if (data.related_id !== undefined) {
            fields.push(`related_id = $${idx++}`);
            values.push(data.related_id);
        }
        if (fields.length === 0)
            return this.findById(id, companyId);
        values.push(id, companyId);
        const result = await (0, db_1.query)(`UPDATE tasks SET ${fields.join(', ')}
       WHERE id = $${idx++} AND company_id = $${idx++}
       RETURNING *`, values);
        return result.rows[0] || null;
    },
    async markDone(id, companyId, done = true) {
        const result = await (0, db_1.query)(`UPDATE tasks SET done = $1 WHERE id = $2 AND company_id = $3 RETURNING *`, [done, id, companyId]);
        return result.rows[0] || null;
    },
    async delete(id, companyId) {
        const result = await (0, db_1.query)(`DELETE FROM tasks WHERE id = $1 AND company_id = $2`, [id, companyId]);
        return result.rowCount > 0;
    },
};
//# sourceMappingURL=tasks.repository.js.map