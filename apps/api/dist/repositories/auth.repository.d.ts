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
export declare const authRepository: {
    createCompany(name: string): Promise<CompanyRow>;
    createUser(companyId: string, name: string, email: string, passwordHash: string, role?: "ADMIN" | "USER"): Promise<UserRow>;
    findUserByEmail(email: string): Promise<UserRow | null>;
    findUserById(id: string): Promise<UserRow | null>;
    findCompanyById(id: string): Promise<CompanyRow | null>;
    saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
    findRefreshToken(tokenHash: string): Promise<RefreshTokenRow | null>;
    deleteRefreshToken(tokenHash: string): Promise<void>;
    deleteAllUserRefreshTokens(userId: string): Promise<void>;
    updateCompanyBranding(companyId: string, name: string, logoUrl: string | null, primaryColor: string): Promise<CompanyRow>;
};
//# sourceMappingURL=auth.repository.d.ts.map