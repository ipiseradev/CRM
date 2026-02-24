"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const databaseUrl = env_1.env.DATABASE_URL.trim();
function validateDatabaseUrl(url) {
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new Error('[DB] Invalid DATABASE_URL format');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
        throw new Error('[DB] DATABASE_URL must start with postgres:// or postgresql://');
    }
    if (!parsed.password) {
        throw new Error('[DB] DATABASE_URL is missing password. Example: postgresql://user:password@host:5432/dbname');
    }
}
validateDatabaseUrl(databaseUrl);
const pool = new pg_1.Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('connect', () => {
    console.log('[DB] New client connected to PostgreSQL');
});
pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
    process.exit(-1);
});
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DB] query executed in ${duration}ms | rows: ${res.rowCount}`);
        }
        return { rows: res.rows, rowCount: res.rowCount ?? 0 };
    }
    catch (error) {
        console.error('[DB] Query error:', error);
        throw error;
    }
};
exports.query = query;
const getClient = () => pool.connect();
exports.getClient = getClient;
exports.default = pool;
//# sourceMappingURL=db.js.map