import { RegisterInput, LoginInput, AuthTokens, AuthUser } from '@salescore/shared';
export declare const authService: {
    register(data: RegisterInput): Promise<{
        user: AuthUser;
        tokens: AuthTokens;
    }>;
    login(data: LoginInput): Promise<{
        user: AuthUser;
        tokens: AuthTokens;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        tokens: AuthTokens;
    }>;
    logout(refreshToken: string): Promise<void>;
    getMe(userId: string): Promise<AuthUser>;
    updateBranding(companyId: string, name: string, logoUrl: string | null, primaryColor: string): Promise<import("../repositories/auth.repository").CompanyRow>;
};
//# sourceMappingURL=auth.service.d.ts.map