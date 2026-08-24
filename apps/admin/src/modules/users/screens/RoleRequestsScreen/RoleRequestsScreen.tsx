"use client";

import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { Role, RoleRequestAdminItem, VerificationStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminEvidenceGallery,
  AdminFilterSelect,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminVerification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { formatAdminDate } from "@/shared/lib/user-format";
import { roleRequestsScreenVariants } from "./RoleRequestsScreen.styles";
import type { RoleRequestsScreenProps } from "./RoleRequestsScreen.types";

const PAGE_SIZE = 20;
const FILTER_KEYS = ["status", "role"] as const;
const STATUSES: VerificationStatus[] = ["pending", "approved", "rejected"];
const ROLES: Role[] = ["coach", "club_owner"];

type RoleRequestsFilters = {
  status: VerificationStatus | "all";
  role: Role | "all";
};

const FILTER_DEFAULTS: RoleRequestsFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  // pagination filled below if missing
  status: "pending",
  role: "all",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

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
  const tCommon = useTranslations("Admin.Common");
  const styles = roleRequestsScreenVariants();
  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<RoleRequestsFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [review, setReview] = useState<ReviewState | null>(null);
  const [selected, setSelected] = useState<RoleRequestAdminItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [pending, setPending] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        status: filters.status,
        role: filters.role,
        search,
      }),
    [filters.role, filters.status, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminVerification.listRoleRequests({
        page,
        limit: pageSize,
        search: search || undefined,
        status: filters.status === "all" ? "all" : filters.status,
        role: filters.role === "all" ? undefined : filters.role,
      });
    },
    [filters.role, filters.status, search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<RoleRequestAdminItem>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
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
      usersSection={{
        activeTabId: "roles",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
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
            <AdminFilterSelect
              allLabel={t("filterAll")}
              label={t("filterStatus")}
              options={STATUSES.map((item) => ({
                value: item,
                label: t(`verification.${item}`),
              }))}
              value={filters.status}
              onChange={(value) =>
                setFilter("status", value as VerificationStatus | "all")
              }
            />
            <AdminFilterSelect
              allLabel={t("filterAll")}
              label={t("filterRole")}
              options={ROLES.map((item) => ({
                value: item,
                label: t(`roles.${item}`),
              }))}
              value={filters.role}
              onChange={(value) => setFilter("role", value as Role | "all")}
            />
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
                    <Typography className="text-danger" type="body-sm">
                      {item.review.reason}
                    </Typography>
                  ) : null}
                </div>
                <div className={styles.rowActions()}>
                  <Button
                    size="lg"
                    variant="secondary"
                    onPress={() => setSelected(item)}
                  >
                    {t("roleRequests.view")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2">
            <Button
              isDisabled={page <= 1}
              size="sm"
              variant="secondary"
              onPress={() => changePage(page - 1)}
            >
              {tCommon("pagination.previous")}
            </Button>
            <Typography color="muted" type="body-sm">
              {page.toLocaleString("fa-IR")} /{" "}
              {totalPages.toLocaleString("fa-IR")}
            </Typography>
            <Button
              isDisabled={page >= totalPages}
              size="sm"
              variant="secondary"
              onPress={() => changePage(page + 1)}
            >
              {tCommon("pagination.next")}
            </Button>
          </div>
        ) : null}

        <Typography color="muted" type="body-sm">
          {tCommon("pagination.summary", {
            from: total === 0 ? 0 : (page - 1) * pageSize + 1,
            to: Math.min(page * pageSize, total),
            total,
          })}
        </Typography>
      </div>

      <AdminFormDrawer
        isOpen={Boolean(selected)}
        title={t("roleRequests.detailsTitle")}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected ? (
          <div className="flex flex-col gap-6 pb-24" dir="rtl">
            <section className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Typography color="muted" type="body-sm">
                    {t("roleRequests.user")}
                  </Typography>
                  <RouterLink
                    className="mt-1 block truncate text-lg font-semibold text-foreground underline-offset-4 hover:text-accent hover:underline"
                    to={routes.user(selected.userId)}
                  >
                    {userLabel(selected)}
                  </RouterLink>
                  {selected.user?.phone ? (
                    <Typography
                      className="mt-1 text-right tabular-nums"
                      color="muted"
                      dir="ltr"
                      type="body-sm"
                    >
                      {selected.user.phone}
                    </Typography>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="soft">
                    {selected.role === "coach"
                      ? t("roleRequests.roleCoach")
                      : t("roleRequests.roleOwner")}
                  </Chip>
                  <Chip
                    color={
                      selected.status === "approved"
                        ? "success"
                        : selected.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                    size="sm"
                    variant="soft"
                  >
                    {t(`verification.${selected.status}`)}
                  </Chip>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <Typography className="font-semibold">
                {t("roleRequests.requestInfo")}
              </Typography>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-surface/60 p-3">
                  <dt className="text-sm text-muted">
                    {t("roleRequests.submittedAt")}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatAdminDate(
                      selected.submittedAt ?? selected.createdAt,
                    )}
                  </dd>
                </div>
                <div className="rounded-xl border border-border/70 bg-surface/60 p-3">
                  <dt className="text-sm text-muted">
                    {t("roleRequests.experience")}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {selected.application.yearsExperience != null
                      ? t("coachColumns.years", {
                          count: selected.application.yearsExperience,
                        })
                      : "—"}
                  </dd>
                </div>
              </dl>
            </section>

            {selected.application.headline || selected.application.bio ? (
              <section className="flex flex-col gap-3">
                <Typography className="font-semibold">
                  {t("roleRequests.profileInfo")}
                </Typography>
                <div className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-surface/60">
                  {selected.application.headline ? (
                    <div className="p-3.5">
                      <Typography color="muted" type="body-sm">
                        {t("roleRequests.headline")}
                      </Typography>
                      <Typography className="mt-1 leading-7">
                        {selected.application.headline}
                      </Typography>
                    </div>
                  ) : null}
                  {selected.application.bio ? (
                    <div className="p-3.5">
                      <Typography color="muted" type="body-sm">
                        {t("roleRequests.bio")}
                      </Typography>
                      <Typography className="mt-1 whitespace-pre-wrap leading-7">
                        {selected.application.bio}
                      </Typography>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {selected.application.note || selected.review.reason ? (
              <section className="flex flex-col gap-3">
                <Typography className="font-semibold">
                  {t("roleRequests.notes")}
                </Typography>
                <dl className="flex flex-col gap-3">
                  {selected.application.note ? (
                    <div className="rounded-xl border border-border/70 bg-surface/60 p-3.5">
                      <dt className="text-sm text-muted">
                        {t("roleRequests.applicationNote")}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap leading-7">
                        {selected.application.note}
                      </dd>
                    </div>
                  ) : null}
                  {selected.review.reason ? (
                    <div className="rounded-xl border border-danger/30 bg-danger/5 p-3.5">
                      <dt className="text-sm text-danger">
                        {t("roleRequests.reviewNote")}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap leading-7">
                        {selected.review.reason}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            <section className="rounded-xl border border-border/70 bg-surface/60 p-3.5">
              <AdminEvidenceGallery
                emptyLabel={t("kycActions.noDocument")}
                label={t("kycActions.evidence")}
                mediaIds={selected.application.documentMediaIds}
              />
            </section>

            {selected.status === "pending" ? (
              <div className="sticky bottom-0 z-10 -mx-4 flex gap-3 border-t border-border bg-background/95 p-4 backdrop-blur-sm">
                <Button
                  className="flex-1"
                  size="lg"
                  variant="primary"
                  onPress={() => {
                    setReview({ item: selected, action: "approve" });
                    setReviewNote("");
                    setReviewError(null);
                  }}
                >
                  {t("roleRequests.approve")}
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  variant="danger"
                  onPress={() => {
                    setReview({ item: selected, action: "reject" });
                    setReviewNote("");
                    setReviewError(null);
                  }}
                >
                  {t("roleRequests.reject")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </AdminFormDrawer>

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
