import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "@/domain/entities/userEntity";
import { authApi } from "@/infrastructure/api/authApi";

// ─── State Interface ──────────────────────────────────────────────────────────

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

// ─── Auth Store ───────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // ── Login ───────────────────────────────────────────────────────────────
      login: async (email, password) => {
        const response = await authApi.login({ email, password });

        // Persist tokens in localStorage for axios interceptor
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },

      // ── Register ────────────────────────────────────────────────────────────
      register: async (name, email, password) => {
        const response = await authApi.register({ name, email, password });

        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },

      // ── Logout ──────────────────────────────────────────────────────────────
      logout: async () => {
        const { refreshToken } = get();

        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } finally {
          // Always clear local state even if API call fails
          get().clearAuth();
        }
      },

      // ── Set Tokens (called by axios interceptor after refresh) ───────────────
      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ accessToken, refreshToken });
      },

      // ── Clear Auth ───────────────────────────────────────────────────────────
      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);