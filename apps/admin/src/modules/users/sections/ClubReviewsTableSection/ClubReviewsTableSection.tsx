import { useMemo } from "react";
import { Button, Chip } from "@heroui/react";
import type { Club } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { formatAdminDate } from "@/shared/lib/user-format";
import { clubReviewsTableSectionVariants } from "./ClubReviewsTableSection.styles";
import type { ClubReviewsTableSectionProps } from "./ClubReviewsTableSection.types";

const columnHelper = createColumnHelper<Club>();

export function ClubReviewsTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onReview,
  className,
}: ClubReviewsTableSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = clubReviewsTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor((row) => row.identity.name, {
          id: "name",
          header: t("clubsColumns.name"),
          size: 200,
          cell: (info) => (
            <span className="font-medium">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor((row) => row.review.status, {
          id: "status",
          header: t("clubsColumns.status"),
          size: 140,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "approved"
                ? "success"
                : status === "rejected" || status === "suspended"
                  ? "danger"
                  : "warning";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`clubLifecycle.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.accessor((row) => row.review.submittedAt, {
          id: "submittedAt",
          header: t("clubsColumns.submittedAt"),
          size: 140,
          cell: (info) =>
            info.getValue() ? formatAdminDate(info.getValue()!) : "—",
        }),
        columnHelper.display({
          id: "actions",
          header: t("clubsColumns.actions"),
          size: 120,
          cell: (info) => (
            <div className={styles.actions()}>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => onReview(info.row.original)}
              >
                {t("kycActions.review")}
              </Button>
            </div>
          ),
        }),
      ] as ColumnDef<Club, unknown>[],
    [onReview, styles, t],
  );

  return (
    <AdminDataTable
      ariaLabel={t("clubsTitle")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("clubsEmpty")}
      error={error}
      getRowId={(row) => row.id}
      hasMore={hasMore}
      isFetchingMore={fetchingMore}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      summaryLabel={t("infinite.summary", { loaded: items.length, total })}
      onLoadMore={onLoadMore}
    />
  );
}
