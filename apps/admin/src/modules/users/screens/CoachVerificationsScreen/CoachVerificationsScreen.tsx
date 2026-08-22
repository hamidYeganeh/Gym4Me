import { useCallback, useMemo, useState } from "react";
import type { CoachVerificationItem, VerificationStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminVerification } from "@/shared/lib/api";
import { CoachVerificationsHeaderSection } from "../../sections/CoachVerificationsHeaderSection";
import { CoachVerificationsReviewDialogSection } from "../../sections/CoachVerificationsReviewDialogSection";
import { CoachVerificationsReviewDrawerSection } from "../../sections/CoachVerificationsReviewDrawerSection";
import { CoachVerificationsTableSection } from "../../sections/CoachVerificationsTableSection";
import { coachVerificationsScreenVariants } from "./CoachVerificationsScreen.styles";
import type { CoachVerificationsScreenProps } from "./CoachVerificationsScreen.types";

const FILTER_KEYS = ["status"] as const;

type CoachVerificationsFilters = {
  status: VerificationStatus | "all";
};

const FILTER_DEFAULTS: CoachVerificationsFilters & { search: string } = {
  status: "pending",
  search: "",
};

type ReviewState = {
  item: CoachVerificationItem;
  action: "approve" | "reject";
};

export function CoachVerificationsScreen({
  className,
}: CoachVerificationsScreenProps) {
  const t = useTranslations("Admin.Users");
  const styles = coachVerificationsScreenVariants();
  const { filters, setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<CoachVerificationsFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [selected, setSelected] = useState<CoachVerificationItem | null>(null);
  const [review, setReview] = useState<ReviewState | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [pending, setPending] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ status: filters.status }),
    [filters.status],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminVerification.listCoachVerifications({
        page,
        limit: pageSize,
        status: filters.status === "all" ? "all" : filters.status,
      });
    },
    [filters.status],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<CoachVerificationItem>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const handleConfirm = async () => {
    if (!review) return;
    setPending(true);
    setReviewError(null);
    try {
      await adminVerification.reviewCoach(review.item.userId, {
        action: review.action,
        reviewNote: reviewNote.trim() || undefined,
      });
      setReview(null);
      setSelected(null);
      void reload();
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.message : t("reviewError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="users"
      className={className}
      usersSection={{ activeTabId: "coach" }}
    >
      <div className={styles.content()}>
        <CoachVerificationsHeaderSection
          statusFilter={filters.status}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("status", value)}
        />

        <CoachVerificationsTableSection
          error={error}
          items={items}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={changePage}
          onReview={setSelected}
        />
      </div>

      <CoachVerificationsReviewDrawerSection
        selected={selected}
        onApprove={() => {
          if (!selected) return;
          setReview({ item: selected, action: "approve" });
          setReviewNote("");
          setReviewError(null);
        }}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onReject={() => {
          if (!selected) return;
          setReview({ item: selected, action: "reject" });
          setReviewNote("");
          setReviewError(null);
        }}
      />

      <CoachVerificationsReviewDialogSection
        pending={pending}
        review={review}
        reviewError={reviewError}
        reviewNote={reviewNote}
        onConfirm={() => void handleConfirm()}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
        onReviewNoteChange={setReviewNote}
      />
    </AdminShell>
  );
}
