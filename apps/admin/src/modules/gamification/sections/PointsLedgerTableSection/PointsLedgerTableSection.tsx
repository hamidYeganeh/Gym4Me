import { useMemo } from "react";
import { Chip } from "@heroui/react/chip";
import type { PointTransactionItem } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import type { PointsLedgerTableSectionProps } from "./PointsLedgerTableSection.types";

const columnHelper = createColumnHelper<PointTransactionItem>();

export function PointsLedgerTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  className,
}: PointsLedgerTableSectionProps) {
  const t = useTranslations("Admin.Gamification");

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor((row) => row.subject, {
          id: "subject",
          header: t("ledger.columns.subject"),
          size: 220,
          enableSorting: false,
          cell: (info) => {
            const subject = info.getValue();
            return (
              <span className="text-sm">
                {t(`subjects.${subject.type}`)}
                <span className="ms-1 font-mono text-xs text-muted" dir="ltr">
                  {subject.id}
                </span>
              </span>
            );
          },
        }),
        columnHelper.accessor("amount", {
          header: t("ledger.columns.amount"),
          size: 90,
          enableSorting: false,
          cell: (info) => {
            const amount = info.getValue();
            return (
              <span
                className={
                  amount >= 0
                    ? "tabular-nums text-success"
                    : "tabular-nums text-danger"
                }
              >
                {amount > 0 ? `+${amount}` : amount}
              </span>
            );
          },
        }),
        columnHelper.accessor("reason", {
          header: t("ledger.columns.reason"),
          size: 130,
          enableSorting: false,
          cell: (info) => (
            <Chip color="default" size="sm" variant="soft">
              {t(`reasons.${info.getValue()}`)}
            </Chip>
          ),
        }),
        columnHelper.accessor("note", {
          header: t("ledger.columns.note"),
          size: 180,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate text-sm text-muted">
              {info.getValue() ?? "—"}
            </span>
          ),
        }),
        columnHelper.accessor("occurredAt", {
          header: t("ledger.columns.occurredAt"),
          size: 150,
          enableSorting: false,
          cell: (info) => (
            <span className="text-sm text-muted" dir="ltr">
              {new Date(info.getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
      ] as ColumnDef<PointTransactionItem, unknown>[],
    [t],
  );

  return (
    <AdminDataTable
      ariaLabel={t("ledger.title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("ledger.empty")}
      error={error}
      getRowId={(row) => row.id}
      hasMore={hasMore}
      isFetchingMore={fetchingMore}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      summaryLabel={t("infinite.summary", {
        loaded: items.length,
        total,
      })}
      onLoadMore={onLoadMore}
    />
  );
}
