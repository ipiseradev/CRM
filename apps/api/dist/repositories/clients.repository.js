"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsRepository = void 0;
const db_1 = require("../config/db");
exports.clientsRepository = {
    async findAll(companyId, search = '', limit = 20, offset = 0) {
        const searchParam = `%${search}%`;
        const countResult = await (0, db_1.query)(`SELECT COUNT(*) as count FROM clients
       WHERE company_id = $1
         AND ($2 = '%%' OR name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2)`, [companyId, searchParam]);
        const total = parseInt(countResult.rows[0]?.count || '0', 10);
        const result = await (0, db_1.query)(`SELECT * FROM clients
       WHERE company_id = $1
         AND ($2 = '%%' OR name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`, [companyId, searchParam, limit, offset]);
        return { items: result.rows, total };
    },
    async findById(id, companyId) {
        const result = await (0, db_1.query)(`SELECT * FROM clients WHERE id = $1 AND company_id = $2`, [id, companyId]);
        return result.rows[0] || null;
    },
    async create(companyId, data) {
        const result = await (0, db_1.query)(`INSERT INTO clients (company_id, name, phone, email, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [companyId, data.name, data.phone, data.email || null, data.notes || null]);
        return result.rows[0];
    },
    async update(id, companyId, data) {
        const fields = [];
        const values = [];
        let idx = 1;
        if (data.name !== undefined) {
            fields.push(`name = $${idx++}`);
            values.push(data.name);
        }
        if (data.phone !== undefined) {
            fields.push(`phone = $${idx++}`);
            values.push(data.phone);
        }
        if (data.email !== undefined) {
            fields.push(`email = $${idx++}`);
            values.push(data.email || null);
        }
        if (data.notes !== undefined) {
            fields.push(`notes = $${idx++}`);
            values.push(data.notes);
        }
        if (fields.length === 0)
            return this.findById(id, companyId);
        values.push(id, companyId);
        const result = await (0, db_1.query)(`UPDATE clients SET ${fields.join(', ')}
       WHERE id = $${idx++} AND company_id = $${idx++}
       RETURNING *`, values);
        return result.rows[0] || null;
    },
    async delete(id, companyId) {
        const result = await (0, db_1.query)(`DELETE FROM clients WHERE id = $1 AND company_id = $2`, [id, companyId]);
        return result.rowCount > 0;
    },
};
//# sourceMappingURL=clients.repository.js.map