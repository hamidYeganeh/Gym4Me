import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import { RedirectIfAuthed, RequireAuth } from "./guards";
import { ForgotPasswordScreen, OtpScreen, SignInScreen } from "./lazy-screens";
import { AdminP0Shell } from "@/modules/p0/AdminP0Shell";
import { AdminP0Screen, type AdminP0Domain } from "@/modules/p0/AdminP0Screen";
import { RouteFallback } from "@/shared/components/RouteFallback";

const domains: Array<[string, AdminP0Domain]> = [
  ["/dashboard", "dashboard"], ["/dashboard/users", "users"], ["/dashboard/organizations", "organizations"], ["/dashboard/catalog", "catalog"], ["/dashboard/bookings", "bookings"], ["/dashboard/memberships", "memberships"], ["/dashboard/finance", "finance"], ["/dashboard/verifications", "verifications"], ["/dashboard/notifications", "notifications"], ["/dashboard/audit", "audit"],
];

export function AppRouter() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
  return <BrowserRouter basename={basename}><AuthProvider><Suspense fallback={<RouteFallback />}><Routes>
    <Route path="/sign-in" element={<RedirectIfAuthed><SignInScreen /></RedirectIfAuthed>} />
    <Route path="/otp" element={<RedirectIfAuthed><OtpScreen /></RedirectIfAuthed>} />
    <Route path="/forgot-password" element={<RedirectIfAuthed><ForgotPasswordScreen /></RedirectIfAuthed>} />
    <Route element={<RequireAuth />}><Route element={<AdminP0Shell />}>{domains.map(([path, domain]) => <Route element={<AdminP0Screen domain={domain} />} key={path} path={path} />)}<Route index element={<Navigate replace to="/dashboard" />} /></Route></Route>
    <Route path="*" element={<Navigate replace to="/dashboard" />} />
  </Routes></Suspense></AuthProvider></BrowserRouter>;
}
