import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type { AuditLogItem, StartImpersonationResult } from "@repo/api";
import { ApiError } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminAudit } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { auditLogsScreenVariants } from "./AuditLogsScreen.styles";
import type { AuditLogsScreenProps } from "./AuditLogsScreen.types";

const PAGE_SIZE = 40;

const columnHelper = createColumnHelper<AuditLogItem>();

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

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("action", {
          header: t("audit.columns.action"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.actorId ?? "—", {
          id: "actor",
          header: t("audit.columns.actor"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.targetUserId ?? "—", {
          id: "target",
          header: t("audit.columns.target"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.ip ?? "—", {
          id: "ip",
          header: t("audit.columns.ip"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("createdAt", {
          header: t("audit.columns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
      ] as ColumnDef<AuditLogItem, unknown>[],
    [t],
  );

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

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{ activeTabId: "audit" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("audit.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("audit.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button
              size="sm"
              variant="primary"
              onPress={() => {
                setTargetUserId("");
                setReason("");
                setSession(null);
                setActionError(null);
                setImpersonateOpen(true);
              }}
            >
              {t("audit.impersonation.start")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("audit.title")}
          columns={columns}
          data={items}
          emptyLabel={t("audit.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          onLoadMore={loadMore}
          summaryLabel={t("audit.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={impersonateOpen}
        title={t("audit.impersonation.startTitle")}
        onOpenChange={setImpersonateOpen}
      >
        <div className={styles.form()}>
          {session ? (
            <>
              <Typography className={styles.subtitle()} weight="medium">
                {t("audit.impersonation.tokenTitle")}
              </Typography>
              <Typography className={styles.subtitle()}>
                {t("audit.impersonation.tokenBody")}
              </Typography>
              <p className={styles.token()} dir="ltr">
                {session.accessToken}
              </p>
              <div className={styles.actions()}>
                <Button
                  variant="primary"
                  onPress={() => void handleCopy()}
                >
                  {copied
                    ? t("audit.impersonation.copied")
                    : t("audit.impersonation.copy")}
                </Button>
                <Button
                  isDisabled={pending}
                  variant="danger"
                  onPress={() => void handleEnd()}
                >
                  {t("audit.impersonation.end")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <TextField
                className={styles.field()}
                fullWidth
                name="targetUserId"
                value={targetUserId}
                onChange={setTargetUserId}
              >
                <Label>{t("audit.impersonation.targetUserIdLabel")}</Label>
                <Input dir="ltr" />
              </TextField>
              <TextField
                className={styles.field()}
                fullWidth
                name="reason"
                value={reason}
                onChange={setReason}
              >
                <Label>{t("audit.impersonation.reasonLabel")}</Label>
                <Input />
              </TextField>

              <div className={styles.actions()}>
                <Button
                  isDisabled={
                    pending || !targetUserId.trim() || !reason.trim()
                  }
                  variant="primary"
                  onPress={() => void handleStart()}
                >
                  {t("audit.impersonation.confirm")}
                </Button>
                <Button
                  isDisabled={pending}
                  variant="secondary"
                  onPress={() => setImpersonateOpen(false)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </>
          )}

          {actionError ? (
            <p className="text-sm text-danger" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      </AdminFormDrawer>
    </AdminShell>
  );
}
