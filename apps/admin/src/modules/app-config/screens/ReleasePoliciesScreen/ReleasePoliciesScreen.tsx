import { useCallback, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { MobileReleasePolicy, UpsertReleasePolicyInput } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminAppConfig } from "@/shared/lib/api";
import {
  emptyReleasePolicyDraft,
  policyToDraft,
  releaseNotesForUpsert,
} from "../../lib/release-policy-draft";
import { ReleasePoliciesFormSection } from "../../sections/ReleasePoliciesFormSection";
import { ReleasePoliciesTableSection } from "../../sections/ReleasePoliciesTableSection";
import { releasePoliciesScreenVariants } from "./ReleasePoliciesScreen.styles";
import type { ReleasePoliciesScreenProps } from "./ReleasePoliciesScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = [] as const;

type ReleasePoliciesFilters = {
  __unused?: string;
};

const FILTER_DEFAULTS = {
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function ReleasePoliciesScreen({
  className,
}: ReleasePoliciesScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = releasePoliciesScreenVariants();

  const { search, searchInput, setSearchInput, page, pageSize, setPage } =
    useAdminListQueryParams<ReleasePoliciesFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const [draft, setDraft] = useState<UpsertReleasePolicyInput | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ search, pageSize }),
    [pageSize, search],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminAppConfig.listReleasePolicies({
        page: nextPage,
        page_size: nextPageSize,
        search: search.trim() || undefined,
      });
    },
    [search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<MobileReleasePolicy>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("releases.errorLoad"),
    fetchPage,
  });

  const save = async () => {
    if (!draft) return;
    const reason = draft.reason.trim();
    if (reason.length < 3) {
      setActionError(t("releases.reasonRequired"));
      return;
    }
    setPending(true);
    setActionError(null);
    try {
      await adminAppConfig.upsertReleasePolicy({
        platform: draft.platform,
        channel: draft.channel,
        latestAppVersion: draft.latestAppVersion.trim(),
        minimumSupportedAppVersion: draft.minimumSupportedAppVersion.trim(),
        recommendedApiVersion: draft.recommendedApiVersion.trim(),
        updateUrl: draft.updateUrl?.trim() || undefined,
        releaseNotes: releaseNotesForUpsert(draft),
        enabled: draft.enabled,
        reason,
      });
      setDraft(null);
      setEditingId(null);
      void reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{
        activeTabId: "releases",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("releases.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("releases.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button
              variant="primary"
              onPress={() => {
                setDraft(emptyReleasePolicyDraft());
                setEditingId(null);
                setActionError(null);
              }}
            >
              {t("releases.create")}
            </Button>
            <Button onPress={() => void reload()} variant="outline">
              {t("refresh")}
            </Button>
          </div>
        </section>

        <ReleasePoliciesTableSection
          error={error}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onEdit={(row) => {
            setDraft(policyToDraft(row));
            setEditingId(row.id);
            setActionError(null);
          }}
          onPageChange={changePage}
        />
      </div>

      <ReleasePoliciesFormSection
        draft={draft}
        error={actionError}
        isCreate={!editingId}
        pending={pending}
        onChange={setDraft}
        onClose={() => {
          setDraft(null);
          setEditingId(null);
        }}
        onSave={() => {
          void save();
        }}
      />
    </AdminShell>
  );
}
