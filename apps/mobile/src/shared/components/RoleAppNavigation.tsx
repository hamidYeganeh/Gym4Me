"use client";

import {
  Calendar1,
  ChartBar2,
  Compass,
  House1,
  PaperMoney,
  PersonWalking,
  QrCode,
  Scan1,
  User,
  UsersThree,
} from "@repo/icons";
import { Logo } from "@repo/ui/common/Logo";
import { BottomNav } from "@repo/ui/layout/BottomNav";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";

type AppRole = "athlete" | "coach" | "owner";

type RoleAppNavigationProps = {
  children: ReactNode;
  role: AppRole;
};

const ICON_SIZE = 22;

const IMMERSIVE_SEGMENTS = [
  "/create",
  "/edit",
  "/payment",
  "/reserve",
  "/reschedule",
  "/qr-check-in",
];

function isActivePath(pathname: string, href: string) {
  if (href.split("/").filter(Boolean).length === 1) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RoleAppNavigation({ children, role }: RoleAppNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("BottomNav");
  const { activeRole, isReady } = useAuth();
  const expectedRole = role === "owner" ? "club_owner" : role;
  const hidesNavigation = IMMERSIVE_SEGMENTS.some((segment) =>
    pathname.includes(segment),
  );

  useEffect(() => {
    if (isReady && activeRole && activeRole !== expectedRole) {
      router.replace(roleHomePath(activeRole));
    }
  }, [activeRole, expectedRole, isReady, router]);

  const configs = {
    athlete: {
      items: [
        {
          key: "home",
          label: t("home"),
          icon: <House1 size={ICON_SIZE} />,
          href: "/athlete",
        },
        {
          key: "discover",
          label: t("discover"),
          icon: <Compass size={ICON_SIZE} />,
          href: "/athlete/discover",
        },
        {
          key: "activity",
          label: t("activity"),
          icon: <Calendar1 size={ICON_SIZE} />,
          href: "/athlete/bookings",
        },
        {
          key: "profile",
          label: t("profile"),
          icon: <User size={ICON_SIZE} />,
          href: "/athlete/profile",
        },
      ],
      actions: [
        {
          key: "check-in",
          label: t("qrCheckIn"),
          icon: <QrCode size={ICON_SIZE} />,
          href: "/athlete/qr-check-in",
        },
        {
          key: "metrics",
          label: t("healthMetrics"),
          icon: <ChartBar2 size={ICON_SIZE} />,
          href: "/athlete/metrics",
        },
      ],
    },
    coach: {
      items: [
        {
          key: "home",
          label: t("home"),
          icon: <House1 size={ICON_SIZE} />,
          href: "/coach",
        },
        {
          key: "schedule",
          label: t("schedule"),
          icon: <Calendar1 size={ICON_SIZE} />,
          href: "/coach/calendar/daily",
        },
        {
          key: "clients",
          label: t("clients"),
          icon: <UsersThree size={ICON_SIZE} />,
          href: "/coach/clients",
        },
        {
          key: "profile",
          label: t("profile"),
          icon: <User size={ICON_SIZE} />,
          href: "/coach/profile",
        },
      ],
      actions: [
        {
          key: "slots",
          label: t("slots"),
          icon: <Calendar1 size={ICON_SIZE} />,
          href: "/coach/slots",
        },
        {
          key: "programs",
          label: t("programs"),
          icon: <ChartBar2 size={ICON_SIZE} />,
          href: "/coach/programs",
        },
        {
          key: "messages",
          label: t("messages"),
          icon: <UsersThree size={ICON_SIZE} />,
          href: "/coach/messages",
        },
      ],
    },
    owner: {
      items: [
        {
          key: "home",
          label: t("home"),
          icon: <House1 size={ICON_SIZE} />,
          href: "/owner",
        },
        {
          key: "members",
          label: t("members"),
          icon: <UsersThree size={ICON_SIZE} />,
          href: "/owner/members",
        },
        {
          key: "finance",
          label: t("finance"),
          icon: <PaperMoney size={ICON_SIZE} />,
          href: "/owner/finance",
        },
        {
          key: "profile",
          label: t("profile"),
          icon: <User size={ICON_SIZE} />,
          href: "/owner/profile",
        },
      ],
      actions: [
        {
          key: "walk-in",
          label: t("walkIn"),
          icon: <PersonWalking size={ICON_SIZE} />,
          href: "/owner/walk-in-booking",
        },
        {
          key: "check-in",
          label: t("checkIn"),
          icon: <Scan1 size={ICON_SIZE} />,
          href: "/owner/check-in",
        },
        {
          key: "cash-shift",
          label: t("cashShift"),
          icon: <PaperMoney size={ICON_SIZE} />,
          href: "/owner/cash-shift",
        },
      ],
    },
  } as const;

  const config = configs[role];

  if (!isReady || activeRole !== expectedRole) {
    return <div aria-busy="true" className="min-h-dvh bg-background" />;
  }

  return (
    <div className={hidesNavigation ? "min-h-dvh" : "min-h-dvh pb-28"}>
      {children}
      {hidesNavigation ? null : (
        <BottomNav
          aria-label={t("navLabel")}
          centerAction={{
            label: t("create"),
            icon: (
              <Logo
                color="var(--accent-foreground)"
                gradient={false}
                shadow={false}
                size={48}
              />
            ),
            actionsLabel: t("actionsLabel"),
            actions: [...config.actions],
          }}
          items={config.items.map((item) => ({
            ...item,
            isActive: isActivePath(pathname, item.href),
          }))}
        />
      )}
    </div>
  );
}
