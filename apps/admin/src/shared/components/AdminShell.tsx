import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LocationKind, RefType, SportKind } from "@repo/api";
import {
  AdminDashboardLayout,
  type AdminDashboardLabels,
  type AdminDashboardNavId,
} from "@repo/ui/layout/AdminDashboardLayout";
import {
  AdminSectionHeader,
  type AdminSectionHeaderTab,
} from "@repo/ui/layout/AdminSectionHeader";
import { useTranslations } from "next-intl";
import {
  LOCATION_KINDS,
  REF_TYPES,
  SPORT_KINDS,
} from "@/shared/lib/basics-constants";
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/AuthProvider";

export type UsersSectionTabId = "users" | "kyc" | "coach" | "clubs";

export type SupportSectionTabId = "tickets" | "faq";

export type GamificationSectionTabId = "achievements" | "rules" | "ledger";

export type FinanceSectionTabId = "ledger" | "payments" | "payouts" | "refunds";

export type CatalogSectionTabId =
  | "plans"
  | "food"
  | "exercises"
  | "metrics"
  | "coaching";

export type OpsSectionTabId = "social" | "audit" | "templates";

export type AnalyticsSectionPeriodId = "week" | "month" | "quarter";

const ANALYTICS_PERIODS: AnalyticsSectionPeriodId[] = [
  "week",
  "month",
  "quarter",
];

type SectionSearch = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterPress?: () => void;
};

type AdminShellProps = {
  activeNavId: AdminDashboardNavId;
  children: ReactNode;
  className?: string;
  usersSection?: SectionSearch & {
    activeTabId: UsersSectionTabId;
  };
  clubsSection?: SectionSearch;
  locationsSection?: SectionSearch & {
    activeTabId: LocationKind;
  };
  sportsSection?: SectionSearch & {
    activeTabId: SportKind;
  };
  choicesSection?: SectionSearch;
  refsSection?: SectionSearch & {
    activeTabId: RefType;
  };
  analyticsSection?: SectionSearch & {
    activePeriodId: AnalyticsSectionPeriodId;
    onPeriodChange: (id: AnalyticsSectionPeriodId) => void;
  };
  supportSection?: SectionSearch & {
    activeTabId: SupportSectionTabId;
  };
  articlesSection?: SectionSearch;
  bannersSection?: SectionSearch;
  gamificationSection?: SectionSearch & {
    activeTabId: GamificationSectionTabId;
  };
  financeSection?: SectionSearch & {
    activeTabId: FinanceSectionTabId;
  };
  catalogSection?: SectionSearch & {
    activeTabId: CatalogSectionTabId;
  };
  opsSection?: SectionSearch & {
    activeTabId: OpsSectionTabId;
  };
};

