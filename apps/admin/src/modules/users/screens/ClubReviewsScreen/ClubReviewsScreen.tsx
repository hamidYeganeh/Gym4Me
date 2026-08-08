import { useCallback, useMemo, useState } from "react";
import { Button, Chip, Input, Label, TextField, Typography } from "@heroui/react";
import type { Club, ClubLifecycleStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminEvidenceGallery,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminVerification, mediaApi } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { clubReviewsScreenVariants } from "./ClubReviewsScreen.styles";
import type { ClubReviewsScreenProps } from "./ClubReviewsScreen.types";

const PAGE_SIZE = 20;
const columnHelper = createColumnHelper<Club>();

type ReviewState = {
  club: Club;
  action: "approve" | "reject";
};

export function ClubReviewsScreen({ className }: ClubReviewsScreenProps) {
  const t = useTranslations("Admin.Users");
  const styles = clubReviewsScreenVariants();
  const [statusFilter, setStatusFilter] = useState<
    ClubLifecycleStatus | "all"
  >("pending_review");
  const [selected, setSelected] = useState<Club | null>(null);
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
      return adminVerification.listClubReviews({
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
  } = useAdminInfiniteQuery<Club>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor((row) => row.identity.name, {
          id: "name",
          header: t("clubsColumns.name"),
          size: 200,
          cell: (info) => (
            <span className="font-medium">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor((row) => row.review.status, {
          id: "status",
          header: t("clubsColumns.status"),
          size: 140,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "approved"
                ? "success"
                : status === "rejected" || status === "suspended"
                  ? "danger"
                  : "warning";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`clubLifecycle.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.accessor((row) => row.review.submittedAt, {
          id: "submittedAt",
          header: t("clubsColumns.submittedAt"),
          size: 140,
          cell: (info) =>
            info.getValue() ? formatAdminDate(info.getValue()!) : "—",
        }),
        columnHelper.display({
          id: "actions",
          header: t("clubsColumns.actions"),
          size: 120,
          cell: (info) => (
            <div className={styles.actions()}>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => setSelected(info.row.original)}
              >
                {t("kycActions.review")}
              </Button>
            </div>
          ),
        }),
      ] as ColumnDef<Club, unknown>[],
    [styles, t],
  );

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

  const evidenceIds = selected
    ? [
        ...(selected.identity.coverMediaId
          ? [selected.identity.coverMediaId]
          : []),
        ...selected.review.documentMediaIds,
      ]
    : [];

  return (
    <AdminShell
      activeNavId="users"
      className={className}
      usersSection={{ activeTabId: "clubs" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("clubsTitle")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("clubsSubtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(
              [
                "pending_review",
                "approved",
                "rejected",
                "all",
              ] as const
            ).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={statusFilter === value ? "primary" : "secondary"}
                onPress={() => setStatusFilter(value)}
              >
                {value === "all"
                  ? t("filterAll")
                  : t(`clubLifecycle.${value}`)}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("clubsTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("clubsEmpty")}
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
          onLoadMore={loadMore}
        />
      </div>

      <AdminFormDrawer
        isOpen={Boolean(selected)}
        title={t("kycActions.reviewTitle")}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted">{t("clubsColumns.name")}</dt>
                <dd className="font-medium">{selected.identity.name}</dd>
              </div>
              {selected.identity.description ? (
                <div>
                  <dt className="text-muted">{t("clubsColumns.description")}</dt>
                  <dd className="whitespace-pre-wrap">
                    {selected.identity.description}
                  </dd>
                </div>
              ) : null}
              {selected.location?.address ||
              selected.contact.phones.length > 0 ? (
                <div>
                  <dt className="text-muted">{t("clubsColumns.contact")}</dt>
                  <dd>
                    {[
                      selected.location?.address,
                      ...selected.contact.phones.map((p) => p.number),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
              ) : null}
              {selected.identity.coverMediaId ? (
                <div>
                  <dt className="text-muted">{t("clubsColumns.cover")}</dt>
                  <dd>
                    <a
                      className="text-accent underline-offset-2 hover:underline"
                      href={mediaApi.fileUrl(selected.identity.coverMediaId)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {t("kycActions.openDocument")}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>

            <AdminEvidenceGallery
              emptyLabel={t("kycActions.noDocument")}
              label={t("kycActions.evidence")}
              mediaIds={evidenceIds}
            />

            {selected.review.status === "pending_review" ? (
              <div className={styles.actions()}>
                <Button
                  variant="primary"
                  onPress={() => {
                    setReview({ club: selected, action: "approve" });
                    setReviewNote("");
                    setReviewError(null);
                  }}
                >
                  {t("kycActions.approve")}
                </Button>
                <Button
                  variant="danger"
                  onPress={() => {
                    setReview({ club: selected, action: "reject" });
                    setReviewNote("");
                    setReviewError(null);
                  }}
                >
                  {t("kycActions.reject")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>
              {review?.action === "approve"
                ? t("clubsActions.approveBody")
                : t("clubsActions.rejectBody")}
            </p>
            <TextField
              className="mt-3 flex flex-col gap-2"
              fullWidth
              name="reviewNote"
              value={reviewNote}
              onChange={setReviewNote}
            >
              <Label>
                {review?.action === "reject"
                  ? t("kycActions.rejectReason")
                  : t("coachActions.note")}
              </Label>
              <Input />
            </TextField>
            {reviewError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {reviewError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("kycActions.cancel")}
        confirmLabel={
          review?.action === "approve"
            ? t("kycActions.approve")
            : t("kycActions.reject")
        }
        confirmVariant={review?.action === "approve" ? "primary" : "danger"}
        isOpen={Boolean(review)}
        isPending={pending}
        title={
          review?.action === "approve"
            ? t("kycActions.approveTitle")
            : t("kycActions.rejectTitle")
        }
        onConfirm={handleConfirm}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
      />
    </AdminShell>
  );
}
