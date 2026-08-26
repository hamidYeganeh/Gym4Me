import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LocationKind, RefType, SportKind } from "@repo/api";
import {
  AdminDashboardLayout,
  type AdminDashboardBreadcrumb,
  type AdminDashboardLabels,
  type AdminDashboardNavId,
  type AdminDashboardSecondaryNavItem,
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
import { mediaApi } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/AuthProvider";

export type UsersSectionTabId = "users" | "kyc" | "coach" | "clubs" | "roles";

export type SupportSectionTabId = "tickets" | "faq";

export type GamificationSectionTabId = "achievements" | "rules" | "ledger";

export type FinanceSectionTabId = "ledger" | "payments" | "payouts" | "refunds" | "wallets";

export type CatalogSectionTabId =
  "plans" | "food" | "exercises" | "metrics" | "coaching";

export type OpsSectionTabId =
  "social" | "audit" | "deletions" | "templates" | "flags" | "releases";

export type DiscoverySectionTabId =
  | "discovery_home"
  | "discovery_clubs"
  | "discovery_coaches"
  | "discovery_sports"
  | "discovery_articles"
  | "discovery_classes";

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
  breadcrumbs?: AdminDashboardBreadcrumb[];
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
  discoverySection?: {
    activeTabId: DiscoverySectionTabId;
  };
};

