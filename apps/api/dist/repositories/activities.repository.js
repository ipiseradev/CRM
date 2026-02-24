"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activitiesRepository = void 0;
const db_1 = require("../config/db");
exports.activitiesRepository = {
    async findAll(companyId, relatedType, relatedId, limit = 20, offset = 0) {
        const conditions = ['company_id = $1'];
        const values = [companyId];
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
        const countResult = await (0, db_1.query)(`SELECT COUNT(*) as count FROM activities WHERE ${where}`, values);
        const total = parseInt(countResult.rows[0]?.count || '0', 10);
        const result = await (0, db_1.query)(`SELECT * FROM activities WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`, [...values, limit, offset]);
        return { items: result.rows, total };
    },
    async findById(id, companyId) {
        const result = await (0, db_1.query)(`SELECT * FROM activities WHERE id = $1 AND company_id = $2`, [id, companyId]);
        return result.rows[0] || null;
    },
    async create(companyId, data) {
        const result = await (0, db_1.query)(`INSERT INTO activities (company_id, related_type, related_id, type, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [companyId, data.related_type, data.related_id, data.type, data.content]);
        return result.rows[0];
    },
    async delete(id, companyId) {
        const result = await (0, db_1.query)(`DELETE FROM activities WHERE id = $1 AND company_id = $2`, [id, companyId]);
        return result.rowCount > 0;
    },
};
//# sourceMappingURL=activities.repository.js.map