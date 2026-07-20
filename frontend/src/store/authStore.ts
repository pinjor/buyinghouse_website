import { create } from 'zustand';
import type { AuthUser } from '../api/authApi';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setSession: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null }),
}));
