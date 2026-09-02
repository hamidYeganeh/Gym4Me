import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { routes } from "@/shared/routes";

export function RequireOwner() {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) return <div className="app-loader" aria-label="در حال بارگذاری" />;
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to={routes.signIn} />;
  }
  return <Outlet />;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) return <div className="app-loader" aria-label="در حال بارگذاری" />;
  if (isAuthenticated) return <Navigate replace to={routes.dashboard} />;
  return children;
}
