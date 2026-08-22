import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { AdminAchievement } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { achievementsListTableSectionVariants } from "./AchievementsListTableSection.styles";
import type {
  AchievementTableMeta,
  AchievementsListTableSectionProps,
} from "./AchievementsListTableSection.types";

const columnHelper = createColumnHelper<AdminAchievement>();

export function AchievementsListTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  onEdit,
  onGrant,
  onArchive,
  className,
}: AchievementsListTableSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const tCommon = useTranslations("Admin.Common");
  const styles = achievementsListTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("title", {
          header: t("achievements.columns.title"),
          size: 200,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("audience", {
          header: t("achievements.columns.audience"),
          size: 160,
          enableSorting: false,
          cell: (info) => (
            <span>
              {info
                .getValue()
                .map((value) => t(`subjects.${value}`))
                .join("، ")}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.grant, {
          id: "grant",
          header: t("achievements.columns.grant"),
          size: 190,
          enableSorting: false,
          cell: (info) => {
            const grant = info.getValue();
            if (grant.mode === "manual") {
              return (
                <Chip color="default" size="sm" variant="soft">
                  {t("grantModes.manual")}
                </Chip>
              );
            }
            return (
              <span className="text-sm">
                {grant.rule
                  ? `${t(`metrics.${grant.rule.metric}`)} ≥ ${grant.rule.threshold}`
                  : t("grantModes.automatic")}
              </span>
            );
          },
        }),
        columnHelper.accessor("bonusPoints", {
          header: t("achievements.columns.bonusPoints"),
          size: 90,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor((row) => row.grantsCount ?? 0, {
          id: "grantsCount",
          header: t("achievements.columns.grantsCount"),
          size: 90,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("achievements.columns.status"),
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
          header: t("achievements.columns.actions"),
          size: 230,
          cell: (info) => {
            const meta = info.table.options.meta as
              | AchievementTableMeta
              | undefined;
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
                  variant="tertiary"
                  onPress={() => meta.onGrant(info.row.original)}
                >
                  {t("actions.grant")}
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
      ] as ColumnDef<AdminAchievement, unknown>[],
    [t],
  );

  const meta: AchievementTableMeta = {
    actionsClassName: styles.actions(),
    onEdit,
    onGrant,
    onArchive,
  };

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("achievements.title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("achievements.empty")}
      error={error}
      getRowId={(row) => row.id}
      isLoading={loading}
      loadingLabel={t("loading")}
      meta={meta}
      pagination={adminListPaginationProps({
        page,
        totalPages,
        previousLabel: tCommon("pagination.previous"),
        nextLabel: tCommon("pagination.next"),
        onPageChange,
      })}
      summaryLabel={tCommon("pagination.summary", summary)}
    />
  );
}
