import { useCallback, useMemo, useState } from "react";
import type { Booking, BookingStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminBookings } from "@/shared/lib/api";
import { BookingsListFiltersSection } from "../../sections/BookingsListFiltersSection";
import { BookingsListHeaderSection } from "../../sections/BookingsListHeaderSection";
import { BookingsListModalsSection } from "../../sections/BookingsListModalsSection";
import { BookingsListTableSection } from "../../sections/BookingsListTableSection";
import { bookingsListScreenVariants } from "./BookingsListScreen.styles";
import type { BookingsListScreenProps } from "./BookingsListScreen.types";

const PAGE_SIZE = 30;

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
        <BookingsListHeaderSection onRefresh={() => void reload()} />

        <BookingsListFiltersSection
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <BookingsListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onCancel={(row) => {
            setCancelling(row);
            setCancelReason("");
            setActionError(null);
          }}
          onLoadMore={loadMore}
          onRefund={(row) => {
            setRefunding(row);
            setActionError(null);
          }}
        />
      </div>

      <BookingsListModalsSection
        actionError={actionError}
        cancelReason={cancelReason}
        cancelling={cancelling}
        pending={pending}
        refunding={refunding}
        onCancelConfirm={() => void handleCancel()}
        onCancelReasonChange={setCancelReason}
        onCancellingOpenChange={(open) => {
          if (!open) setCancelling(null);
        }}
        onRefundConfirm={() => void handleRefund()}
        onRefundingOpenChange={(open) => {
          if (!open) setRefunding(null);
        }}
      />
    </AdminShell>
  );
}
