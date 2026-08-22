import { useCallback, useMemo, useState } from "react";
import type { SocialReport, SocialReportStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminSocial } from "@/shared/lib/api";
import { SocialReportsHeaderSection } from "../../sections/SocialReportsHeaderSection";
import { SocialReportsResolveDrawerSection } from "../../sections/SocialReportsResolveDrawerSection";
import { SocialReportsTableSection } from "../../sections/SocialReportsTableSection";
import { socialReportsScreenVariants } from "./SocialReportsScreen.styles";
import type { SocialReportsScreenProps } from "./SocialReportsScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["status"] as const;

type SocialReportsFilters = {
  status: SocialReportStatus | "all";
};

const FILTER_DEFAULTS: SocialReportsFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  status: "open",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function SocialReportsScreen({ className }: SocialReportsScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = socialReportsScreenVariants();

  const { filters, setFilter,
    page,
    pageSize,
    setPage,
  } =
    useAdminListQueryParams<SocialReportsFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });
  const [resolving, setResolving] = useState<{
    report: SocialReport;
    resolution: "resolved" | "rejected";
  } | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, pageSize }),
    [filters, pageSize],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminSocial.listReports({
        page,
        page_size: pageSize,
        status: filters.status === "all" ? undefined : filters.status,
      });
    },
    [filters],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<SocialReport>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
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
          statusFilter={filters.status}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("status", value)}
        />

        <SocialReportsTableSection
          error={error}
          items={items}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={changePage}
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
