import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type { Booking, BookingStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminBookings } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { bookingsListScreenVariants } from "./BookingsListScreen.styles";
import type { BookingsListScreenProps } from "./BookingsListScreen.types";

const PAGE_SIZE = 30;
const STATUSES: Array<BookingStatus | "all"> = [
  "all",
  "pending",
  "awaiting_payment",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
  "refund_requested",
  "refunded",
  "rejected",
];

const CANCELLABLE: BookingStatus[] = [
  "pending",
  "awaiting_payment",
  "confirmed",
];
const REFUNDABLE: BookingStatus[] = ["refund_requested", "cancelled"];

const columnHelper = createColumnHelper<Booking>();

type BookingTableMeta = {
  actionsClassName: string;
  onCancel: (row: Booking) => void;
  onRefund: (row: Booking) => void;
};

export function BookingsListScreen({ className }: BookingsListScreenProps) {
  const t = useTranslations("Admin.Bookings");
  const styles = bookingsListScreenVariants();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );

  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refunding, setRefunding] = useState<Booking | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, pageSize: PAGE_SIZE }),
    [statusFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminBookings.list({
        page,
        page_size: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
    },
    [statusFilter],
  );

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<Booking>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("code", {
          header: t("columns.code"),
        }),
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
          {
            id: "resource",
            header: t("columns.resource"),
          },
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
            const meta = info.table.options.meta as
              | BookingTableMeta
              | undefined;
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
    onCancel: (row) => {
      setCancelling(row);
      setCancelReason("");
      setActionError(null);
    },
    onRefund: (row) => {
      setRefunding(row);
      setActionError(null);
    },
  };

  const handleCancel = async () => {
    if (!cancelling) return;
    setPending(true);
    setActionError(null);
    try {
      await adminBookings.cancel(cancelling.id, {
        note: cancelReason.trim() || undefined,
      });
      setCancelling(null);
      void reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setPending(false);
    }
  };

  const handleRefund = async () => {
    if (!refunding) return;
    setPending(true);
    setActionError(null);
    try {
      await adminBookings.refund(refunding.id);
      setRefunding(null);
      void reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell activeNavId="bookings" className={className}>
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.subtitle()}>{t("subtitle")}</Typography>
          <div className={styles.actions()}>
            <Button onPress={() => void reload()} variant="outline">
              {t("refresh")}
            </Button>
          </div>
        </section>

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((status) => (
            <FilterChip
              key={status}
              onPress={() => setStatusFilter(status)}
              selected={statusFilter === status}
            >
              {status === "all" ? t("filterAll") : status}
            </FilterChip>
          ))}
        </div>

        <AdminDataTable
          ariaLabel={t("title")}
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
          onLoadMore={loadMore}
          summaryLabel={t("infinite.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={Boolean(cancelling)}
        title={t("actions.cancelTitle")}
        onOpenChange={(open) => {
          if (!open) setCancelling(null);
        }}
      >
        <div className="flex flex-col gap-4">
          <Typography className={styles.subtitle()}>
            {t("actions.cancelBody")}
          </Typography>
          <TextField
            fullWidth
            name="cancelReason"
            value={cancelReason}
            onChange={setCancelReason}
          >
            <Label>{t("actions.reasonLabel")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <p className="text-sm text-danger" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={pending}
              variant="danger"
              onPress={() => void handleCancel()}
            >
              {t("actions.confirm")}
            </Button>
            <Button
              isDisabled={pending}
              variant="secondary"
              onPress={() => setCancelling(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("actions.refundBody")}</p>
            {actionError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {actionError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("actions.refund")}
        confirmVariant="primary"
        isOpen={Boolean(refunding)}
        isPending={pending}
        title={t("actions.refundTitle")}
        onConfirm={() => void handleRefund()}
        onOpenChange={(open) => {
          if (!open) setRefunding(null);
        }}
      />
    </AdminShell>
  );
}
