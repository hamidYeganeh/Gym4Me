import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { OtpScreen } from "@/modules/auth/screens/OtpScreen";
import { SignInScreen } from "@/modules/auth/screens/SignInScreen";
import { DashboardHomeScreen } from "@/modules/dashboard/screens/DashboardHomeScreen";
import { AdminDocumentMeta } from "@/shared/components";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import { RedirectIfAuthed, RequireAuth } from "./guards";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminDocumentMeta />
        <Routes>
          <Route
            element={
              <RedirectIfAuthed>
                <SignInScreen />
              </RedirectIfAuthed>
            }
            path="/sign-in"
          />
          <Route
            element={
              <RedirectIfAuthed>
                <OtpScreen />
              </RedirectIfAuthed>
            }
            path="/otp"
          />
          <Route element={<RequireAuth />}>
            <Route element={<DashboardHomeScreen />} path="/" />
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
