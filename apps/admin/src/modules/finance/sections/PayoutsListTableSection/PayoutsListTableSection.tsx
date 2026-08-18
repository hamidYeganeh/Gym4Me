import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { Payout } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { formatAdminDate } from "@/shared/lib/user-format";
import { payoutsListTableSectionVariants } from "./PayoutsListTableSection.styles";
import type {
  PayoutsListTableSectionProps,
  PayoutTableMeta,
} from "./PayoutsListTableSection.types";

const columnHelper = createColumnHelper<Payout>();

export function PayoutsListTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onSettle,
  onDispute,
  onResolve,
  className,
}: PayoutsListTableSectionProps) {
  const t = useTranslations("Admin.Finance");
  const styles = payoutsListTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor(
          (row) => `${row.recipient.type}:${row.recipient.id}`,
          {
            id: "recipient",
            header: t("payouts.columns.recipient"),
            cell: ({ getValue }) => (
              <span className="block max-w-48 truncate" dir="ltr">
                {getValue()}
              </span>
            ),
          },
        ),
        columnHelper.accessor("amount", {
          header: t("payouts.columns.amount"),
          cell: ({ getValue }) => (
            <span className="tabular-nums">
              {Number(getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
        columnHelper.accessor(
          (row) =>
            `${formatAdminDate(row.period.from)} – ${formatAdminDate(row.period.to)}`,
          {
            id: "period",
            header: t("payouts.columns.period"),
          },
        ),
        columnHelper.accessor("status", {
          header: t("payouts.columns.status"),
          cell: ({ getValue }) => {
            const status = getValue();
            const color =
              status === "settled"
                ? "success"
                : status === "disputed" || status === "cancelled"
                  ? "danger"
                  : "warning";
            return (
              <Chip color={color} size="sm" variant="soft">
                <Chip.Label>{status}</Chip.Label>
              </Chip>
            );
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("payouts.columns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: t("payouts.columns.actions"),
          size: 220,
          cell: (info) => {
            const meta = info.table.options.meta as PayoutTableMeta | undefined;
            if (!meta) return null;
            const row = info.row.original;
            return (
              <div className={meta.actionsClassName}>
                {row.status === "pending" || row.status === "processing" ? (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => meta.onSettle(row)}
                    >
                      {t("payouts.actions.settle")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => meta.onDispute(row)}
                    >
                      {t("payouts.actions.dispute")}
                    </Button>
                  </>
                ) : null}
                {row.status === "disputed" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => meta.onResolve(row)}
                  >
                    {t("payouts.actions.resolve")}
                  </Button>
                ) : null}
              </div>
            );
          },
        }),
      ] as ColumnDef<Payout, unknown>[],
    [t],
  );

  const meta = useMemo<PayoutTableMeta>(
    () => ({
      actionsClassName: styles.actions(),
      onSettle,
      onDispute,
      onResolve,
    }),
    [onDispute, onResolve, onSettle, styles],
  );

  return (
    <AdminDataTable
      ariaLabel={t("payouts.title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("payouts.empty")}
      error={error}
      getRowId={(row) => row._id}
      hasMore={hasMore}
      isFetchingMore={fetchingMore}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      meta={meta}
      summaryLabel={t("payouts.summary", {
        loaded: items.length,
        total,
      })}
      onLoadMore={onLoadMore}
    />
  );
}
