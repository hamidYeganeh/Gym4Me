import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, Chip, Input, Label, TextField, Typography } from "@heroui/react";
import type { CoachVerificationItem, VerificationStatus } from "@repo/api";
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
import { adminVerification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { formatAdminDate } from "@/shared/lib/user-format";
import { coachVerificationsScreenVariants } from "./CoachVerificationsScreen.styles";
import type { CoachVerificationsScreenProps } from "./CoachVerificationsScreen.types";

const PAGE_SIZE = 20;
const columnHelper = createColumnHelper<CoachVerificationItem>();

type ReviewState = {
  item: CoachVerificationItem;
  action: "approve" | "reject";
};

function coachUserLabel(item: CoachVerificationItem) {
  const user = item.user;
  if (!user) return item.userId;
  const name = [user.name?.first, user.name?.last].filter(Boolean).join(" ");
  return name || user.phone || user.code || item.userId;
}

export function CoachVerificationsScreen({
  className,
}: CoachVerificationsScreenProps) {
  const t = useTranslations("Admin.Users");
  const styles = coachVerificationsScreenVariants();
  const [statusFilter, setStatusFilter] = useState<
    VerificationStatus | "all"
  >("pending");
  const [selected, setSelected] = useState<CoachVerificationItem | null>(null);
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
      return adminVerification.listCoachVerifications({
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
  } = useAdminInfiniteQuery<CoachVerificationItem>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "user",
        header: t("coachColumns.user"),
        size: 200,
        cell: (info) => (
          <span className="block truncate font-medium">
            {coachUserLabel(info.row.original)}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.verification.status ?? "pending", {
        id: "status",
        header: t("coachColumns.status"),
        size: 120,
        cell: (info) => {
          const status = info.getValue();
          const color =
            status === "approved"
              ? "success"
              : status === "rejected"
                ? "danger"
                : "warning";
          return (
            <Chip color={color} size="sm" variant="soft">
              {t(`verification.${status}`)}
            </Chip>
          );
        },
      }),
      columnHelper.accessor((row) => row.verification.submittedAt, {
        id: "submittedAt",
        header: t("coachColumns.submittedAt"),
        size: 140,
        cell: (info) =>
          info.getValue() ? formatAdminDate(info.getValue()!) : "—",
      }),
      columnHelper.display({
        id: "actions",
        header: t("coachColumns.actions"),
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
    ] as ColumnDef<CoachVerificationItem, unknown>[],
    [styles, t],
  );

  const handleConfirm = async () => {
    if (!review) return;
    setPending(true);
    setReviewError(null);
    try {
      await adminVerification.reviewCoach(review.item.userId, {
        action: review.action,
        reviewNote:
          review.action === "reject"
            ? reviewNote.trim() || undefined
            : reviewNote.trim() || undefined,
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
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("coachTitle")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("coachSubtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(
              ["pending", "approved", "rejected", "all"] as const
            ).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={statusFilter === value ? "primary" : "secondary"}
                onPress={() => setStatusFilter(value)}
              >
                {value === "all"
                  ? t("filterAll")
                  : t(`verification.${value}`)}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("coachTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("coachEmpty")}
          error={error}
          getRowId={(row) => row.userId}
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
                <dt className="text-muted">{t("coachColumns.user")}</dt>
                <dd className="font-medium">
                  <RouterLink
                    className="text-accent underline-offset-2 hover:underline"
                    to={routes.user(selected.userId)}
                  >
                    {coachUserLabel(selected)}
                  </RouterLink>
                </dd>
              </div>
              {selected.user?.phone ? (
                <div>
                  <dt className="text-muted">{t("columns.phone")}</dt>
                  <dd className="tabular-nums" dir="ltr">
                    {selected.user.phone}
                  </dd>
                </div>
              ) : null}
              {selected.experience.headline || selected.experience.years != null ? (
                <div>
                  <dt className="text-muted">{t("coachColumns.experience")}</dt>
                  <dd>
                    {[
                      selected.experience.headline,
                      selected.experience.years != null
                        ? t("coachColumns.years", {
                            count: selected.experience.years,
                          })
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </dd>
                </div>
              ) : null}
              {selected.bio ? (
                <div>
                  <dt className="text-muted">{t("coachColumns.bio")}</dt>
                  <dd className="whitespace-pre-wrap">{selected.bio}</dd>
                </div>
              ) : null}
            </dl>

            <AdminEvidenceGallery
              emptyLabel={t("kycActions.noDocument")}
              label={t("kycActions.evidence")}
              mediaIds={selected.verification.documentMediaIds}
            />

            {selected.verification.status === "pending" ? (
              <div className={styles.actions()}>
                <Button
                  variant="primary"
                  onPress={() => {
                    setReview({ item: selected, action: "approve" });
                    setReviewNote("");
                    setReviewError(null);
                  }}
                >
                  {t("kycActions.approve")}
                </Button>
                <Button
                  variant="danger"
                  onPress={() => {
                    setReview({ item: selected, action: "reject" });
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
                ? t("coachActions.approveBody")
                : t("coachActions.rejectBody")}
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