export function AdminShell({
  activeNavId,
  breadcrumbs: extraBreadcrumbs = [],
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
  discoverySection,
}: AdminShellProps) {
  const t = useTranslations("Admin");
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const avatarSrc = user?.avatar.mediaId
    ? mediaApi.fileUrl(user.avatar.mediaId)
    : undefined;

  const labels: AdminDashboardLabels = useMemo(
    () => ({
      greeting: t("greeting"),
      searchPlaceholder: t("searchPlaceholder"),
      searchAriaLabel: t("searchAriaLabel"),
      filtersAriaLabel: t("filtersAriaLabel"),
      breadcrumbsAriaLabel: t("breadcrumbsAriaLabel"),
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
        discovery: t("nav.discovery"),
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
      { id: "roles", label: t("Users.tabs.roles") },
      { id: "clubs", label: t("Users.tabs.clubs") },
    ],
    [t],
  );

  const usersTabPath: Record<UsersSectionTabId, string> = {
    users: routes.users,
    kyc: routes.usersKyc,
    coach: routes.usersCoachVerifications,
    roles: routes.usersRoleRequests,
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
      { id: "wallets", label: t("Finance.tabs.wallets") },
    ],
    [t],
  );

  const financeTabPath: Record<FinanceSectionTabId, string> = {
    ledger: routes.financeLedger,
    payments: routes.financePayments,
    payouts: routes.financePayouts,
    refunds: routes.financeRefunds,
    wallets: routes.financeWallets,
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
      { id: "deletions", label: t("Ops.tabs.deletions") },
      { id: "templates", label: t("Ops.tabs.templates") },
      { id: "flags", label: t("Ops.tabs.flags") },
      { id: "releases", label: t("Ops.tabs.releases") },
    ],
    [t],
  );

  const opsTabPath: Record<OpsSectionTabId, string> = {
    social: routes.opsSocial,
    audit: routes.opsAudit,
    deletions: routes.opsDeletions,
    templates: routes.opsTemplates,
    flags: routes.opsFlags,
    releases: routes.opsReleases,
  };

  const discoveryTabs: AdminSectionHeaderTab[] = [
    { id: "discovery_home", label: "خانه اکتشاف" },
    { id: "discovery_clubs", label: "کشف باشگاه‌ها" },
    { id: "discovery_coaches", label: "کشف مربی‌ها" },
    { id: "discovery_sports", label: "کشف ورزش‌ها" },
    { id: "discovery_articles", label: "کشف مقالات" },
    { id: "discovery_classes", label: "کشف کلاس‌ها" },
  ];

  const pathByNav = useMemo<Partial<Record<AdminDashboardNavId, string>>>(
    () => ({
      home: routes.dashboard,
      users: routes.users,
      clubs: routes.clubs,
      bookings: routes.bookings,
      finance: routes.financeLedger,
      catalogs: routes.catalogPlans,
      ops: routes.opsSocial,
      discovery: routes.discovery(),
      locations: routes.locations(),
      sports: routes.sports(),
      choices: routes.choices,
      refs: routes.refs(),
      articles: routes.articles,
      banners: routes.banners,
      gamification: routes.gamification,
      support: routes.support,
      analytics: routes.analytics,
      profile: routes.profile,
    }),
    [],
  );

  const handleNav = async (id: AdminDashboardNavId) => {
    if (id === "logout") {
      await logout();
      navigate(routes.signIn, { replace: true });
      return;
    }

    const path = pathByNav[id];
    if (path) navigate(path);
  };

  const breadcrumbs = useMemo<AdminDashboardBreadcrumb[]>(() => {
    const trail: AdminDashboardBreadcrumb[] = [
      {
        label: t("nav.home"),
        onPress:
          activeNavId === "home" && extraBreadcrumbs.length === 0
            ? undefined
            : () => navigate(routes.dashboard),
      },
    ];

    const pushCurrentOrLink = (
      label: string,
      href: string | undefined,
      isCurrent: boolean,
    ) => {
      trail.push({
        label,
        onPress: isCurrent || !href ? undefined : () => navigate(href),
      });
    };

    if (activeNavId !== "home") {
      const hasNested =
        extraBreadcrumbs.length > 0 ||
        Boolean(
          (usersSection && usersSection.activeTabId !== "users") ||
          (supportSection && supportSection.activeTabId !== "tickets") ||
          (gamificationSection &&
            gamificationSection.activeTabId !== "achievements") ||
          (financeSection && financeSection.activeTabId !== "ledger") ||
          (catalogSection && catalogSection.activeTabId !== "plans") ||
          (opsSection && opsSection.activeTabId !== "social") ||
          locationsSection ||
          sportsSection ||
          refsSection ||
          discoverySection,
        );
      pushCurrentOrLink(
        labels.nav[activeNavId],
        pathByNav[activeNavId],
        !hasNested,
      );
    }

    if (usersSection && usersSection.activeTabId !== "users") {
      pushCurrentOrLink(
        t(`Users.tabs.${usersSection.activeTabId}`),
        usersTabPath[usersSection.activeTabId],
        extraBreadcrumbs.length === 0,
      );
    } else if (supportSection && supportSection.activeTabId !== "tickets") {
      pushCurrentOrLink(
        t(`Support.tabs.${supportSection.activeTabId}`),
        supportTabPath[supportSection.activeTabId],
        extraBreadcrumbs.length === 0,
      );
    } else if (
      gamificationSection &&
      gamificationSection.activeTabId !== "achievements"
    ) {
      pushCurrentOrLink(
        t(`Gamification.tabs.${gamificationSection.activeTabId}`),
        gamificationTabPath[gamificationSection.activeTabId],
        extraBreadcrumbs.length === 0,
      );
    } else if (financeSection && financeSection.activeTabId !== "ledger") {
      pushCurrentOrLink(
        t(`Finance.tabs.${financeSection.activeTabId}`),
        financeTabPath[financeSection.activeTabId],
        extraBreadcrumbs.length === 0,
      );
    } else if (catalogSection && catalogSection.activeTabId !== "plans") {
      pushCurrentOrLink(
        t(`Catalog.tabs.${catalogSection.activeTabId}`),
        catalogTabPath[catalogSection.activeTabId],
        extraBreadcrumbs.length === 0,
      );
    } else if (opsSection && opsSection.activeTabId !== "social") {
      pushCurrentOrLink(
        t(`Ops.tabs.${opsSection.activeTabId}`),
        opsTabPath[opsSection.activeTabId],
        extraBreadcrumbs.length === 0,
      );
    } else if (locationsSection) {
      pushCurrentOrLink(
        t(`Basics.locationKinds.${locationsSection.activeTabId}`),
        routes.locations(locationsSection.activeTabId),
        extraBreadcrumbs.length === 0,
      );
    } else if (sportsSection) {
      pushCurrentOrLink(
        t(`Basics.sportKinds.${sportsSection.activeTabId}`),
        routes.sports(sportsSection.activeTabId),
        extraBreadcrumbs.length === 0,
      );
    } else if (refsSection) {
      pushCurrentOrLink(
        t(`Basics.refTypes.${refsSection.activeTabId}`),
        routes.refs(refsSection.activeTabId),
        extraBreadcrumbs.length === 0,
      );
    }

    trail.push(...extraBreadcrumbs);
    return trail;
  }, [
    activeNavId,
    catalogSection,
    extraBreadcrumbs,
    financeSection,
    gamificationSection,
    labels.nav,
    locationsSection,
    navigate,
    opsSection,
    pathByNav,
    refsSection,
    discoverySection,
    sportsSection,
    supportSection,
    t,
    usersSection,
  ]);

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
        onFilterPress={usersSection.onFilterPress}
        onSearchChange={usersSection.onSearchChange}
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
        onFilterPress={locationsSection.onFilterPress}
        onSearchChange={locationsSection.onSearchChange}
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
        onFilterPress={sportsSection.onFilterPress}
        onSearchChange={sportsSection.onSearchChange}
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
        onFilterPress={refsSection.onFilterPress}
        onSearchChange={refsSection.onSearchChange}
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
        onFilterPress={supportSection.onFilterPress}
        onSearchChange={supportSection.onSearchChange}
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
        onFilterPress={gamificationSection.onFilterPress}
        onSearchChange={gamificationSection.onSearchChange}
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
        onFilterPress={financeSection.onFilterPress}
        onSearchChange={financeSection.onSearchChange}
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
        onFilterPress={catalogSection.onFilterPress}
        onSearchChange={catalogSection.onSearchChange}
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
        onFilterPress={opsSection.onFilterPress}
        onSearchChange={opsSection.onSearchChange}
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

  const secondaryItems = (
    tabs: AdminSectionHeaderTab[],
    activeId: string,
    pathFor: (id: string) => string,
  ): AdminDashboardSecondaryNavItem[] =>
    tabs.map((tab) => ({
      id: tab.id,
      label: tab.label,
      isActive: tab.id === activeId,
      onPress: () => navigate(pathFor(tab.id)),
    }));

  const secondaryNav = usersSection
    ? {
        ariaLabel: t("Users.title"),
        title: labels.nav.users,
        items: secondaryItems(
          usersTabs,
          usersSection.activeTabId,
          (id) => usersTabPath[id as UsersSectionTabId] ?? routes.users,
        ),
      }
    : locationsSection
      ? {
          ariaLabel: labels.nav.locations,
          title: labels.nav.locations,
          items: secondaryItems(
            locationTabs,
            locationsSection.activeTabId,
            (id) => routes.locations(id as LocationKind),
          ),
        }
      : sportsSection
        ? {
            ariaLabel: labels.nav.sports,
            title: labels.nav.sports,
            items: secondaryItems(sportTabs, sportsSection.activeTabId, (id) =>
              routes.sports(id as SportKind),
            ),
          }
        : refsSection
          ? {
              ariaLabel: labels.nav.refs,
              title: labels.nav.refs,
              presentation: "rail" as const,
              items: secondaryItems(refTabs, refsSection.activeTabId, (id) =>
                routes.refs(id as RefType),
              ),
            }
          : supportSection
            ? {
                ariaLabel: labels.nav.support,
                title: labels.nav.support,
                items: secondaryItems(
                  supportTabs,
                  supportSection.activeTabId,
                  (id) =>
                    supportTabPath[id as SupportSectionTabId] ?? routes.support,
                ),
              }
            : gamificationSection
              ? {
                  ariaLabel: labels.nav.gamification,
                  title: labels.nav.gamification,
                  items: secondaryItems(
                    gamificationTabs,
                    gamificationSection.activeTabId,
                    (id) =>
                      gamificationTabPath[id as GamificationSectionTabId] ??
                      routes.gamification,
                  ),
                }
              : financeSection
                ? {
                    ariaLabel: labels.nav.finance,
                    title: labels.nav.finance,
                    items: secondaryItems(
                      financeTabs,
                      financeSection.activeTabId,
                      (id) =>
                        financeTabPath[id as FinanceSectionTabId] ??
                        routes.financeLedger,
                    ),
                  }
                : catalogSection
                  ? {
                      ariaLabel: labels.nav.catalogs,
                      title: labels.nav.catalogs,
                      items: secondaryItems(
                        catalogTabs,
                        catalogSection.activeTabId,
                        (id) =>
                          catalogTabPath[id as CatalogSectionTabId] ??
                          routes.catalogPlans,
                      ),
                    }
                  : opsSection
                    ? {
                        ariaLabel: labels.nav.ops,
                        title: labels.nav.ops,
                        items: secondaryItems(
                          opsTabs,
                          opsSection.activeTabId,
                          (id) =>
                            opsTabPath[id as OpsSectionTabId] ??
                            routes.opsSocial,
                        ),
                      }
                    : discoverySection
                      ? {
                          ariaLabel: labels.nav.discovery,
                          title: labels.nav.discovery,
                          items: secondaryItems(
                            discoveryTabs,
                            discoverySection.activeTabId,
                            (id) => routes.discovery(id),
                          ),
                        }
                      : undefined;

  return (
    <AdminDashboardLayout
      activeNavId={activeNavId}
      avatarSrc={avatarSrc}
      breadcrumbs={breadcrumbs}
      className={className}
      header={header}
      labels={labels}
      notificationCount={0}
      secondaryNav={secondaryNav}
      onAvatarPress={() => navigate(routes.profile)}
      onLogoPress={() => navigate(routes.dashboard)}
      onNavPress={handleNav}
    >
      {children}
    </AdminDashboardLayout>
  );
}
