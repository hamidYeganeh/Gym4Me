import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { AdminDashboardNavId } from "@repo/ui/layout/AdminDashboardLayout";
import { useTranslations } from "next-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminShell } from "@/shared/components";
import { routes } from "@/shared/lib/routes";

type RecordDetailState = {
  record?: unknown;
  returnTo?: string;
  title?: string;
};

function activeNav(path: string | undefined): AdminDashboardNavId {
  if (!path) return "home";
  if (path.includes("/users")) return "users";
  if (path.includes("/clubs")) return "clubs";
  if (path.includes("/bookings")) return "bookings";
  if (path.includes("/finance")) return "finance";
  if (path.includes("/catalog")) return "catalogs";
  if (path.includes("/ops")) return "ops";
  if (path.includes("/locations")) return "locations";
  if (path.includes("/sports")) return "sports";
  if (path.includes("/choices")) return "choices";
  if (path.includes("/refs")) return "refs";
  if (path.includes("/articles")) return "articles";
  if (path.includes("/banners")) return "banners";
  if (path.includes("/gamification")) return "gamification";
  if (path.includes("/support")) return "support";
  if (path.includes("/analytics")) return "analytics";
  return "home";
}

export function AdminRecordDetailScreen() {
  const t = useTranslations("Admin.Common.recordDetail");
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as RecordDetailState;
  const returnTo = state.returnTo ?? routes.dashboard;

  return (
    <AdminShell
      activeNavId={activeNav(state.returnTo)}
      breadcrumbs={[{ label: state.title ?? t("title") }]}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Typography type="h2" weight="bold">
              {state.title ?? t("title")}
            </Typography>
            <Typography color="muted">{t("subtitle")}</Typography>
          </div>
          <Button variant="secondary" onPress={() => navigate(returnTo)}>
            {t("back")}
          </Button>
        </div>

        {state.record === undefined ? (
          <Typography className="rounded-2xl bg-surface-secondary p-6 text-muted">
            {t("missing")}
          </Typography>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-divider bg-surface">
            <Typography
              className="border-b border-divider px-5 py-4"
              weight="semibold"
            >
              {t("rawData")}
            </Typography>
            <pre
              className="max-h-[70vh] overflow-auto p-5 text-start text-sm leading-7"
              dir="ltr"
            >
              {JSON.stringify(state.record, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </AdminShell>
  );
}
