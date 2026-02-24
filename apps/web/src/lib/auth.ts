import { api, tokenStorage } from './api';
import type { AuthUser, AuthTokens, LoginInput, RegisterInput } from '@salescore/shared';

export async function login(input: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const data = await api.post<{ user: AuthUser; tokens: AuthTokens }>(
    '/api/auth/login',
    input,
    { skipAuth: true }
  );
  tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data;
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const data = await api.post<{ user: AuthUser; tokens: AuthTokens }>(
    '/api/auth/register',
    input,
    { skipAuth: true }
  );
  tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefresh();
  try {
    await api.post('/api/auth/logout', { refreshToken });
  } catch {
    // ignore errors on logout
  } finally {
    tokenStorage.clear();
  }
}

export async function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/api/auth/me');
}

export function isAuthenticated(): boolean {
  return !!tokenStorage.getAccess();
}
