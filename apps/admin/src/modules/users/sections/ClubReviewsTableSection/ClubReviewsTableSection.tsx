import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { Club } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { formatAdminDate } from "@/shared/lib/user-format";
import { clubReviewsTableSectionVariants } from "./ClubReviewsTableSection.styles";
import type { ClubReviewsTableSectionProps } from "./ClubReviewsTableSection.types";

const columnHelper = createColumnHelper<Club>();

export function ClubReviewsTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  onReview,
  className,
}: ClubReviewsTableSectionProps) {
  const t = useTranslations("Admin.Users");
  const tCommon = useTranslations("Admin.Common");
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

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("clubsTitle")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("clubsEmpty")}
      error={error}
      getRowId={(row) => row.id}
      isLoading={loading}
      loadingLabel={t("loading")}
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
