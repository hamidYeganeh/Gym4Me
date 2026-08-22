import { useCallback, useMemo, useState } from "react";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import type {
  Booking,
  BookingResourceType,
  BookingStatus,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminBookings } from "@/shared/lib/api";
import {
  BookingsListFiltersSection,
  type BookingBucketFilter,
} from "../../sections/BookingsListFiltersSection";
import { BookingsListHeaderSection } from "../../sections/BookingsListHeaderSection";
import { BookingsListModalsSection } from "../../sections/BookingsListModalsSection";
import { BookingsListTableSection } from "../../sections/BookingsListTableSection";
import { bookingsListScreenVariants } from "./BookingsListScreen.styles";
import type { BookingsListScreenProps } from "./BookingsListScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = [
  "status",
  "bucket",
  "resourceType",
  "from",
  "to",
  "athleteId",
  "coachUserId",
  "clubId",
] as const;

type BookingsListFilters = {
  status: BookingStatus | "all";
  bucket: BookingBucketFilter;
  resourceType: BookingResourceType | "all";
  from: string;
  to: string;
  athleteId: string;
  coachUserId: string;
  clubId: string;
};

const FILTER_DEFAULTS: BookingsListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  status: "all",
  bucket: "all",
  resourceType: "all",
  from: "",
  to: "",
  athleteId: "",
  coachUserId: "",
  clubId: "",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function BookingsListScreen({ className }: BookingsListScreenProps) {
  const t = useTranslations("Admin.Bookings");
  const styles = bookingsListScreenVariants();

  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refunding, setRefunding] = useState<Booking | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<BookingsListFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        search,
        filters,
        pageSize,
      }),
    [filters, pageSize, search],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminBookings.list({
        page: nextPage,
        page_size: nextPageSize,
        search: search || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        bucket: filters.bucket === "all" ? undefined : filters.bucket,
        resource_type:
          filters.resourceType === "all" ? undefined : filters.resourceType,
        from: filters.from || undefined,
        to: filters.to || undefined,
        athleteId: filters.athleteId.trim() || undefined,
        coachUserId: filters.coachUserId.trim() || undefined,
        clubId: filters.clubId.trim() || undefined,
      });
    },
    [filters, search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<Booking>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
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

        <TextField
          name="bookings-search"
          value={searchInput}
          onChange={setSearchInput}
        >
          <Label>{t("searchLabel")}</Label>
          <Input placeholder={t("searchPlaceholder")} />
        </TextField>

        <BookingsListFiltersSection
          athleteId={filters.athleteId}
          bucket={filters.bucket}
          clubId={filters.clubId}
          coachUserId={filters.coachUserId}
          from={filters.from}
          resourceType={filters.resourceType}
          status={filters.status}
          to={filters.to}
          onAthleteIdChange={(value) => setFilter("athleteId", value)}
          onBucketChange={(value) => setFilter("bucket", value)}
          onClubIdChange={(value) => setFilter("clubId", value)}
          onCoachUserIdChange={(value) => setFilter("coachUserId", value)}
          onFromChange={(value) => setFilter("from", value)}
          onResourceTypeChange={(value) => setFilter("resourceType", value)}
          onStatusChange={(value) => setFilter("status", value)}
          onToChange={(value) => setFilter("to", value)}
        />

        <BookingsListTableSection
          error={error}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onCancel={(row) => {
            setCancelling(row);
            setCancelReason("");
            setActionError(null);
          }}
          onPageChange={changePage}
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
