import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { AdminPointRule } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { pointRulesListTableSectionVariants } from "./PointRulesListTableSection.styles";
import type {
  PointRulesListTableSectionProps,
  PointRulesTableMeta,
} from "./PointRulesListTableSection.types";

const columnHelper = createColumnHelper<AdminPointRule>();

export function PointRulesListTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onEdit,
  onArchive,
  className,
}: PointRulesListTableSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointRulesListTableSectionVariants();

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
            const meta = info.table.options.meta as PointRulesTableMeta | undefined;
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

  const meta: PointRulesTableMeta = {
    actionsClassName: styles.actions(),
    onEdit,
    onArchive,
  };

  return (
    <AdminDataTable
      ariaLabel={t("rules.title")}
      className={className}
      columns={columns}
      data={items}
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
        loaded: items.length,
        total,
      })}
      onLoadMore={onLoadMore}
    />
  );
}
