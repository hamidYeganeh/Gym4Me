import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AdminAchievement,
  EntityStatus,
  GamificationSubjectType,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { AchievementsListHeaderSection } from "../../sections/AchievementsListHeaderSection";
import { AchievementsListModalsSection } from "../../sections/AchievementsListModalsSection";
import { AchievementsListTableSection } from "../../sections/AchievementsListTableSection";
import { achievementsListScreenVariants } from "./AchievementsListScreen.styles";
import type { AchievementsListScreenProps } from "./AchievementsListScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["audience", "status"] as const;

type AchievementsListFilters = {
  audience: GamificationSubjectType | "all";
  status: EntityStatus | "all";
};

const FILTER_DEFAULTS: AchievementsListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  audience: "all",
  status: "all",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function AchievementsListScreen({
  className,
}: AchievementsListScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const navigate = useNavigate();
  const styles = achievementsListScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<AchievementsListFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [seeding, setSeeding] = useState(false);

  const [archiving, setArchiving] = useState<AdminAchievement | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const [granting, setGranting] = useState<AdminAchievement | null>(null);
  const [grantSubjectType, setGrantSubjectType] =
    useState<GamificationSubjectType>("athlete");
  const [grantSubjectId, setGrantSubjectId] = useState("");
  const [grantPending, setGrantPending] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantDone, setGrantDone] = useState(false);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, pageSize }),
    [filters, pageSize],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminGamification.listAchievements({
        page: nextPage,
        page_size: nextPageSize,
        audience: filters.audience === "all" ? undefined : filters.audience,
        status: filters.status === "all" ? undefined : filters.status,
      });
    },
    [filters],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<AdminAchievement>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const visibleItems = useMemo(() => {
    const term = search.trim();
    if (!term) return items;
    return items.filter((item) => item.title.includes(term));
  }, [items, search]);

  const openGrant = (row: AdminAchievement) => {
    setGranting(row);
    setGrantSubjectType(row.audience[0] ?? "athlete");
    setGrantSubjectId("");
    setGrantError(null);
    setGrantDone(false);
  };

  const handleArchive = async () => {
    if (!archiving) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await adminGamification.archiveAchievement(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setArchivePending(false);
    }
  };

  const handleGrant = async () => {
    if (!granting || !grantSubjectId.trim()) return;
    setGrantPending(true);
    setGrantError(null);
    setGrantDone(false);
    try {
      await adminGamification.grantAchievement(granting.id, {
        subjectType: grantSubjectType,
        subjectId: grantSubjectId.trim(),
      });
      setGrantDone(true);
      void reload();
    } catch (err) {
      setGrantError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setGrantPending(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const result = await adminGamification.seedAchievementDefaults();
      toast.success(
        t("importDefaultsDone", {
          created: result.created.length,
          updated: result.updated.length,
          skipped: result.skipped.length,
        }),
      );
      void reload();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message || t("importDefaultsError")
          : t("importDefaultsError"),
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminShell
      activeNavId="gamification"
      className={className}
      gamificationSection={{
        activeTabId: "achievements",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <AchievementsListHeaderSection
          audienceFilter={filters.audience}
          importDefaultsPending={seeding}
          statusFilter={filters.status}
          onAudienceChange={(value) => setFilter("audience", value)}
          onCreate={() => navigate(routes.achievementNew)}
          onImportDefaults={() => void handleSeedDefaults()}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("status", value)}
        />

        <AchievementsListTableSection
          error={error}
          items={visibleItems}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onArchive={(row) => {
            setArchiving(row);
            setArchiveError(null);
          }}
          onEdit={(row) => navigate(routes.achievementEdit(row.id))}
          onGrant={openGrant}
          onPageChange={changePage}
        />
      </div>

      <AchievementsListModalsSection
        archiveError={archiveError}
        archivePending={archivePending}
        archiving={archiving}
        grantDone={grantDone}
        grantError={grantError}
        grantPending={grantPending}
        grantSubjectId={grantSubjectId}
        grantSubjectType={grantSubjectType}
        granting={granting}
        onArchiveConfirm={() => void handleArchive()}
        onArchivingOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
        onGrantConfirm={() => void handleGrant()}
        onGrantSubjectIdChange={setGrantSubjectId}
        onGrantSubjectTypeChange={setGrantSubjectType}
        onGrantingOpenChange={(open) => {
          if (!open) setGranting(null);
        }}
      />
    </AdminShell>
  );
}
