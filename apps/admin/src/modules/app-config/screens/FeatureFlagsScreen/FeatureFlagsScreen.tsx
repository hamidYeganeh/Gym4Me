import { useCallback, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { FeatureFlag } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminAppConfig } from "@/shared/lib/api";
import { FeatureFlagsEditSection } from "../../sections/FeatureFlagsEditSection";
import type { FeatureFlagEditPatch } from "../../sections/FeatureFlagsEditSection";
import { FeatureFlagsTableSection } from "../../sections/FeatureFlagsTableSection";
import { featureFlagsScreenVariants } from "./FeatureFlagsScreen.styles";
import type { FeatureFlagsScreenProps } from "./FeatureFlagsScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = [] as const;

type FeatureFlagsFilters = {
  __unused?: string;
};

const FILTER_DEFAULTS = {
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function FeatureFlagsScreen({ className }: FeatureFlagsScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = featureFlagsScreenVariants();

  const { search, searchInput, setSearchInput, page, pageSize, setPage } =
    useAdminListQueryParams<FeatureFlagsFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const [editing, setEditing] = useState<FeatureFlag | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ search, pageSize }),
    [pageSize, search],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminAppConfig.listFeatureFlags({
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
  } = useAdminPaginatedQuery<FeatureFlag>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("flags.errorLoad"),
    fetchPage,
  });

  const saveFlag = async (row: FeatureFlag, patch: FeatureFlagEditPatch) => {
    const trimmed = patch.reason.trim();
    if (trimmed.length < 3) {
      setActionError(t("flags.reasonRequired"));
      return;
    }
    setPending(true);
    setActionError(null);
    try {
      await adminAppConfig.upsertFeatureFlag(row.key, {
        status: patch.status,
        rolloutPercentage: patch.rolloutPercentage,
        platforms: row.platforms,
        channels: row.channels,
        minimumAppVersion: row.minimumAppVersion ?? undefined,
        maximumAppVersion: row.maximumAppVersion ?? undefined,
        rules: row.rules.map((rule) => ({
          platforms: rule.platforms,
          channels: rule.channels,
          minAppVersion: rule.minAppVersion ?? undefined,
          maxAppVersion: rule.maxAppVersion ?? undefined,
          rolloutPercentage: rule.rolloutPercentage,
          variant: rule.variant,
        })),
        defaultVariant: row.defaultVariant ?? undefined,
        payload: row.payload,
        description: row.description ?? undefined,
        reason: trimmed,
      });
      setEditing(null);
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
        activeTabId: "flags",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("flags.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("flags.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button onPress={() => void reload()} variant="outline">
              {t("refresh")}
            </Button>
          </div>
        </section>

        {actionError && !editing ? (
          <Typography className="text-danger" role="alert">
            {actionError}
          </Typography>
        ) : null}

        <FeatureFlagsTableSection
          error={error}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onActivate={(row) => {
            const why = window.prompt(t("flags.fields.reason"));
            if (!why) return;
            void saveFlag(row, {
              status: "active",
              rolloutPercentage: row.rolloutPercentage,
              reason: why,
            });
          }}
          onEdit={(row) => {
            setEditing(row);
            setActionError(null);
          }}
          onPageChange={changePage}
          onPause={(row) => {
            const why = window.prompt(t("flags.fields.reason"));
            if (!why) return;
            void saveFlag(row, {
              status: "paused",
              rolloutPercentage: row.rolloutPercentage,
              reason: why,
            });
          }}
        />
      </div>

      <FeatureFlagsEditSection
        error={actionError}
        flag={editing}
        pending={pending}
        onClose={() => setEditing(null)}
        onSave={async (patch) => {
          if (!editing) return;
          await saveFlag(editing, patch);
        }}
      />
    </AdminShell>
  );
}
