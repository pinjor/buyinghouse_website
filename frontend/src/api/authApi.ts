export interface AuthUser {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

async function request(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`/api/auth${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.formErrors?.join(', ') ?? data.error ?? 'Request failed');
  return data;
}

export const register = (email: string, password: string) => request('/register', { email, password });
export const login = (email: string, password: string) => request('/login', { email, password });
