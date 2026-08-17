import { useCallback, useState } from "react";
import type { AuditLogItem, StartImpersonationResult } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminAudit } from "@/shared/lib/api";
import { AuditLogsHeaderSection } from "../../sections/AuditLogsHeaderSection";
import { AuditLogsImpersonationDrawerSection } from "../../sections/AuditLogsImpersonationDrawerSection";
import { AuditLogsTableSection } from "../../sections/AuditLogsTableSection";
import { auditLogsScreenVariants } from "./AuditLogsScreen.styles";
import type { AuditLogsScreenProps } from "./AuditLogsScreen.types";

const PAGE_SIZE = 40;

export function AuditLogsScreen({ className }: AuditLogsScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = auditLogsScreenVariants();

  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [session, setSession] = useState<StartImpersonationResult | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const fetchPage = useCallback(async (page: number, pageSize: number) => {
    return adminAudit.list({ page, page_size: pageSize });
  }, []);

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<AuditLogItem>({
    queryKey: "audit-logs",
    pageSize: PAGE_SIZE,
    errorFallback: t("audit.errorLoad"),
    fetchPage,
  });

  const handleStart = async () => {
    if (!targetUserId.trim() || !reason.trim()) return;
    setPending(true);
    setActionError(null);
    try {
      const result = await adminAudit.startImpersonation({
        targetUserId: targetUserId.trim(),
        reason: reason.trim(),
      });
      setSession(result);
      setCopied(false);
      void reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setPending(false);
    }
  };

  const handleEnd = async () => {
    if (!session) return;
    setPending(true);
    setActionError(null);
    try {
      await adminAudit.endImpersonation(session.id);
      setSession(null);
      setImpersonateOpen(false);
      void reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setPending(false);
    }
  };

  const handleCopy = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.accessToken);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const openImpersonation = useCallback(() => {
    setTargetUserId("");
    setReason("");
    setSession(null);
    setActionError(null);
    setImpersonateOpen(true);
  }, []);

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{ activeTabId: "audit" }}
    >
      <div className={styles.content()}>
        <AuditLogsHeaderSection
          onRefresh={() => void reload()}
          onStartImpersonation={openImpersonation}
        />

        <AuditLogsTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onLoadMore={loadMore}
        />
      </div>

      <AuditLogsImpersonationDrawerSection
        actionError={actionError}
        copied={copied}
        isOpen={impersonateOpen}
        pending={pending}
        reason={reason}
        session={session}
        targetUserId={targetUserId}
        onCopy={() => void handleCopy()}
        onEnd={() => void handleEnd()}
        onOpenChange={setImpersonateOpen}
        onReasonChange={setReason}
        onStart={() => void handleStart()}
        onTargetUserIdChange={setTargetUserId}
      />
    </AdminShell>
  );
}
