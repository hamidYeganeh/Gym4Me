import { useCallback, useMemo, useState } from "react";
import type { Club, ClubLifecycleStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminVerification } from "@/shared/lib/api";
import { ClubReviewsHeaderSection } from "../../sections/ClubReviewsHeaderSection";
import { ClubReviewsReviewDialogSection } from "../../sections/ClubReviewsReviewDialogSection";
import { ClubReviewsReviewDrawerSection } from "../../sections/ClubReviewsReviewDrawerSection";
import { ClubReviewsTableSection } from "../../sections/ClubReviewsTableSection";
import { clubReviewsScreenVariants } from "./ClubReviewsScreen.styles";
import type { ClubReviewsScreenProps } from "./ClubReviewsScreen.types";

const FILTER_KEYS = ["status"] as const;

type ClubReviewsFilters = {
  status: ClubLifecycleStatus | "all";
};

const FILTER_DEFAULTS: ClubReviewsFilters & { search: string } = {
  status: "pending_review",
  search: "",
};

type ReviewState = {
  club: Club;
  action: "approve" | "reject";
};

export function ClubReviewsScreen({ className }: ClubReviewsScreenProps) {
  const t = useTranslations("Admin.Users");
  const styles = clubReviewsScreenVariants();
  const { filters, setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<ClubReviewsFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [selected, setSelected] = useState<Club | null>(null);
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
      return adminVerification.listClubReviews({
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
  } = useAdminPaginatedQuery<Club>({
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
      await adminVerification.reviewClub(review.club.id, {
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
      usersSection={{ activeTabId: "clubs" }}
    >
      <div className={styles.content()}>
        <ClubReviewsHeaderSection
          statusFilter={filters.status}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("status", value)}
        />

        <ClubReviewsTableSection
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

      <ClubReviewsReviewDrawerSection
        selected={selected}
        onApprove={() => {
          if (!selected) return;
          setReview({ club: selected, action: "approve" });
          setReviewNote("");
          setReviewError(null);
        }}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onReject={() => {
          if (!selected) return;
          setReview({ club: selected, action: "reject" });
          setReviewNote("");
          setReviewError(null);
        }}
      />

      <ClubReviewsReviewDialogSection
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
