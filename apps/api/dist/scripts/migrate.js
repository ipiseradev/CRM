"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const env_1 = require("../config/env");
const pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
});
async function migrate() {
    console.log('🔄 Running migrations...');
    const migrationsDir = path_1.default.join(__dirname, '../../migrations');
    const files = fs_1.default
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();
    const client = await pool.connect();
    try {
        // Create migrations tracking table
        await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        for (const file of files) {
            // Check if already applied
            const result = await client.query('SELECT id FROM _migrations WHERE filename = $1', [file]);
            if (result.rows.length > 0) {
                console.log(`  ⏭  Skipping ${file} (already applied)`);
                continue;
            }
            console.log(`  ▶  Applying ${file}...`);
            const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf-8');
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`  ✅ Applied ${file}`);
            }
            catch (err) {
                await client.query('ROLLBACK');
                throw err;
            }
        }
        console.log('\n✅ All migrations applied successfully!\n');
    }
    finally {
        client.release();
        await pool.end();
    }
}
migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map