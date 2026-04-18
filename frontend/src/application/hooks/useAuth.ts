"use client";

import { useAuthStore } from "@/application/store/authStore";

// ─── useAuth ──────────────────────────────────────────────────────────────────
// Single hook to access auth state and actions from any component

export const useAuth = () => {
  const user            = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login           = useAuthStore((state) => state.login);
  const register        = useAuthStore((state) => state.register);
  const logout          = useAuthStore((state) => state.logout);

  const isAdmin    = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  return {
    user,
    isAuthenticated,
    isAdmin,
    isCustomer,
    login,
    register,
    logout,
  };
};