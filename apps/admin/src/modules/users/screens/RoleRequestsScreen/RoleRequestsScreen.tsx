"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { Role, RoleRequestAdminItem, VerificationStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminFilterSelect,
  AdminShell,
} from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminVerification } from "@/shared/lib/api";
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
  const { search, searchInput, setSearchInput, filters, setFilter,
    page,
    pageSize,
    setPage,
  } =
    useAdminListQueryParams<RoleRequestsFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });
  const [review, setReview] = useState<ReviewState | null>(null);
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
              {page.toLocaleString("fa-IR")} / {totalPages.toLocaleString("fa-IR")}
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
