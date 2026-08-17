import { Button, Spinner, Typography } from "@heroui/react";
import {
  ArrowRotateClockwise1,
  CalendarCheck,
  CreditCard,
  UsersThree,
} from "@repo/icons";
import { useTranslations } from "next-intl";
import { dashboardHomeHeaderSectionVariants } from "./DashboardHomeHeaderSection.styles";
import type { DashboardHomeHeaderSectionProps } from "./DashboardHomeHeaderSection.types";

export function DashboardHomeHeaderSection({
  displayName,
  loading,
  onNavigateUsers,
  onNavigateFinance,
  onNavigateBookings,
  onRefresh,
  className,
}: DashboardHomeHeaderSectionProps) {
  const t = useTranslations("Admin");
  const styles = dashboardHomeHeaderSectionVariants();

  return (
    <section className={styles.intro({ className })}>
      <div className={styles.introCopy()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {t("Dashboard.title", { name: displayName })}
        </Typography>
        <Typography className={styles.subtitle()}>
          {t("Dashboard.subtitle")}
        </Typography>
      </div>

      <div className={styles.introActions()}>
        {loading ? <Spinner size="sm" /> : null}
        <Button variant="outline" onPress={onNavigateUsers}>
          <UsersThree size={18} />
          {t("nav.users")}
        </Button>
        <Button variant="outline" onPress={onNavigateFinance}>
          <CreditCard size={18} />
          {t("nav.finance")}
        </Button>
        <Button variant="outline" onPress={onNavigateBookings}>
          <CalendarCheck size={18} />
          {t("nav.bookings")}
        </Button>
        <Button variant="outline" onPress={onRefresh}>
          <ArrowRotateClockwise1 size={18} />
          {t("Dashboard.refresh")}
        </Button>
      </div>
    </section>
  );
}
