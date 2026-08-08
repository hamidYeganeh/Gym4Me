import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/AuthProvider";

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={routes.signIn} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate replace to={routes.dashboard} />;
  }
  return children;
}
