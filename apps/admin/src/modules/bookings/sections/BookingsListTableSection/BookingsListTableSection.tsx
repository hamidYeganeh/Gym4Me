import { useMemo } from "react";
import { Button, Chip } from "@heroui/react";
import type { Booking } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { formatAdminDate } from "@/shared/lib/user-format";
import {
  CANCELLABLE,
  REFUNDABLE,
} from "../BookingsListFiltersSection";
import { bookingsListTableSectionVariants } from "./BookingsListTableSection.styles";
import type {
  BookingTableMeta,
  BookingsListTableSectionProps,
} from "./BookingsListTableSection.types";

const columnHelper = createColumnHelper<Booking>();

export function BookingsListTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onCancel,
  onRefund,
  className,
}: BookingsListTableSectionProps) {
  const t = useTranslations("Admin.Bookings");
  const styles = bookingsListTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("code", { header: t("columns.code") }),
        columnHelper.accessor("status", {
          header: t("columns.status"),
          cell: ({ getValue }) => (
            <Chip size="sm" variant="soft">
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor(
          (row) => row.resource.title ?? row.resource.type,
          { id: "resource", header: t("columns.resource") },
        ),
        columnHelper.accessor((row) => row.club?.name ?? "—", {
          id: "club",
          header: t("columns.club"),
        }),
        columnHelper.accessor("startsAt", {
          header: t("columns.startsAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.accessor((row) => row.pricing.total, {
          id: "total",
          header: t("columns.total"),
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          size: 180,
          cell: (info) => {
            const meta = info.table.options.meta as BookingTableMeta | undefined;
            if (!meta) return null;
            const row = info.row.original;
            const canCancel = CANCELLABLE.includes(row.status);
            const canRefund =
              REFUNDABLE.includes(row.status) && Boolean(row.payment?.paidAt);
            if (!canCancel && !canRefund) return null;
            return (
              <div className={meta.actionsClassName}>
                {canCancel ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onPress={() => meta.onCancel(row)}
                  >
                    {t("actions.cancelBooking")}
                  </Button>
                ) : null}
                {canRefund ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => meta.onRefund(row)}
                  >
                    {t("actions.refund")}
                  </Button>
                ) : null}
              </div>
            );
          },
        }),
      ] as ColumnDef<Booking, unknown>[],
    [t],
  );

  const meta: BookingTableMeta = {
    actionsClassName: styles.actions(),
    onCancel,
    onRefund,
  };

  return (
    <AdminDataTable
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
      meta={meta}
      summaryLabel={t("infinite.summary", { loaded: items.length, total })}
      onLoadMore={onLoadMore}
    />
  );
}
