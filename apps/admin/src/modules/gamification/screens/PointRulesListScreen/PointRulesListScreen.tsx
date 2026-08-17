import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminPointRule, PointRuleEvent } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { PointRulesListArchiveDialogSection } from "../../sections/PointRulesListArchiveDialogSection";
import { PointRulesListHeaderSection } from "../../sections/PointRulesListHeaderSection";
import { PointRulesListTableSection } from "../../sections/PointRulesListTableSection";
import { pointRulesListScreenVariants } from "./PointRulesListScreen.styles";
import type { PointRulesListScreenProps } from "./PointRulesListScreen.types";

const PAGE_SIZE = 30;

export function PointRulesListScreen({ className }: PointRulesListScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const navigate = useNavigate();
  const styles = pointRulesListScreenVariants();

  const [eventFilter, setEventFilter] = useState<PointRuleEvent | "all">("all");
  const [search, setSearch] = useState("");
  const [archiving, setArchiving] = useState<AdminPointRule | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ eventFilter, pageSize: PAGE_SIZE }),
    [eventFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminGamification.listPointRules({
        page,
        page_size: pageSize,
        event: eventFilter === "all" ? undefined : eventFilter,
      });
    },
    [eventFilter],
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
  } = useAdminInfiniteQuery<AdminPointRule>({
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

  const handleArchive = async () => {
    if (!archiving) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await adminGamification.archivePointRule(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setArchivePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="gamification"
      className={className}
      gamificationSection={{
        activeTabId: "rules",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <PointRulesListHeaderSection
          eventFilter={eventFilter}
          onCreate={() => navigate(routes.pointRuleNew)}
          onEventChange={setEventFilter}
          onRefresh={() => void reload()}
        />

        <PointRulesListTableSection
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
          onEdit={(row) => navigate(routes.pointRuleEdit(row.id))}
          onLoadMore={loadMore}
        />
      </div>

      <PointRulesListArchiveDialogSection
        archiveError={archiveError}
        archivePending={archivePending}
        archiving={archiving}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
