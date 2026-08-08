import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Chip,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  SupportTicket,
  SupportTicketDetail,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@repo/api";
import { ApiError } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminSupport } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { formatAdminDate } from "@/shared/lib/user-format";
import {
  TICKET_PRIORITIES,
  TICKET_STATUS_COLOR,
} from "../../lib/support-constants";
import {
  createSupportTableColumns,
  ticketRequesterId,
  ticketRequesterLabel,
  type SupportTableMeta,
} from "../../lib/support-table-columns";
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

  const columns = useMemo(
    () =>
      createSupportTableColumns({
        columns: {
          ticketNumber: t("columns.ticketNumber"),
          requester: t("columns.requester"),
          subject: t("columns.subject"),
          category: t("columns.category"),
          priority: t("columns.priority"),
          status: t("columns.status"),
          lastMessageAt: t("columns.lastMessageAt"),
          actions: t("columns.actions"),
        },
        category: (category) => t(`category.${category}`),
        priority: (priority) => t(`priority.${priority}`),
        status: (status) => t(`status.${status}`),
        view: t("actionsMenu.view"),
      }) as ColumnDef<SupportTicket, unknown>[],
    [t],
  );

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

  const meta: SupportTableMeta = {
    actionsClassName: styles.actions(),
    onView: (row) => void openDetail(row),
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

  const requesterLinkId = detail ? ticketRequesterId(detail) : null;
  const isTerminal =
    detail?.status === "closed" || detail?.status === "resolved";

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
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("ticketsTitle")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("ticketsSubtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(
              [
                "all",
                "open",
                "awaiting_admin",
                "awaiting_user",
                "resolved",
                "closed",
              ] as const
            ).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={statusFilter === value ? "primary" : "secondary"}
                onPress={() => setStatusFilter(value)}
              >
                {value === "all" ? t("filterAll") : t(`status.${value}`)}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("ticketsTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("ticketsEmpty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          summaryLabel={t("infinite.summary", {
            loaded: items.length,
            total,
          })}
          onLoadMore={loadMore}
        />
      </div>

      <AdminFormDrawer
        isOpen={Boolean(detail)}
        title={detail ? `${t("ticketTitle")} ${detail.ticketNumber}` : ""}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        {detail ? (
          <div className={styles.drawerBody()}>
            <dl className={styles.meta()}>
              <div>
                <dt className="text-muted">{t("columns.requester")}</dt>
                <dd className="font-medium">
                  {requesterLinkId ? (
                    <RouterLink
                      className="text-accent underline-offset-2 hover:underline"
                      to={routes.user(requesterLinkId)}
                    >
                      {ticketRequesterLabel(detail)}
                    </RouterLink>
                  ) : (
                    ticketRequesterLabel(detail)
                  )}{" "}
                  <span className="text-muted">
                    ({t(`requesterRole.${detail.requester.role}`)})
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t("columns.subject")}</dt>
                <dd>{detail.subject}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("columns.category")}</dt>
                <dd>{t(`category.${detail.category}`)}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("columns.status")}</dt>
                <dd>
                  <Chip
                    color={TICKET_STATUS_COLOR[detail.status]}
                    size="sm"
                    variant="soft"
                  >
                    {t(`status.${detail.status}`)}
                  </Chip>
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t("columns.priority")}</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {TICKET_PRIORITIES.map((priority) => (
                    <Button
                      key={priority}
                      isDisabled={actionPending || isTerminal}
                      size="sm"
                      variant={
                        detail.priority === priority ? "primary" : "secondary"
                      }
                      onPress={() => handlePriority(priority)}
                    >
                      {t(`priority.${priority}`)}
                    </Button>
                  ))}
                </dd>
              </div>
              {detail.resolution ? (
                <div>
                  <dt className="text-muted">{t("resolutionNote")}</dt>
                  <dd>{detail.resolution.note ?? "—"}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted">{t("createdAt")}</dt>
                <dd>{formatAdminDate(detail.createdAt)}</dd>
              </div>
            </dl>

            <div>
              <Typography className="mb-2 text-sm font-medium">
                {t("thread")}
              </Typography>
              {detailLoading ? (
                <p className="text-sm text-muted">{t("loading")}</p>
              ) : (
                <div className={styles.thread()}>
                  {detail.messages.length === 0 ? (
                    <p className="text-sm text-muted">{t("threadEmpty")}</p>
                  ) : (
                    detail.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`${styles.message()} ${
                          message.author.kind === "admin"
                            ? styles.messageAdmin()
                            : styles.messageRequester()
                        }`}
                      >
                        <span className={styles.messageMeta()}>
                          {message.author.kind === "admin"
                            ? t("authorAdmin")
                            : t("authorRequester")}{" "}
                          · {formatAdminDate(message.createdAt)}
                        </span>
                        <p className="whitespace-pre-wrap text-sm">
                          {message.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {detailError ? (
              <p className="text-sm text-danger" role="alert">
                {detailError}
              </p>
            ) : null}

            {detail.status !== "closed" ? (
              <TextField
                className={styles.replyField()}
                fullWidth
                name="replyBody"
                value={replyBody}
                onChange={setReplyBody}
              >
                <Label>{t("replyLabel")}</Label>
                <TextArea
                  className="min-h-24"
                  placeholder={t("replyPlaceholder")}
                />
              </TextField>
            ) : null}

            {actionError ? (
              <p className="text-sm text-danger" role="alert">
                {actionError}
              </p>
            ) : null}

            <div className={styles.actions()}>
              {detail.status !== "closed" ? (
                <Button
                  isDisabled={actionPending || !replyBody.trim()}
                  variant="primary"
                  onPress={() => void handleReply()}
                >
                  {t("sendReply")}
                </Button>
              ) : null}
              {!detail.assignment ? (
                <Button
                  isDisabled={actionPending}
                  variant="secondary"
                  onPress={handleAssign}
                >
                  {t("assignToMe")}
                </Button>
              ) : null}
              {!isTerminal ? (
                <Button
                  isDisabled={actionPending}
                  variant="secondary"
                  onPress={() => {
                    setResolveNote("");
                    setResolveOpen(true);
                  }}
                >
                  {t("resolve")}
                </Button>
              ) : null}
              {detail.status !== "closed" ? (
                <Button
                  isDisabled={actionPending}
                  variant="danger"
                  onPress={handleClose}
                >
                  {t("close")}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("resolveBody")}</p>
            <TextField
              className={styles.resolveField()}
              fullWidth
              name="resolutionNote"
              value={resolveNote}
              onChange={setResolveNote}
            >
              <Label>{t("resolutionNote")}</Label>
              <TextArea className="min-h-20" />
            </TextField>
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("resolve")}
        confirmVariant="primary"
        isOpen={resolveOpen}
        isPending={actionPending}
        title={t("resolveTitle")}
        onConfirm={() => void handleResolve()}
        onOpenChange={setResolveOpen}
      />
    </AdminShell>
  );
}
