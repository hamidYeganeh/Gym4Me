import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { CoachVerificationItem } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { formatAdminDate } from "@/shared/lib/user-format";
import { coachVerificationsTableSectionVariants } from "./CoachVerificationsTableSection.styles";
import {
  coachUserLabel,
  type CoachVerificationsTableSectionProps,
} from "./CoachVerificationsTableSection.types";

const columnHelper = createColumnHelper<CoachVerificationItem>();

export function CoachVerificationsTableSection({
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
}: CoachVerificationsTableSectionProps) {
  const t = useTranslations("Admin.Users");
  const tCommon = useTranslations("Admin.Common");
  const styles = coachVerificationsTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.display({
          id: "user",
          header: t("coachColumns.user"),
          size: 200,
          cell: (info) => (
            <span className="block truncate font-medium">
              {coachUserLabel(info.row.original)}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.verification.status ?? "pending", {
          id: "status",
          header: t("coachColumns.status"),
          size: 120,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "approved"
                ? "success"
                : status === "rejected"
                  ? "danger"
                  : "warning";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`verification.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.accessor((row) => row.verification.submittedAt, {
          id: "submittedAt",
          header: t("coachColumns.submittedAt"),
          size: 140,
          cell: (info) =>
            info.getValue() ? formatAdminDate(info.getValue()!) : "—",
        }),
        columnHelper.display({
          id: "actions",
          header: t("coachColumns.actions"),
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
      ] as ColumnDef<CoachVerificationItem, unknown>[],
    [onReview, styles, t],
  );

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("coachTitle")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("coachEmpty")}
      error={error}
      getRowId={(row) => row.userId}
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
