"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { Role, RoleOverviewResponse } from "@repo/api";
import { ApiError } from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import type { CallToActionCardVariant } from "@repo/ui/cards/CallToActionCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { accountRoles } from "@/shared/lib/api";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { roleApplyScreenVariants } from "./RoleApplyScreen.styles";
import type { RoleApplyScreenProps } from "./RoleApplyScreen.types";

const ACTION_CARDS: {
  role: Role;
  titleKey: "coachTitle" | "ownerTitle";
  subtitleKey: "coachSubtitle" | "ownerSubtitle";
  variant: CallToActionCardVariant;
  segment: "coach" | "owner";
}[] = [
  {
    role: "coach",
    titleKey: "coachTitle",
    subtitleKey: "coachSubtitle",
    variant: "primary",
    segment: "coach",
  },
  {
    role: "club_owner",
    titleKey: "ownerTitle",
    subtitleKey: "ownerSubtitle",
    variant: "outlined",
    segment: "owner",
  },
];

export function RoleApplyScreen({
  className,
  roleSegment = "athlete",
}: RoleApplyScreenProps) {
  const t = useTranslations("Mobile.RoleApply");
  const styles = roleApplyScreenVariants();
  const router = useRouter();
  const { user, switchRole } = useAuth();
  const [overview, setOverview] = useState<RoleOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await accountRoles.list();
      setOverview(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSwitch = async (role: Role) => {
    if (pendingRole) return;
    setError(null);
    setPendingRole(role);
    try {
      const session = await switchRole(role);
      router.replace(roleHomePath(session.activeRole));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errorSwitch"));
    } finally {
      setPendingRole(null);
    }
  };

  const handleAction = async (role: Role, segment: "coach" | "owner") => {
    if (pendingRole) return;
    const action = overview?.actions.find((item) => item.role === role);
    if (!action) return;

    if (action.hasRole || action.nextStep === "switch") {
      await handleSwitch(role);
      return;
    }

    if (action.nextStep === "pending") {
      return;
    }

    const wizardPath = `/${roleSegment}/profile/roles/${segment}`;

    if (
      action.nextStep === "submit" ||
      action.request?.status === "rejected" ||
      action.request?.status === "unsubmitted"
    ) {
      if (!action.request) {
        setPendingRole(role);
        try {
          await accountRoles.apply({ role });
          await load();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : t("error"));
          setPendingRole(null);
          return;
        } finally {
          setPendingRole(null);
        }
      }
      router.push(wizardPath);
      return;
    }

    router.push(wizardPath);
  };

  const availabilities =
    overview?.availabilities.filter((item) => item.canSwitch) ??
    (user?.roles ?? []).map((role) => ({
      role,
      canSwitch: true,
      active: false,
    }));

  const actionByRole = new Map(
    (overview?.actions ?? []).map((item) => [item.role, item]),
  );

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          appearance="bar"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/profile`)}
              size="lg"
              variant="tertiary"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <header className={styles.header()}>
          <Typography className={styles.subtitle()} color="muted" type="body">
            {t("subtitle")}
          </Typography>
        </header>

        <section className={styles.section()} aria-labelledby="roles-available">
          <Typography
            className={styles.sectionTitle()}
            id="roles-available"
            type="h4"
            weight="semibold"
          >
            {t("availabilitiesTitle")}
          </Typography>
          <Typography className={styles.sectionHint()} color="muted" type="body-sm">
            {t("availabilitiesHint")}
          </Typography>
          <div className={styles.list()}>
            {availabilities.length === 0 ? (
              <Typography color="muted" type="body-sm">
                {t("availabilitiesEmpty")}
              </Typography>
            ) : (
              availabilities.map((item) => {
                const label =
                  item.role === "coach"
                    ? t("coach")
                    : item.role === "club_owner"
                      ? t("owner")
                      : t("athlete");
                return (
                  <CallToActionCard
                    key={item.role}
                    actionLabel={t("switch")}
                    actionType="plus"
                    aria-busy={pendingRole === item.role || undefined}
                    onAction={
                      pendingRole
                        ? undefined
                        : () => void handleSwitch(item.role)
                    }
                    subtitle={item.active ? t("activeNow") : t("available")}
                    title={label}
                    variant="outlined"
                  />
                );
              })
            )}
          </div>
        </section>

        <section className={styles.section()} aria-labelledby="roles-actions">
          <Typography
            className={styles.sectionTitle()}
            id="roles-actions"
            type="h4"
            weight="semibold"
          >
            {t("actionsTitle")}
          </Typography>
          <Typography className={styles.sectionHint()} color="muted" type="body-sm">
            {t("actionsHint")}
          </Typography>
          <div className={styles.list()}>
            {ACTION_CARDS.map((card) => {
              const action = actionByRole.get(card.role);
              const hasRole = Boolean(
                action?.hasRole ?? user?.roles.includes(card.role),
              );
              const status = action?.request?.status;
              const pending = status === "pending";
              const rejected = status === "rejected";
              const subtitle = hasRole
                ? t("alreadyHaveRole")
                : pending
                  ? t("coachPendingHint")
                  : rejected
                    ? `${t("statusRejected")}${
                        action?.request?.review.reason
                          ? ` — ${action.request.review.reason}`
                          : ""
                      }`
                    : t(card.subtitleKey);
              const actionLabel = hasRole
                ? t("switch")
                : pending
                  ? t("statusPending")
                  : rejected
                    ? t("resubmit")
                    : t("apply");

              return (
                <CallToActionCard
                  key={card.role}
                  actionLabel={actionLabel}
                  actionType="plus"
                  aria-busy={pendingRole === card.role || undefined}
                  onAction={
                    pending || pendingRole || loading
                      ? undefined
                      : () => void handleAction(card.role, card.segment)
                  }
                  subtitle={subtitle}
                  title={t(card.titleKey)}
                  variant={card.variant}
                />
              );
            })}
          </div>
        </section>

        {error ? (
          <Typography className={styles.error()} role="alert" type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
