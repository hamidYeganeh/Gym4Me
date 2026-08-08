import { useMemo } from "react";
import type { Club } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  createClubsTableColumns,
  type ClubsTableMeta,
} from "../../lib/clubs-table-columns";
import { clubsListTableSectionVariants } from "./ClubsListTableSection.styles";
import type { ClubsListTableSectionProps } from "./ClubsListTableSection.types";

export function ClubsListTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onView,
  toolbar,
  className,
}: ClubsListTableSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const styles = clubsListTableSectionVariants();

  const columns = useMemo(
    () =>
      createClubsTableColumns({
        columns: {
          name: t("columns.name"),
          owner: t("columns.owner"),
          categories: t("columns.categories"),
          lifecycle: t("columns.lifecycle"),
          operational: t("columns.operational"),
          reviews: t("columns.reviews"),
          createdAt: t("columns.createdAt"),
          actions: t("columns.actions"),
        },
        lifecycle: (value) => t(`lifecycle.${value}`),
        operational: (value) => t(`operational.${value}`),
        view: t("actions.view"),
      }) as ColumnDef<Club, unknown>[],
    [t],
  );

  const tableMeta = useMemo<ClubsTableMeta>(
    () => ({
      onView,
      chipsClassName: styles.chips(),
      actionsClassName: styles.actionsCell(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onView],
  );

  return (
    <AdminDataTable<Club>
      ariaLabel={t("title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("empty")}
      error={error}
      getRowId={(row) => row.id}
      hasMore={hasMore}
      isFetchingMore={fetchingMore}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      meta={tableMeta}
      summaryLabel={t("infinite.summary", {
        loaded: items.length,
        total,
      })}
      toolbar={toolbar}
      onLoadMore={onLoadMore}
    />
  );
}
