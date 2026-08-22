import { useCallback, useMemo, useState } from "react";
import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketDetail,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminSupport } from "@/shared/lib/api";
import { SupportTicketsDetailDrawerSection } from "../../sections/SupportTicketsDetailDrawerSection";
import { SupportTicketsFiltersSection } from "../../sections/SupportTicketsFiltersSection";
import { SupportTicketsHeaderSection } from "../../sections/SupportTicketsHeaderSection";
import { SupportTicketsResolveDialogSection } from "../../sections/SupportTicketsResolveDialogSection";
import { SupportTicketsTableSection } from "../../sections/SupportTicketsTableSection";
import { supportTicketsScreenVariants } from "./SupportTicketsScreen.styles";
import type { SupportTicketsScreenProps } from "./SupportTicketsScreen.types";

const PAGE_SIZE = 20;
const FILTER_KEYS = ["status", "category", "priority"] as const;

type SupportTicketsFilters = {
  status: SupportTicketStatus | "all";
  category: SupportTicketCategory | "all";
  priority: SupportTicketPriority | "all";
};

const FILTER_DEFAULTS: SupportTicketsFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  status: "all",
  category: "all",
  priority: "all",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function SupportTicketsScreen({ className }: SupportTicketsScreenProps) {
  const t = useTranslations("Admin.Support");
  const styles = supportTicketsScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<SupportTicketsFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveNote, setResolveNote] = useState("");

  const queryKey = useMemo(
    () => JSON.stringify({ filters, search, pageSize }),
    [filters, pageSize, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminSupport.listTickets({
        page,
        page_size: pageSize,
        status: filters.status === "all" ? undefined : filters.status,
        category: filters.category === "all" ? undefined : filters.category,
        priority: filters.priority === "all" ? undefined : filters.priority,
        search: search.trim() || undefined,
      });
    },
    [filters, search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<SupportTicket>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const openDetail = async (row: SupportTicket) => {
    setDetailLoading(true);
    setDetailError(null);
    setActionError(null);
    setReplyBody("");
    try {
      const full = await adminSupport.getTicket(row.id);
      setDetail(full);
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : t("errorLoad"));
      setDetail({ ...row, messages: [] });
    } finally {
      setDetailLoading(false);
    }
  };

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
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <SupportTicketsHeaderSection />

        <SupportTicketsFiltersSection
          categoryFilter={filters.category}
          priorityFilter={filters.priority}
          statusFilter={filters.status}
          onCategoryChange={(value) => setFilter("category", value)}
          onPriorityChange={(value) => setFilter("priority", value)}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("status", value)}
        />

        <SupportTicketsTableSection
          error={error}
          items={items}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={changePage}
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
