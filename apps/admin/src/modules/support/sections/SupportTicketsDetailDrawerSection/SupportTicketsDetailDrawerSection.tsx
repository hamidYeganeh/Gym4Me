import { Link as RouterLink } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { SupportTicketPriority } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { routes } from "@/shared/lib/routes";
import { formatAdminDate } from "@/shared/lib/user-format";
import {
  TICKET_PRIORITIES,
  TICKET_STATUS_COLOR,
} from "../../lib/support-constants";
import {
  ticketRequesterId,
  ticketRequesterLabel,
} from "../../lib/support-table-columns";
import { supportTicketsDetailDrawerSectionVariants } from "./SupportTicketsDetailDrawerSection.styles";
import type { SupportTicketsDetailDrawerSectionProps } from "./SupportTicketsDetailDrawerSection.types";

export function SupportTicketsDetailDrawerSection({
  detail,
  detailLoading,
  detailError,
  replyBody,
  onReplyBodyChange,
  actionPending,
  actionError,
  onOpenChange,
  onReply,
  onPriority,
  onAssign,
  onResolveOpen,
  onClose,
}: SupportTicketsDetailDrawerSectionProps) {
  const t = useTranslations("Admin.Support");
  const styles = supportTicketsDetailDrawerSectionVariants();

  const requesterLinkId = detail ? ticketRequesterId(detail) : null;
  const isTerminal =
    detail?.status === "closed" || detail?.status === "resolved";

  return (
    <AdminFormDrawer
      isOpen={Boolean(detail)}
      title={detail ? `${t("ticketTitle")} ${detail.ticketNumber}` : ""}
      onOpenChange={onOpenChange}
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
                {TICKET_PRIORITIES.map((priority: SupportTicketPriority) => (
                  <Button
                    key={priority}
                    isDisabled={actionPending || isTerminal}
                    size="sm"
                    variant={
                      detail.priority === priority ? "primary" : "secondary"
                    }
                    onPress={() => onPriority(priority)}
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
              <Typography className="text-sm text-muted">{t("loading")}</Typography>
            ) : (
              <div className={styles.thread()}>
                {detail.messages.length === 0 ? (
                  <Typography className="text-sm text-muted">
                    {t("threadEmpty")}
                  </Typography>
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
                      <Typography className="whitespace-pre-wrap text-sm">
                        {message.body}
                      </Typography>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {detailError ? (
            <Typography className="text-sm text-danger" role="alert">
              {detailError}
            </Typography>
          ) : null}

          {detail.status !== "closed" ? (
            <TextField
              className={styles.replyField()}
              fullWidth
              name="replyBody"
              value={replyBody}
              onChange={onReplyBodyChange}
            >
              <Label>{t("replyLabel")}</Label>
              <TextArea
                className="min-h-24"
                placeholder={t("replyPlaceholder")}
              />
            </TextField>
          ) : null}

          {actionError ? (
            <Typography className="text-sm text-danger" role="alert">
              {actionError}
            </Typography>
          ) : null}

          <div className={styles.actions()}>
            {detail.status !== "closed" ? (
              <Button
                isDisabled={actionPending || !replyBody.trim()}
                variant="primary"
                onPress={onReply}
              >
                {t("sendReply")}
              </Button>
            ) : null}
            {!detail.assignment ? (
              <Button
                isDisabled={actionPending}
                variant="secondary"
                onPress={onAssign}
              >
                {t("assignToMe")}
              </Button>
            ) : null}
            {!isTerminal ? (
              <Button
                isDisabled={actionPending}
                variant="secondary"
                onPress={onResolveOpen}
              >
                {t("resolve")}
              </Button>
            ) : null}
            {detail.status !== "closed" ? (
              <Button
                isDisabled={actionPending}
                variant="danger"
                onPress={onClose}
              >
                {t("close")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminFormDrawer>
  );
}
