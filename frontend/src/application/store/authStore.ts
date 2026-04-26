import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "@/domain/entities/userEntity";
import { authApi } from "@/infrastructure/api/authApi";

// ─── State Interface ──────────────────────────────────────────────────────────

interface AuthState {
  user:            IUser | null;
  isAuthenticated: boolean;
  _hasHydrated:    boolean;

  // Actions
  login:          (email: string, password: string) => Promise<void>;
  register:       (name: string, email: string, password: string) => Promise<void>;
  logout:         () => Promise<void>;
  clearAuth:      () => void;
  setAuthUser:     (user: IUser) => void;
  setHasHydrated: (state: boolean) => void;
}

// ─── Auth Store ───────────────────────────────────────────────────────────────
// Tokens are stored in httpOnly cookies by the backend — not here
// Only user data and isAuthenticated are persisted for UI purposes

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      isAuthenticated: false,
      _hasHydrated:    false,

      // ── Login ──────────────────────────────────────────────────────────────
      // Backend sets accessToken + refreshToken as httpOnly cookies
      login: async (email, password) => {
        const response = await authApi.login({ email, password });

        set({
          user:            response.user,
          isAuthenticated: true,
        });
      },

      // ── Register ───────────────────────────────────────────────────────────
      register: async (name, email, password) => {
        const response = await authApi.register({ name, email, password });

        set({
          user:            response.user,
          isAuthenticated: true,
        });
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      // Backend clears both cookies — we just clear local UI state
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          get().clearAuth();
        }
      },

      // ── Clear Auth ──────────────────────────────────────────────────────────
      // Called on logout or when refresh token fails in the axios interceptor
      clearAuth: () => {
        set({
          user:            null,
          isAuthenticated: false,
        });
      },

      // ── Set Auth User (used on hydration to validate server session)
      setAuthUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      // ── Set Hydrated ────────────────────────────────────────────────────────
      // Called by Zustand's onRehydrateStorage after reading from localStorage
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "auth-storage",

      // Trigger setHasHydrated when Zustand finishes reading from localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);

        // Validate server session on hydrate: call /auth/me to ensure tokens/cookies are valid
        (async () => {
          try {
            const user = await authApi.getMe();
            // Update store only if getMe succeeded
            state?.setAuthUser(user);
          } catch {
            // If validation fails, clear local UI state
            state?.clearAuth();
          }
        })();
      },

      // Only persist user data for UI — never persist tokens
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);