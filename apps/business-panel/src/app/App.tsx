import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/shared/AuthProvider";
import { routes } from "@/shared/routes";
import { BusinessShell } from "@/components/BusinessShell";
import { ClubsScreen } from "@/screens/ClubsScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { DomainScreen } from "@/screens/DomainScreen";
import { SignInScreen } from "@/screens/SignInScreen";
import { BusinessActionScreen } from "@/screens/BusinessActionScreen";
import { GuestOnly, RequireOwner } from "./guards";

export function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <Routes>
          <Route
            path={routes.signIn}
            element={<GuestOnly><SignInScreen /></GuestOnly>}
          />
          <Route element={<RequireOwner />}>
            <Route element={<BusinessShell />}>
              <Route index element={<Navigate replace to={routes.dashboard} />} />
              <Route path={routes.dashboard} element={<DashboardScreen />} />
              <Route path={routes.clubs} element={<ClubsScreen />} />
              <Route path={routes.clubCreate} element={<BusinessActionScreen kind="club" />} />
              <Route path={routes.branchCreate} element={<BusinessActionScreen kind="branch" />} />
              <Route path={routes.members} element={<DomainScreen domain="members" />} />
              <Route path={routes.bookings} element={<DomainScreen domain="bookings" />} />
              <Route path={routes.bookingCreate} element={<BusinessActionScreen kind="booking" />} />
              <Route path={routes.bookingCheckIn} element={<BusinessActionScreen kind="checkin" />} />
              <Route path={routes.bookingReschedule} element={<BusinessActionScreen kind="reschedule" />} />
              <Route path={routes.bookingCancel} element={<BusinessActionScreen kind="cancel" />} />
              <Route path={routes.finance} element={<DomainScreen domain="finance" />} />
              <Route path={routes.settlementCreate} element={<BusinessActionScreen kind="settlement" />} />
              <Route path={routes.staff} element={<DomainScreen domain="staff" />} />
              <Route path={routes.staffInvite} element={<BusinessActionScreen kind="staff" />} />
              <Route path={routes.operations} element={<DomainScreen domain="operations" />} />
              <Route path={routes.resourceCreate} element={<BusinessActionScreen kind="resource" />} />
              <Route path={routes.offeringCreate} element={<BusinessActionScreen kind="offering" />} />
              <Route path={routes.settings} element={<DomainScreen domain="settings" />} />
              <Route path={routes.announcementCreate} element={<BusinessActionScreen kind="announcement" />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate replace to={routes.dashboard} />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
