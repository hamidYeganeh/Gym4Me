import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import type { AdminKycRequest, KycRequestStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminEvidenceGallery,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminKyc } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { formatAdminDate } from "@/shared/lib/user-format";
import {
  createKycTableColumns,
  kycRequestId,
  kycUserId,
  kycUserLabel,
  type KycTableMeta,
} from "../../lib/kyc-table-columns";
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

  const columns = useMemo(
    () =>
      createKycTableColumns({
        columns: {
          user: t("kycColumns.user"),
          kind: t("kycColumns.kind"),
          nationalId: t("kycColumns.nationalId"),
          status: t("kycColumns.status"),
          createdAt: t("kycColumns.createdAt"),
          actions: t("kycColumns.actions"),
        },
        kind: (kind) => t(`kycKind.${kind}`),
        status: (status) => t(`kyc.${status}`),
        review: t("kycActions.review"),
      }) as ColumnDef<AdminKycRequest, unknown>[],
    [t],
  );

  const meta: KycTableMeta = {
    actionsClassName: styles.actions(),
    onReview: (row) => {
      setSelected(row);
      setDocError(null);
      setReviewError(null);
    },
  };

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

  const userLinkId = selected ? kycUserId(selected) : null;

  return (
    <AdminShell
      activeNavId="users"
      className={className}
      usersSection={{
        activeTabId: "kyc",
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("kycTitle")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("kycSubtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(["pending", "approved", "rejected", "all"] as const).map(
              (value) => (
                <FilterChip
                  key={value}
                  onPress={() => setStatusFilter(value)}
                  selected={statusFilter === value}
                >
                  {value === "all" ? t("filterAll") : t(`kyc.${value}`)}
                </FilterChip>
              ),
            )}
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("kycTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("kycEmpty")}
          error={error}
          getRowId={(row) => kycRequestId(row)}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
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
                <dt className="text-muted">{t("kycColumns.user")}</dt>
                <dd className="font-medium">
                  {userLinkId ? (
                    <RouterLink
                      className="text-accent underline-offset-2 hover:underline"
                      to={routes.user(userLinkId)}
                    >
                      {kycUserLabel(selected)}
                    </RouterLink>
                  ) : (
                    kycUserLabel(selected)
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t("kycColumns.kind")}</dt>
                <dd>{t(`kycKind.${selected.kind}`)}</dd>
              </div>
              {selected.nationalId ? (
                <div>
                  <dt className="text-muted">{t("kycColumns.nationalId")}</dt>
                  <dd className="tabular-nums" dir="ltr">
                    {selected.nationalId}
                  </dd>
                </div>
              ) : null}
              {selected.birthDate ? (
                <div>
                  <dt className="text-muted">{t("kycColumns.birthDate")}</dt>
                  <dd>{formatAdminDate(selected.birthDate)}</dd>
                </div>
              ) : null}
              {selected.documentType ? (
                <div>
                  <dt className="text-muted">{t("kycColumns.documentType")}</dt>
                  <dd>
                    {selected.documentType === "national_card" ||
                    selected.documentType === "selfie" ||
                    selected.documentType === "coach_certificate" ||
                    selected.documentType === "business_license"
                      ? t(`kycDocumentType.${selected.documentType}`)
                      : selected.documentType}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted">{t("kycColumns.createdAt")}</dt>
                <dd>{formatAdminDate(selected.createdAt)}</dd>
              </div>
            </dl>

            <AdminEvidenceGallery
              emptyLabel={t("kycActions.noDocument")}
              label={t("kycActions.evidence")}
              openDocumentLabel={
                selected.hasDocument ? t("kycActions.openDocument") : undefined
              }
              documentPending={docPending}
              onOpenDocument={
                selected.hasDocument ? () => void openDocument() : undefined
              }
            />
            {docError ? (
              <p className="text-sm text-danger" role="alert">
                {docError}
              </p>
            ) : null}

            {selected.status === "pending" ? (
              <div className={styles.actions()}>
                <Button
                  variant="primary"
                  onPress={() => {
                    setReviewAction("approve");
                    setRejectReason("");
                    setReviewError(null);
                  }}
                >
                  {t("kycActions.approve")}
                </Button>
                <Button
                  variant="danger"
                  onPress={() => {
                    setReviewAction("reject");
                    setRejectReason("");
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
              {reviewAction === "approve"
                ? t("kycActions.approveBody")
                : t("kycActions.rejectBody")}
            </p>
            {reviewAction === "reject" ? (
              <TextField
                className={styles.rejectField()}
                fullWidth
                name="rejectionReason"
                value={rejectReason}
                onChange={setRejectReason}
              >
                <Label>{t("kycActions.rejectReason")}</Label>
                <Input />
              </TextField>
            ) : null}
            {reviewError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {reviewError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("kycActions.cancel")}
        confirmLabel={
          reviewAction === "approve"
            ? t("kycActions.approve")
            : t("kycActions.reject")
        }
        confirmVariant={reviewAction === "approve" ? "primary" : "danger"}
        isOpen={Boolean(selected && reviewAction)}
        isPending={reviewPending}
        title={
          reviewAction === "approve"
            ? t("kycActions.approveTitle")
            : t("kycActions.rejectTitle")
        }
        onConfirm={handleConfirm}
        onOpenChange={(open) => {
          if (!open) setReviewAction(null);
        }}
      />
    </AdminShell>
  );
}
