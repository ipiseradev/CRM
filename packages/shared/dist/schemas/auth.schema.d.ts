import { z } from 'zod';
export declare const RegisterSchema: z.ZodObject<{
    companyName: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    name: string;
    email: string;
    password: string;
}, {
    companyName: string;
    name: string;
    email: string;
    password: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export interface JwtPayload {
    userId: string;
    companyId: string;
    role: 'ADMIN' | 'USER';
    email: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    companyId: string;
    companyName: string;
}
//# sourceMappingURL=auth.schema.d.ts.map