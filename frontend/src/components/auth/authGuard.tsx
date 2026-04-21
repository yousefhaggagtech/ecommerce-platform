"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/application/hooks/useAuth";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // set to true for admin-only pages
}

// ─── AuthGuard ────────────────────────────────────────────────────────────────
// Wraps any page that requires authentication
// Usage:
//   <AuthGuard>...</AuthGuard>              ← requires login
//   <AuthGuard requireAdmin>...</AuthGuard> ← requires admin role

export const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    // Not logged in — redirect to login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Logged in but not admin — redirect to home
    if (requireAdmin && !isAdmin) {
      router.replace("/");
    }
  }, [isAuthenticated, isAdmin, requireAdmin, router]);

  // Don't render children until auth check passes
  if (!isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
};