import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AdminAchievement,
  GamificationSubjectType,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { AchievementsListHeaderSection } from "../../sections/AchievementsListHeaderSection";
import { AchievementsListModalsSection } from "../../sections/AchievementsListModalsSection";
import { AchievementsListTableSection } from "../../sections/AchievementsListTableSection";
import { achievementsListScreenVariants } from "./AchievementsListScreen.styles";
import type { AchievementsListScreenProps } from "./AchievementsListScreen.types";

const PAGE_SIZE = 30;

export function AchievementsListScreen({
  className,
}: AchievementsListScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const navigate = useNavigate();
  const styles = achievementsListScreenVariants();

  const [audienceFilter, setAudienceFilter] = useState<
    GamificationSubjectType | "all"
  >("all");
  const [search, setSearch] = useState("");

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
    () => JSON.stringify({ audienceFilter, pageSize: PAGE_SIZE }),
    [audienceFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminGamification.listAchievements({
        page,
        page_size: pageSize,
        audience: audienceFilter === "all" ? undefined : audienceFilter,
      });
    },
    [audienceFilter],
  );

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<AdminAchievement>({
    queryKey,
    pageSize: PAGE_SIZE,
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

  return (
    <AdminShell
      activeNavId="gamification"
      className={className}
      gamificationSection={{
        activeTabId: "achievements",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <AchievementsListHeaderSection
          audienceFilter={audienceFilter}
          onAudienceChange={setAudienceFilter}
          onCreate={() => navigate(routes.achievementNew)}
          onRefresh={() => void reload()}
        />

        <AchievementsListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={visibleItems}
          loading={loading}
          total={total}
          onArchive={(row) => {
            setArchiving(row);
            setArchiveError(null);
          }}
          onEdit={(row) => navigate(routes.achievementEdit(row.id))}
          onGrant={openGrant}
          onLoadMore={loadMore}
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
