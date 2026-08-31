"use client";

import { Calendar1 } from "@repo/icons/Calendar1";
import { ChartBar2 } from "@repo/icons/ChartBar2";
import { Compass } from "@repo/icons/Compass";
import { House1 } from "@repo/icons/House1";
import { PaperMoney } from "@repo/icons/PaperMoney";
import { PersonWalking } from "@repo/icons/PersonWalking";
import { QrCode } from "@repo/icons/QrCode";
import { Scan1 } from "@repo/icons/Scan1";
import { User } from "@repo/icons/User";
import { UsersThree } from "@repo/icons/UsersThree";
import { Logo } from "@repo/ui/common/Logo";
import { BottomNav } from "@repo/ui/layout/BottomNav";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useRouter } from "@/shared/lib/app-router";

type AppRole = "athlete" | "coach" | "owner";

type RoleAppNavigationProps = {
  children: ReactNode;
  role: AppRole;
  /** When true, unauthenticated users still see this role’s bottom nav (e.g. discovery). */
  allowGuest?: boolean;
};

const ICON_SIZE = 22;

type RoleNavActionsValue = {
  openActions: () => void;
};

const RoleNavActionsContext = createContext<RoleNavActionsValue>({
  openActions: () => undefined,
});

export function useRoleNavActions() {
  return useContext(RoleNavActionsContext);
}

function isActivePath(pathname: string, href: string) {
  // Role homes (`/athlete`) are exact-only; discovery highlights the whole tree.
  if (href === "/discovery") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href.split("/").filter(Boolean).length === 1) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RoleAppNavigation({
  children,
  role,
  allowGuest = false,
}: RoleAppNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("BottomNav");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [actionsOpen, setActionsOpen] = useState(false);
  const navActions = useMemo<RoleNavActionsValue>(
    () => ({
      openActions: () => setActionsOpen(true),
    }),
    [],
  );
  const expectedRole = role === "owner" ? "club_owner" : role;
  const isGuest = allowGuest && isReady && !isAuthenticated;
  const roleMatches = isReady && activeRole === expectedRole;

  useEffect(() => {
    if (isGuest) return;
    if (isReady && activeRole && activeRole !== expectedRole) {
      router.replace(roleHomePath(activeRole));
    }
  }, [activeRole, expectedRole, isGuest, isReady, router]);

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
          href: "/discovery",
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
          key: "bookings",
          label: t("bookings"),
          icon: <Calendar1 size={ICON_SIZE} />,
          href: "/owner/bookings",
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
          key: "finance",
          label: t("finance"),
          icon: <PaperMoney size={ICON_SIZE} />,
          href: "/owner/finance",
        },
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
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  const showsNavigation = config.items.some(
    (item) => item.href === normalizedPathname,
  );

  if (!isReady || (!roleMatches && !isGuest)) {
    return <div aria-busy="true" className="min-h-dvh bg-background" />;
  }

  return (
    <RoleNavActionsContext.Provider value={navActions}>
      <div className={showsNavigation ? "min-h-dvh pb-28" : "min-h-dvh"}>
        {children}
        {showsNavigation ? (
          <BottomNav
            aria-label={t("navLabel")}
            centerAction={{
              actions: [...config.actions],
              actionsLabel: t("actionsLabel"),
              icon: (
                <Logo
                  color="var(--accent-foreground)"
                  gradient={false}
                  shadow={false}
                  size={48}
                />
              ),
              label: t("create"),
            }}
            isActionsOpen={actionsOpen}
            items={config.items.map((item) => ({
              ...item,
              isActive: isActivePath(pathname, item.href),
            }))}
            onActionsOpenChange={setActionsOpen}
          />
        ) : null}
      </div>
    </RoleNavActionsContext.Provider>
  );
}
