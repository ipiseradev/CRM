const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

function toApiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/api/')) return normalized;
  return `/api${normalized}`;
}

function toApiUrl(path: string): string {
  return `${API_URL}${toApiPath(path)}`;
}

// ─── Token Storage ─────────────────────────────────────────────────────────────
export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sc_access_token');
  },
  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sc_refresh_token');
  },
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('sc_access_token', access);
    localStorage.setItem('sc_refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('sc_access_token');
    localStorage.removeItem('sc_refresh_token');
  },
};

// ─── Refresh Logic ─────────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const res = await fetch(toApiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      tokenStorage.clear();
      return null;
    }

    const data = await res.json();
    if (data.ok) {
      tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    }
    tokenStorage.clear();
    return null;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

// ─── Core Fetch Wrapper ────────────────────────────────────────────────────────
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = tokenStorage.getAccess();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = toApiUrl(path);

  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // ─── Token Refresh on 401 ──────────────────────────────────
  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        // Retry original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...fetchOptions, headers });
      } else {
        refreshQueue = [];
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError('Session expired. Please log in again.', 'UNAUTHORIZED', 401);
      }
    } else {
      // Queue this request until refresh completes
      const newToken = await new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      });
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...fetchOptions, headers });
    }
  }

  const data = await response.json();

  if (!data.ok) {
    throw new ApiError(
      data.error?.message || 'An error occurred',
      data.error?.code || 'UNKNOWN_ERROR',
      response.status
    );
  }

  return data.data as T;
}

// ─── API Error Class ───────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Convenience Methods ───────────────────────────────────────────────────────
export const api = {
  get: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { method: 'DELETE', ...options }),
};
