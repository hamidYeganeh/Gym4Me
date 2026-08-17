import { useCallback, useMemo, useState } from "react";
import type { AdminKycRequest, KycRequestStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminKyc } from "@/shared/lib/api";
import { kycRequestId } from "../../lib/kyc-table-columns";
import { KycListHeaderSection } from "../../sections/KycListHeaderSection";
import { KycListReviewDialogSection } from "../../sections/KycListReviewDialogSection";
import { KycListReviewDrawerSection } from "../../sections/KycListReviewDrawerSection";
import { KycListTableSection } from "../../sections/KycListTableSection";
import { kycListScreenVariants } from "./KycListScreen.styles";
import type { KycListScreenProps } from "./KycListScreen.types";

const PAGE_SIZE = 20;

export function KycListScreen({ className }: KycListScreenProps) {
  const t = useTranslations("Admin.Users");
  const styles = kycListScreenVariants();
  const [statusFilter, setStatusFilter] = useState<KycRequestStatus | "all">(
    "pending",
  );
  const [selected, setSelected] = useState<AdminKycRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [reviewPending, setReviewPending] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [docPending, setDocPending] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, pageSize: PAGE_SIZE }),
    [statusFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminKyc.list({
        page,
        limit: pageSize,
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
  } = useAdminInfiniteQuery<AdminKycRequest>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const openDocument = async () => {
    if (!selected) return;
    setDocPending(true);
    setDocError(null);
    try {
      const blob = await adminKyc.fetchDocument(kycRequestId(selected));
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setDocError(
        err instanceof ApiError ? err.message : t("kycActions.documentError"),
      );
    } finally {
      setDocPending(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected || !reviewAction) return;
    setReviewPending(true);
    setReviewError(null);
    try {
      await adminKyc.review(kycRequestId(selected), {
        action: reviewAction,
        rejectionReason:
          reviewAction === "reject"
            ? rejectReason.trim() || undefined
            : undefined,
      });
      setReviewAction(null);
      setSelected(null);
      void reload();
    } catch (err) {
      setReviewError(
        err instanceof ApiError ? err.message : t("reviewError"),
      );
    } finally {
      setReviewPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="users"
      className={className}
      usersSection={{ activeTabId: "kyc" }}
    >
      <div className={styles.content()}>
        <KycListHeaderSection
          statusFilter={statusFilter}
          onRefresh={() => void reload()}
          onStatusChange={setStatusFilter}
        />

        <KycListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onLoadMore={loadMore}
          onReview={(row) => {
            setSelected(row);
            setDocError(null);
            setReviewError(null);
          }}
        />
      </div>

      <KycListReviewDrawerSection
        docError={docError}
        docPending={docPending}
        selected={selected}
        onApprove={() => {
          setReviewAction("approve");
          setRejectReason("");
          setReviewError(null);
        }}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onOpenDocument={() => void openDocument()}
        onReject={() => {
          setReviewAction("reject");
          setRejectReason("");
          setReviewError(null);
        }}
      />

      <KycListReviewDialogSection
        isOpen={Boolean(selected && reviewAction)}
        rejectReason={rejectReason}
        reviewAction={reviewAction}
        reviewError={reviewError}
        reviewPending={reviewPending}
        onConfirm={handleConfirm}
        onOpenChange={(open) => {
          if (!open) setReviewAction(null);
        }}
        onRejectReasonChange={setRejectReason}
      />
    </AdminShell>
  );
}
