import { useCallback, useMemo, useState } from "react";
import type {
  SupportTicket,
  SupportTicketDetail,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminSupport } from "@/shared/lib/api";
import { SupportTicketsDetailDrawerSection } from "../../sections/SupportTicketsDetailDrawerSection";
import { SupportTicketsFiltersSection } from "../../sections/SupportTicketsFiltersSection";
import { SupportTicketsHeaderSection } from "../../sections/SupportTicketsHeaderSection";
import { SupportTicketsResolveDialogSection } from "../../sections/SupportTicketsResolveDialogSection";
import { SupportTicketsTableSection } from "../../sections/SupportTicketsTableSection";
import { supportTicketsScreenVariants } from "./SupportTicketsScreen.styles";
import type { SupportTicketsScreenProps } from "./SupportTicketsScreen.types";

const PAGE_SIZE = 20;

export function SupportTicketsScreen({ className }: SupportTicketsScreenProps) {
  const t = useTranslations("Admin.Support");
  const styles = supportTicketsScreenVariants();

  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveNote, setResolveNote] = useState("");

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, search, pageSize: PAGE_SIZE }),
    [statusFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminSupport.listTickets({
        page,
        page_size: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
    },
    [statusFilter, search],
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
  } = useAdminInfiniteQuery<SupportTicket>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const openDetail = useCallback(
    async (row: SupportTicket) => {
      setDetailLoading(true);
      setDetailError(null);
      setActionError(null);
      setReplyBody("");
      try {
        const full = await adminSupport.getTicket(row.id);
        setDetail(full);
      } catch (err) {
        setDetailError(
          err instanceof ApiError ? err.message : t("errorLoad"),
        );
        setDetail({ ...row, messages: [] });
      } finally {
        setDetailLoading(false);
      }
    },
    [t],
  );

  const runAction = async (fn: () => Promise<SupportTicketDetail>) => {
    setActionPending(true);
    setActionError(null);
    try {
      const updated = await fn();
      setDetail(updated);
      void reload();
      return true;
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("actionError"));
      return false;
    } finally {
      setActionPending(false);
    }
  };

  const handleReply = async () => {
    if (!detail || !replyBody.trim()) return;
    const ok = await runAction(() =>
      adminSupport.reply(detail.id, { body: replyBody.trim() }),
    );
    if (ok) setReplyBody("");
  };

  const handlePriority = (priority: SupportTicketPriority) => {
    if (!detail) return;
    void runAction(() =>
      adminSupport.updateTicket(detail.id, { priority }),
    );
  };

  const handleResolve = async () => {
    if (!detail || !resolveNote.trim()) return;
    const ok = await runAction(() =>
      adminSupport.updateTicket(detail.id, {
        status: "resolved",
        resolutionNote: resolveNote.trim(),
      }),
    );
    if (ok) {
      setResolveOpen(false);
      setResolveNote("");
    }
  };

  const handleClose = () => {
    if (!detail) return;
    void runAction(() =>
      adminSupport.updateTicket(detail.id, { status: "closed" }),
    );
  };

  const handleAssign = () => {
    if (!detail) return;
    void runAction(() => adminSupport.assignToMe(detail.id));
  };

  return (
    <AdminShell
      activeNavId="support"
      className={className}
      supportSection={{
        activeTabId: "tickets",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <SupportTicketsHeaderSection />

        <SupportTicketsFiltersSection
          statusFilter={statusFilter}
          onRefresh={() => void reload()}
          onStatusChange={setStatusFilter}
        />

        <SupportTicketsTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onLoadMore={loadMore}
          onView={(row) => void openDetail(row)}
        />
      </div>

      <SupportTicketsDetailDrawerSection
        actionError={actionError}
        actionPending={actionPending}
        detail={detail}
        detailError={detailError}
        detailLoading={detailLoading}
        replyBody={replyBody}
        onAssign={handleAssign}
        onClose={handleClose}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        onPriority={handlePriority}
        onReply={() => void handleReply()}
        onReplyBodyChange={setReplyBody}
        onResolveOpen={() => {
          setResolveNote("");
          setResolveOpen(true);
        }}
      />

      <SupportTicketsResolveDialogSection
        actionPending={actionPending}
        isOpen={resolveOpen}
        resolveNote={resolveNote}
        onConfirm={() => void handleResolve()}
        onOpenChange={setResolveOpen}
        onResolveNoteChange={setResolveNote}
      />
    </AdminShell>
  );
}