export function AdminShell({
  activeNavId,
  children,
  className,
  usersSection,
  clubsSection,
  locationsSection,
  sportsSection,
  choicesSection,
  refsSection,
  analyticsSection,
  supportSection,
  articlesSection,
  bannersSection,
  gamificationSection,
  financeSection,
  catalogSection,
  opsSection,
}: AdminShellProps) {
  const t = useTranslations("Admin");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const labels: AdminDashboardLabels = useMemo(
    () => ({
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
        users: t("nav.users"),
        clubs: t("nav.clubs"),
        bookings: t("nav.bookings"),
        finance: t("nav.finance"),
        catalogs: t("nav.catalogs"),
        ops: t("nav.ops"),
        locations: t("nav.locations"),
        sports: t("nav.sports"),
        choices: t("nav.choices"),
        refs: t("nav.refs"),
        articles: t("nav.articles"),
        banners: t("nav.banners"),
        gamification: t("nav.gamification"),
        support: t("nav.support"),
        calendar: t("nav.calendar"),
        profile: t("nav.profile"),
        settings: t("nav.settings"),
        analytics: t("nav.analytics"),
        logout: t("nav.logout"),
      },
    }),
    [t],
  );

  const usersTabs = useMemo<AdminSectionHeaderTab[]>(
    () => [
      { id: "users", label: t("Users.tabs.users") },
      { id: "kyc", label: t("Users.tabs.kyc") },
      { id: "coach", label: t("Users.tabs.coach") },
      { id: "clubs", label: t("Users.tabs.clubs") },
    ],
    [t],
  );

  const usersTabPath: Record<UsersSectionTabId, string> = {
    users: routes.users,
    kyc: routes.usersKyc,
    coach: routes.usersCoachVerifications,
    clubs: routes.usersClubReviews,
  };

  const locationTabs = useMemo<AdminSectionHeaderTab[]>(
    () =>
      LOCATION_KINDS.map((kind) => ({
        id: kind,
        label: t(`Basics.locationKinds.${kind}`),
      })),
    [t],
  );

  const sportTabs = useMemo<AdminSectionHeaderTab[]>(
    () =>
      SPORT_KINDS.map((kind) => ({
        id: kind,
        label: t(`Basics.sportKinds.${kind}`),
      })),
    [t],
  );

  const analyticsPeriodTabs = useMemo<AdminSectionHeaderTab[]>(
    () =>
      ANALYTICS_PERIODS.map((period) => ({
        id: period,
        label: t(`Analytics.periods.${period}`),
      })),
    [t],
  );

  const supportTabs = useMemo<AdminSectionHeaderTab[]>(
    () => [
      { id: "tickets", label: t("Support.tabs.tickets") },
      { id: "faq", label: t("Support.tabs.faq") },
    ],
    [t],
  );

  const supportTabPath: Record<SupportSectionTabId, string> = {
    tickets: routes.support,
    faq: routes.supportFaq,
  };

  const gamificationTabs = useMemo<AdminSectionHeaderTab[]>(
    () => [
      { id: "achievements", label: t("Gamification.tabs.achievements") },
      { id: "rules", label: t("Gamification.tabs.rules") },
      { id: "ledger", label: t("Gamification.tabs.ledger") },
    ],
    [t],
  );

  const gamificationTabPath: Record<GamificationSectionTabId, string> = {
    achievements: routes.gamification,
    rules: routes.gamificationRules,
    ledger: routes.gamificationLedger,
  };

  const refTabs = useMemo<AdminSectionHeaderTab[]>(
    () =>
      REF_TYPES.map((type) => ({
        id: type,
        label: t(`Basics.refTypes.${type}`),
      })),
    [t],
  );

  const financeTabs = useMemo<AdminSectionHeaderTab[]>(
    () => [
      { id: "ledger", label: t("Finance.tabs.ledger") },
      { id: "payments", label: t("Finance.tabs.payments") },
      { id: "payouts", label: t("Finance.tabs.payouts") },
      { id: "refunds", label: t("Finance.tabs.refunds") },
    ],
    [t],
  );

  const financeTabPath: Record<FinanceSectionTabId, string> = {
    ledger: routes.financeLedger,
    payments: routes.financePayments,
    payouts: routes.financePayouts,
    refunds: routes.financeRefunds,
  };

  const catalogTabs = useMemo<AdminSectionHeaderTab[]>(
    () => [
      { id: "plans", label: t("Catalog.tabs.plans") },
      { id: "food", label: t("Catalog.tabs.food") },
      { id: "exercises", label: t("Catalog.tabs.exercises") },
      { id: "metrics", label: t("Catalog.tabs.metrics") },
      { id: "coaching", label: t("Catalog.tabs.coaching") },
    ],
    [t],
  );

  const catalogTabPath: Record<CatalogSectionTabId, string> = {
    plans: routes.catalogPlans,
    food: routes.catalogFood,
    exercises: routes.catalogExercises,
    metrics: routes.catalogMetrics,
    coaching: routes.catalogCoaching,
  };

  const opsTabs = useMemo<AdminSectionHeaderTab[]>(
    () => [
      { id: "social", label: t("Ops.tabs.social") },
      { id: "audit", label: t("Ops.tabs.audit") },
      { id: "templates", label: t("Ops.tabs.templates") },
    ],
    [t],
  );

  const opsTabPath: Record<OpsSectionTabId, string> = {
    social: routes.opsSocial,
    audit: routes.opsAudit,
    templates: routes.opsTemplates,
  };

  const handleNav = async (id: AdminDashboardNavId) => {
    if (id === "logout") {
      await logout();
      navigate(routes.signIn, { replace: true });
      return;
    }

    const pathByNav: Partial<Record<AdminDashboardNavId, string>> = {
      home: routes.dashboard,
      users: routes.users,
      clubs: routes.clubs,
      bookings: routes.bookings,
      finance: routes.financeLedger,
      catalogs: routes.catalogPlans,
      ops: routes.opsSocial,
      locations: routes.locations(),
      sports: routes.sports(),
      choices: routes.choices,
      refs: routes.refs(),
      articles: routes.articles,
      banners: routes.banners,
      gamification: routes.gamification,
      support: routes.support,
      analytics: routes.analytics,
    };

    const path = pathByNav[id];
    if (path) navigate(path);
  };

  let header: ReactNode;

  if (usersSection) {
    header = (
      <AdminSectionHeader
        activeTabId={usersSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={
          usersSection.activeTabId === "kyc"
            ? t("Users.kycSearchAriaLabel")
            : t("Users.searchAriaLabel")
        }
        searchPlaceholder={
          usersSection.activeTabId === "kyc"
            ? t("Users.kycSearchPlaceholder")
            : t("Users.searchPlaceholder")
        }
        searchValue={usersSection.searchValue}
        tabs={usersTabs}
        onFilterPress={usersSection.onFilterPress}
        onSearchChange={usersSection.onSearchChange}
        onTabPress={(id) =>
          navigate(usersTabPath[id as UsersSectionTabId] ?? routes.users)
        }
      />
    );
  } else if (clubsSection) {
    header = (
      <AdminSectionHeader
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Clubs.searchAriaLabel")}
        searchPlaceholder={t("Clubs.searchPlaceholder")}
        searchValue={clubsSection.searchValue}
        onFilterPress={clubsSection.onFilterPress}
        onSearchChange={clubsSection.onSearchChange}
      />
    );
  } else if (locationsSection) {
    header = (
      <AdminSectionHeader
        activeTabId={locationsSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Basics.searchAriaLabel")}
        searchPlaceholder={t("Basics.searchPlaceholder")}
        searchValue={locationsSection.searchValue}
        tabs={locationTabs}
        onFilterPress={locationsSection.onFilterPress}
        onSearchChange={locationsSection.onSearchChange}
        onTabPress={(id) => navigate(routes.locations(id as LocationKind))}
      />
    );
  } else if (sportsSection) {
    header = (
      <AdminSectionHeader
        activeTabId={sportsSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Basics.searchAriaLabel")}
        searchPlaceholder={t("Basics.searchPlaceholder")}
        searchValue={sportsSection.searchValue}
        tabs={sportTabs}
        onFilterPress={sportsSection.onFilterPress}
        onSearchChange={sportsSection.onSearchChange}
        onTabPress={(id) => navigate(routes.sports(id as SportKind))}
      />
    );
  } else if (refsSection) {
    header = (
      <AdminSectionHeader
        activeTabId={refsSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Basics.searchAriaLabel")}
        searchPlaceholder={t("Basics.searchPlaceholder")}
        searchValue={refsSection.searchValue}
        tabs={refTabs}
        onFilterPress={refsSection.onFilterPress}
        onSearchChange={refsSection.onSearchChange}
        onTabPress={(id) => navigate(routes.refs(id as RefType))}
      />
    );
  } else if (analyticsSection) {
    header = (
      <AdminSectionHeader
        activeTabId={analyticsSection.activePeriodId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Analytics.searchAriaLabel")}
        searchPlaceholder={t("Analytics.searchPlaceholder")}
        searchValue={analyticsSection.searchValue}
        tabs={analyticsPeriodTabs}
        onFilterPress={analyticsSection.onFilterPress}
        onSearchChange={analyticsSection.onSearchChange}
        onTabPress={(id) =>
          analyticsSection.onPeriodChange(id as AnalyticsSectionPeriodId)
        }
      />
    );
  } else if (supportSection) {
    header = (
      <AdminSectionHeader
        activeTabId={supportSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Support.searchAriaLabel")}
        searchPlaceholder={t("Support.searchPlaceholder")}
        searchValue={supportSection.searchValue}
        tabs={supportTabs}
        onFilterPress={supportSection.onFilterPress}
        onSearchChange={supportSection.onSearchChange}
        onTabPress={(id) =>
          navigate(supportTabPath[id as SupportSectionTabId] ?? routes.support)
        }
      />
    );
  } else if (articlesSection) {
    header = (
      <AdminSectionHeader
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Articles.searchAriaLabel")}
        searchPlaceholder={t("Articles.searchPlaceholder")}
        searchValue={articlesSection.searchValue}
        onFilterPress={articlesSection.onFilterPress}
        onSearchChange={articlesSection.onSearchChange}
      />
    );
  } else if (bannersSection) {
    header = (
      <AdminSectionHeader
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Banners.searchAriaLabel")}
        searchPlaceholder={t("Banners.searchPlaceholder")}
        searchValue={bannersSection.searchValue}
        onFilterPress={bannersSection.onFilterPress}
        onSearchChange={bannersSection.onSearchChange}
      />
    );
  } else if (gamificationSection) {
    header = (
      <AdminSectionHeader
        activeTabId={gamificationSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Gamification.searchAriaLabel")}
        searchPlaceholder={t("Gamification.searchPlaceholder")}
        searchValue={gamificationSection.searchValue}
        tabs={gamificationTabs}
        onFilterPress={gamificationSection.onFilterPress}
        onSearchChange={gamificationSection.onSearchChange}
        onTabPress={(id) =>
          navigate(
            gamificationTabPath[id as GamificationSectionTabId] ??
              routes.gamification,
          )
        }
      />
    );
  } else if (financeSection) {
    header = (
      <AdminSectionHeader
        activeTabId={financeSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Finance.searchAriaLabel")}
        searchPlaceholder={t("Finance.searchPlaceholder")}
        searchValue={financeSection.searchValue}
        tabs={financeTabs}
        onFilterPress={financeSection.onFilterPress}
        onSearchChange={financeSection.onSearchChange}
        onTabPress={(id) =>
          navigate(
            financeTabPath[id as FinanceSectionTabId] ?? routes.financeLedger,
          )
        }
      />
    );
  } else if (catalogSection) {
    header = (
      <AdminSectionHeader
        activeTabId={catalogSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Catalog.searchAriaLabel")}
        searchPlaceholder={t("Catalog.searchPlaceholder")}
        searchValue={catalogSection.searchValue}
        tabs={catalogTabs}
        onFilterPress={catalogSection.onFilterPress}
        onSearchChange={catalogSection.onSearchChange}
        onTabPress={(id) =>
          navigate(
            catalogTabPath[id as CatalogSectionTabId] ?? routes.catalogPlans,
          )
        }
      />
    );
  } else if (opsSection) {
    header = (
      <AdminSectionHeader
        activeTabId={opsSection.activeTabId}
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Ops.searchAriaLabel")}
        searchPlaceholder={t("Ops.searchPlaceholder")}
        searchValue={opsSection.searchValue}
        tabs={opsTabs}
        onFilterPress={opsSection.onFilterPress}
        onSearchChange={opsSection.onSearchChange}
        onTabPress={(id) =>
          navigate(opsTabPath[id as OpsSectionTabId] ?? routes.opsSocial)
        }
      />
    );
  } else if (choicesSection) {
    header = (
      <AdminSectionHeader
        filtersAriaLabel={t("filtersAriaLabel")}
        searchAriaLabel={t("Basics.searchAriaLabel")}
        searchPlaceholder={t("Basics.searchPlaceholder")}
        searchValue={choicesSection.searchValue}
        onFilterPress={choicesSection.onFilterPress}
        onSearchChange={choicesSection.onSearchChange}
      />
    );
  } else {
    header = undefined;
  }

  return (
    <AdminDashboardLayout
      activeNavId={activeNavId}
      className={className}
      header={header}
      labels={labels}
      onLogoPress={() => navigate(routes.dashboard)}
      onNavPress={handleNav}
    >
      {children}
    </AdminDashboardLayout>
  );
}
