import { Pool } from 'pg';
import { env } from './env';

const databaseUrl = env.DATABASE_URL.trim();

function validateDatabaseUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('[DB] Invalid DATABASE_URL format');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('[DB] DATABASE_URL must start with postgres:// or postgresql://');
  }

  if (!parsed.password) {
    throw new Error(
      '[DB] DATABASE_URL is missing password. Example: postgresql://user:password@host:5432/dbname'
    );
  }
}

validateDatabaseUrl(databaseUrl);

const pool = new Pool({
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

export const query = async <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] query executed in ${duration}ms | rows: ${res.rowCount}`);
    }
    return { rows: res.rows as T[], rowCount: res.rowCount ?? 0 };
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  }
};

export const getClient = () => pool.connect();

export default pool;
