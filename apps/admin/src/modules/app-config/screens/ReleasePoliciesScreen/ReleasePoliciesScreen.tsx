import { useCallback, useMemo, useState } from "react";
import { Button, Typography } from "@heroui/react";
import type { MobileReleasePolicy, UpsertReleasePolicyInput } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminAppConfig } from "@/shared/lib/api";
import {
  emptyReleasePolicyDraft,
  policyToDraft,
} from "../../lib/release-policy-draft";
import { ReleasePoliciesFormSection } from "../../sections/ReleasePoliciesFormSection";
import { ReleasePoliciesTableSection } from "../../sections/ReleasePoliciesTableSection";
import { releasePoliciesScreenVariants } from "./ReleasePoliciesScreen.styles";
import type { ReleasePoliciesScreenProps } from "./ReleasePoliciesScreen.types";

export function ReleasePoliciesScreen({
  className,
}: ReleasePoliciesScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = releasePoliciesScreenVariants();

  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<UpsertReleasePolicyInput | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify({ search }), [search]);

  const fetchPage = useCallback(async () => {
    const items = await adminAppConfig.listReleasePolicies();
    const q = search.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (item) =>
            item.platform.includes(q) ||
            item.channel.includes(q) ||
            item.latestAppVersion.includes(q),
        )
      : items;
    return {
      result: filtered,
      pagination: {
        page: 1,
        page_size: filtered.length || 1,
        next: null,
        prev: null,
        total: filtered.length,
      },
    };
  }, [search]);

  const { items, loading, error, reload } =
    useAdminInfiniteQuery<MobileReleasePolicy>({
      queryKey,
      pageSize: 500,
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
        searchValue: search,
        onSearchChange: setSearch,
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
          onEdit={(row) => {
            setDraft(policyToDraft(row));
            setEditingId(row.id);
            setActionError(null);
          }}
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
