import { AdminDashboardLayout } from "@repo/ui/layout/AdminDashboardLayout";
import type { AdminDashboardLabels } from "@repo/ui/layout/AdminDashboardLayout";
import { useTranslations } from "next-intl";
import { AdminDocumentMeta } from "./components/AdminDocumentMeta";

export default function App() {
  const t = useTranslations("Admin");

  const labels: AdminDashboardLabels = {
    greeting: t("greeting"),
    searchPlaceholder: t("searchPlaceholder"),
    searchAriaLabel: t("searchAriaLabel"),
    filtersAriaLabel: t("filtersAriaLabel"),
    navAriaLabel: t("navAriaLabel"),
    themeToLight: t("themeToLight"),
    themeToDark: t("themeToDark"),
    avatarAlt: t("avatarAlt"),
    nav: {
      home: t("nav.home"),
      calendar: t("nav.calendar"),
      profile: t("nav.profile"),
      settings: t("nav.settings"),
      analytics: t("nav.analytics"),
      logout: t("nav.logout"),
    },
  };

  return (
    <>
      <AdminDocumentMeta />
      <AdminDashboardLayout labels={labels} />
    </>
  );
}
