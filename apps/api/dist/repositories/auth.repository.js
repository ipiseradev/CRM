"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = void 0;
const db_1 = require("../config/db");
exports.authRepository = {
    async createCompany(name) {
        const result = await (0, db_1.query)(`INSERT INTO companies (name) VALUES ($1) RETURNING *`, [name]);
        return result.rows[0];
    },
    async createUser(companyId, name, email, passwordHash, role = 'ADMIN') {
        const result = await (0, db_1.query)(`INSERT INTO users (company_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [companyId, name, email, passwordHash, role]);
        return result.rows[0];
    },
    async findUserByEmail(email) {
        const result = await (0, db_1.query)(`SELECT * FROM users WHERE email = $1`, [email]);
        return result.rows[0] || null;
    },
    async findUserById(id) {
        const result = await (0, db_1.query)(`SELECT u.*, c.name as company_name FROM users u
       JOIN companies c ON c.id = u.company_id
       WHERE u.id = $1`, [id]);
        return result.rows[0] || null;
    },
    async findCompanyById(id) {
        const result = await (0, db_1.query)(`SELECT * FROM companies WHERE id = $1`, [id]);
        return result.rows[0] || null;
    },
    async saveRefreshToken(userId, tokenHash, expiresAt) {
        await (0, db_1.query)(`INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`, [userId, tokenHash, expiresAt]);
    },
    async findRefreshToken(tokenHash) {
        const result = await (0, db_1.query)(`SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()`, [tokenHash]);
        return result.rows[0] || null;
    },
    async deleteRefreshToken(tokenHash) {
        await (0, db_1.query)(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
    },
    async deleteAllUserRefreshTokens(userId) {
        await (0, db_1.query)(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
    },
    async updateCompanyBranding(companyId, name, logoUrl, primaryColor) {
        const result = await (0, db_1.query)(`UPDATE companies SET name = $1, logo_url = $2, primary_color = $3
       WHERE id = $4 RETURNING *`, [name, logoUrl, primaryColor, companyId]);
        return result.rows[0];
    },
};
//# sourceMappingURL=auth.repository.js.map