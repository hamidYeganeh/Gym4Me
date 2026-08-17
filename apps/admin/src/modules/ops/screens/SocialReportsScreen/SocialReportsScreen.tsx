import { useCallback, useMemo, useState } from "react";
import type { SocialReport, SocialReportStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminSocial } from "@/shared/lib/api";
import { SocialReportsHeaderSection } from "../../sections/SocialReportsHeaderSection";
import { SocialReportsResolveDrawerSection } from "../../sections/SocialReportsResolveDrawerSection";
import { SocialReportsTableSection } from "../../sections/SocialReportsTableSection";
import { socialReportsScreenVariants } from "./SocialReportsScreen.styles";
import type { SocialReportsScreenProps } from "./SocialReportsScreen.types";

const PAGE_SIZE = 30;

export function SocialReportsScreen({ className }: SocialReportsScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = socialReportsScreenVariants();

  const [statusFilter, setStatusFilter] = useState<SocialReportStatus | "all">(
    "open",
  );
  const [resolving, setResolving] = useState<{
    report: SocialReport;
    resolution: "resolved" | "rejected";
  } | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, pageSize: PAGE_SIZE }),
    [statusFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminSocial.listReports({
        page,
        page_size: pageSize,
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
  } = useAdminInfiniteQuery<SocialReport>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("social.errorLoad"),
    fetchPage,
  });

  const handleResolve = async () => {
    if (!resolving) return;
    setPending(true);
    setActionError(null);
    try {
      await adminSocial.resolveReport(resolving.report.id, {
        status: resolving.resolution,
        note: note.trim() || undefined,
      });
      setResolving(null);
      void reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{ activeTabId: "social" }}
    >
      <div className={styles.content()}>
        <SocialReportsHeaderSection
          statusFilter={statusFilter}
          onRefresh={() => void reload()}
          onStatusChange={setStatusFilter}
        />

        <SocialReportsTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onLoadMore={loadMore}
          onResolve={(report, resolution) => {
            setResolving({ report, resolution });
            setNote("");
            setActionError(null);
          }}
        />
      </div>

      <SocialReportsResolveDrawerSection
        actionError={actionError}
        note={note}
        pending={pending}
        resolving={resolving}
        onConfirm={() => void handleResolve()}
        onNoteChange={setNote}
        onOpenChange={(open) => {
          if (!open) setResolving(null);
        }}
      />
    </AdminShell>
  );
}
