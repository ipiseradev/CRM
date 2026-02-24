import { Pool } from 'pg';
declare const pool: Pool;
export declare const query: <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<{
    rows: T[];
    rowCount: number;
}>;
export declare const getClient: () => Promise<import("pg").PoolClient>;
export default pool;
//# sourceMappingURL=db.d.ts.map