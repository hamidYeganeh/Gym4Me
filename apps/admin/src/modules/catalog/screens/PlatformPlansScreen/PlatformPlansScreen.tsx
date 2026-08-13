import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Typography } from "@heroui/react";
import type { PlatformPlan } from "@repo/api";
import { ApiError } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminMemberships } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { platformPlansScreenVariants } from "./PlatformPlansScreen.styles";
import type { PlatformPlansScreenProps } from "./PlatformPlansScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<PlatformPlan>();

type PlanTableMeta = {
  actionsClassName: string;
  onEdit: (row: PlatformPlan) => void;
  onArchive: (row: PlatformPlan) => void;
};

export function PlatformPlansScreen({ className }: PlatformPlansScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const navigate = useNavigate();
  const styles = platformPlansScreenVariants();

  const [archiving, setArchiving] = useState<PlatformPlan | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, pageSize: number) => {
    return adminMemberships.listPlatformPlans({
      page,
      page_size: pageSize,
    });
  }, []);

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<PlatformPlan>({
    queryKey: "platform-plans",
    pageSize: PAGE_SIZE,
    errorFallback: t("plans.errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("code", {
          header: t("plans.columns.code"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("name", {
          header: t("plans.columns.name"),
        }),
        columnHelper.accessor((row) => row.pricing.amount, {
          id: "amount",
          header: t("plans.columns.amount"),
          cell: ({ getValue }) => (
            <span className="tabular-nums">
              {Number(getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.pricing.periodDays ?? "—", {
          id: "periodDays",
          header: t("plans.columns.periodDays"),
        }),
        columnHelper.accessor("status", {
          header: t("plans.columns.status"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "active" ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("plans.columns.actions"),
          size: 170,
          cell: (info) => {
            const meta = info.table.options.meta as PlanTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onArchive(info.row.original)}
                >
                  {t("archive")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<PlatformPlan, unknown>[],
    [t],
  );

  const meta: PlanTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.catalogPlanEdit(row.id)),
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
      await adminMemberships.archivePlatformPlan(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
    } finally {
      setArchivePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      className={className}
      catalogSection={{ activeTabId: "plans" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("plans.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("plans.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button
              size="sm"
              variant="primary"
              onPress={() => navigate(routes.catalogPlanNew)}
            >
              {t("create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("plans.title")}
          columns={columns}
          data={items}
          emptyLabel={t("plans.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("plans.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("plans.archiveBody")}</p>
            {archiveError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {archiveError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={archivePending}
        title={t("plans.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
