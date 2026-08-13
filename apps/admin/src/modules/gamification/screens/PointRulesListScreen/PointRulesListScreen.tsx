import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Typography } from "@heroui/react";
import type { AdminPointRule, PointRuleEvent } from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { POINT_RULE_EVENTS } from "../../lib/gamification-constants";
import { pointRulesListScreenVariants } from "./PointRulesListScreen.styles";
import type { PointRulesListScreenProps } from "./PointRulesListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminPointRule>();

type RuleTableMeta = {
  onEdit: (row: AdminPointRule) => void;
  onArchive: (row: AdminPointRule) => void;
  actionsClassName: string;
};

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

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("title", {
          header: t("rules.columns.title"),
          size: 190,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("event", {
          header: t("rules.columns.event"),
          size: 160,
          enableSorting: false,
          cell: (info) => t(`events.${info.getValue()}`),
        }),
        columnHelper.accessor("awards", {
          header: t("rules.columns.awards"),
          size: 220,
          enableSorting: false,
          cell: (info) => (
            <span className="text-sm">
              {info
                .getValue()
                .map(
                  (award) =>
                    `${t(`subjects.${award.subjectType}`)}: ${award.points}`,
                )
                .join(" · ")}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.limits, {
          id: "limits",
          header: t("rules.columns.limits"),
          size: 170,
          enableSorting: false,
          cell: (info) => {
            const limits = info.getValue();
            const cap = limits.dailyCap
              ? ` · ${t("rules.dailyCapShort", { cap: limits.dailyCap })}`
              : "";
            return (
              <span className="text-sm">
                {t(`repeats.${limits.repeat}`)}
                {cap}
              </span>
            );
          },
        }),
        columnHelper.accessor("status", {
          header: t("rules.columns.status"),
          size: 100,
          enableSorting: false,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "active"
                ? "success"
                : status === "inactive"
                  ? "warning"
                  : "danger";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`statuses.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("rules.columns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as RuleTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onArchive(info.row.original)}
                >
                  {t("actions.archive")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<AdminPointRule, unknown>[],
    [t],
  );

  const meta: RuleTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.pointRuleEdit(row.id)),
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

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
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("rules.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("rules.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(["all", ...POINT_RULE_EVENTS] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setEventFilter(value)}
                selected={eventFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`events.${value}`)}
              </FilterChip>
            ))}
            <Button
              size="sm"
              variant="primary"
              onPress={() => navigate(routes.pointRuleNew)}
            >
              {t("rules.actions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("rules.title")}
          columns={columns}
          data={visibleItems}
          emptyLabel={t("rules.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          summaryLabel={t("infinite.summary", {
            loaded: visibleItems.length,
            total,
          })}
          onLoadMore={loadMore}
        />
      </div>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("rules.actions.archiveBody")}</p>
            {archiveError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {archiveError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("actions.archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={archivePending}
        title={t("rules.actions.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
