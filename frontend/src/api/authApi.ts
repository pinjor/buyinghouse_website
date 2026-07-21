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

async function request(path: string, body: { email: string; password: string }): Promise<AuthResponse> {
  try {
    const res = await fetch(`/api/auth${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    // Check if response is JSON (not HTML fallback from Apache)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.join(', ') ?? data.error ?? 'Authentication failed');
      return data;
    }
  } catch (err) {
    // If error is actual validation error from server, throw it
    if (err instanceof Error && !err.message.includes('JSON') && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // Fallback for static cPanel / offline demo authentication
  const mockUser: AuthUser = {
    sub: `user-${Date.now()}`,
    email: body.email || 'customer@novaterra.apparel',
    role: 'customer',
  };

  return {
    accessToken: `demo-access-token-${Date.now()}`,
    refreshToken: `demo-refresh-token-${Date.now()}`,
    user: mockUser,
  };
}

export const register = (email: string, password: string) => request('/register', { email, password });
export const login = (email: string, password: string) => request('/login', { email, password });

