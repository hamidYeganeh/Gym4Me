import { useMemo } from "react";
import type { AdminKycRequest } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  createKycTableColumns,
  kycRequestId,
  type KycTableMeta,
} from "../../lib/kyc-table-columns";
import { kycListTableSectionVariants } from "./KycListTableSection.styles";
import type { KycListTableSectionProps } from "./KycListTableSection.types";

export function KycListTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onReview,
  className,
}: KycListTableSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = kycListTableSectionVariants();

  const columns = useMemo(
    () =>
      createKycTableColumns({
        columns: {
          user: t("kycColumns.user"),
          kind: t("kycColumns.kind"),
          nationalId: t("kycColumns.nationalId"),
          status: t("kycColumns.status"),
          createdAt: t("kycColumns.createdAt"),
          actions: t("kycColumns.actions"),
        },
        kind: (kind) => t(`kycKind.${kind}`),
        status: (status) => t(`kyc.${status}`),
        review: t("kycActions.review"),
      }) as ColumnDef<AdminKycRequest, unknown>[],
    [t],
  );

  const meta: KycTableMeta = {
    actionsClassName: styles.actions(),
    onReview,
  };

  return (
    <AdminDataTable
      ariaLabel={t("kycTitle")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("kycEmpty")}
      error={error}
      getRowId={(row) => kycRequestId(row)}
      hasMore={hasMore}
      isFetchingMore={fetchingMore}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      meta={meta}
      summaryLabel={t("infinite.summary", { loaded: items.length, total })}
      onLoadMore={onLoadMore}
    />
  );
}
