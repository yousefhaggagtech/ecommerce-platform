"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/application/store/authStore"; 

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean; 
}

// ─── AuthGuard ────────────────────────────────────────────────────────────────

export const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
  const router = useRouter();
  

  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const isAdmin = user?.role === "admin"; 

  useEffect(() => {
   
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.replace("/");
    }
  }, [_hasHydrated, isAuthenticated, isAdmin, requireAdmin, router]);

  // ─── Render Logic ───────────────────────────────────────────────────────────

  if (!_hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }
  return <>{children}</>;
};