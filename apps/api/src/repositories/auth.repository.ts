import { query } from '../config/db';

export interface UserRow {
  id: string;
  company_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'USER';
  created_at: Date;
}

export interface CompanyRow {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  created_at: Date;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

export const authRepository = {
  async createCompany(name: string): Promise<CompanyRow> {
    const result = await query<CompanyRow>(
      `INSERT INTO companies (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return result.rows[0];
  },

  async createUser(
    companyId: string,
    name: string,
    email: string,
    passwordHash: string,
    role: 'ADMIN' | 'USER' = 'ADMIN'
  ): Promise<UserRow> {
    const result = await query<UserRow>(
      `INSERT INTO users (company_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyId, name, email, passwordHash, role]
    );
    return result.rows[0];
  },

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const result = await query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  async findUserById(id: string): Promise<UserRow | null> {
    const result = await query<UserRow>(
      `SELECT u.*, c.name as company_name FROM users u
       JOIN companies c ON c.id = u.company_id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findCompanyById(id: string): Promise<CompanyRow | null> {
    const result = await query<CompanyRow>(
      `SELECT * FROM companies WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenRow | null> {
    const result = await query<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash]
    );
    return result.rows[0] || null;
  },

  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
  },

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
  },

  async updateCompanyBranding(
    companyId: string,
    name: string,
    logoUrl: string | null,
    primaryColor: string
  ): Promise<CompanyRow> {
    const result = await query<CompanyRow>(
      `UPDATE companies SET name = $1, logo_url = $2, primary_color = $3
       WHERE id = $4 RETURNING *`,
      [name, logoUrl, primaryColor, companyId]
    );
    return result.rows[0];
  },
};
