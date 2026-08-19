"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { RoleRequestAdminItem, VerificationStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog, AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminVerification } from "@/shared/lib/api";
import { roleRequestsScreenVariants } from "./RoleRequestsScreen.styles";
import type { RoleRequestsScreenProps } from "./RoleRequestsScreen.types";

const PAGE_SIZE = 20;

type ReviewState = {
  item: RoleRequestAdminItem;
  action: "approve" | "reject";
};

function userLabel(item: RoleRequestAdminItem) {
  const name = [item.user?.name?.first, item.user?.name?.last]
    .filter(Boolean)
    .join(" ");
  return name || item.user?.phone || item.user?.code || item.userId;
}

export function RoleRequestsScreen({ className }: RoleRequestsScreenProps) {
  const t = useTranslations("Admin.Users");
  const styles = roleRequestsScreenVariants();
  const [statusFilter, setStatusFilter] = useState<
    VerificationStatus | "all"
  >("pending");
  const [review, setReview] = useState<ReviewState | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [pending, setPending] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter }),
    [statusFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminVerification.listRoleRequests({
        page,
        limit: pageSize,
        status: statusFilter === "all" ? "all" : statusFilter,
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
  } = useAdminInfiniteQuery<RoleRequestAdminItem>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const handleConfirm = async () => {
    if (!review) return;
    if (review.action === "reject" && !reviewNote.trim()) {
      setReviewError(t("roleRequests.rejectRequired"));
      return;
    }
    setPending(true);
    setReviewError(null);
    try {
      await adminVerification.reviewRoleRequest(review.item.id, {
        action: review.action,
        reviewNote: reviewNote.trim() || undefined,
      });
      setReview(null);
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
      usersSection={{ activeTabId: "roles" }}
    >
      <div className={styles.content()}>
        <header className={styles.header()}>
          <div>
            <Typography type="h3" weight="bold">
              {t("roleRequests.title")}
            </Typography>
            <Typography color="muted" type="body-sm">
              {t("roleRequests.subtitle")}
            </Typography>
          </div>
          <div className={styles.filters()}>
            <select
              aria-label={t("filterStatus")}
              className={styles.select()}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as VerificationStatus | "all")
              }
            >
              <option value="all">{t("filterAll")}</option>
              <option value="pending">{t("verification.pending")}</option>
              <option value="approved">{t("verification.approved")}</option>
              <option value="rejected">{t("verification.rejected")}</option>
            </select>
            <Button size="lg" variant="secondary" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </header>

        {error ? (
          <Typography className={styles.error()} role="alert" type="body-sm">
            {error}
          </Typography>
        ) : null}

        {loading ? (
          <Typography color="muted" type="body-sm">
            {t("loading")}
          </Typography>
        ) : items.length === 0 ? (
          <Typography color="muted" type="body-sm">
            {t("roleRequests.empty")}
          </Typography>
        ) : (
          <ul className={styles.list()}>
            {items.map((item) => (
              <li key={item.id} className={styles.row()}>
                <div className={styles.rowMain()}>
                  <Typography weight="semibold">{userLabel(item)}</Typography>
                  <Typography color="muted" type="body-sm">
                    {item.role === "coach"
                      ? t("roleRequests.roleCoach")
                      : t("roleRequests.roleOwner")}{" "}
                    · {t(`verification.${item.status}`)}
                  </Typography>
                  {item.application.headline ? (
                    <Typography type="body-sm">
                      {item.application.headline}
                    </Typography>
                  ) : null}
                  {item.review.reason ? (
                    <Typography color="danger" type="body-sm">
                      {item.review.reason}
                    </Typography>
                  ) : null}
                </div>
                {item.status === "pending" ? (
                  <div className={styles.rowActions()}>
                    <Button
                      size="lg"
                      variant="primary"
                      onPress={() => {
                        setReview({ item, action: "approve" });
                        setReviewNote("");
                        setReviewError(null);
                      }}
                    >
                      {t("roleRequests.approve")}
                    </Button>
                    <Button
                      size="lg"
                      variant="danger"
                      onPress={() => {
                        setReview({ item, action: "reject" });
                        setReviewNote("");
                        setReviewError(null);
                      }}
                    >
                      {t("roleRequests.reject")}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {hasMore ? (
          <Button
            isPending={fetchingMore}
            size="lg"
            variant="secondary"
            onPress={() => void loadMore()}
          >
            {t("loadingMore")}
          </Button>
        ) : null}

        <Typography color="muted" type="body-sm">
          {t("infinite.summary", { loaded: items.length, total })}
        </Typography>
      </div>

      <AdminConfirmDialog
        body={
          <>
            <Typography>
              {review?.action === "approve"
                ? t("roleRequests.approveBody")
                : t("roleRequests.rejectBody")}
            </Typography>
            <TextField
              className="mt-3 flex flex-col gap-2"
              fullWidth
              name="reviewNote"
              value={reviewNote}
              onChange={setReviewNote}
            >
              <Label>
                {review?.action === "reject"
                  ? t("roleRequests.rejectReason")
                  : t("roleRequests.note")}
              </Label>
              <Input />
            </TextField>
            {reviewError ? (
              <Typography className="mt-2 text-sm text-danger" role="alert">
                {reviewError}
              </Typography>
            ) : null}
          </>
        }
        cancelLabel={t("kycActions.cancel")}
        confirmLabel={
          review?.action === "approve"
            ? t("roleRequests.approve")
            : t("roleRequests.reject")
        }
        confirmVariant={review?.action === "approve" ? "primary" : "danger"}
        isOpen={Boolean(review)}
        isPending={pending}
        title={
          review?.action === "approve"
            ? t("kycActions.approveTitle")
            : t("kycActions.rejectTitle")
        }
        onConfirm={() => void handleConfirm()}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
      />
    </AdminShell>
  );
}
