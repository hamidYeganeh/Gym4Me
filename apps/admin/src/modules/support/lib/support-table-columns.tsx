import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@repo/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import {
  TICKET_PRIORITY_COLOR,
  TICKET_STATUS_COLOR,
} from "./support-constants";

export type SupportTableLabels = {
  columns: {
    ticketNumber: string;
    requester: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    lastMessageAt: string;
    actions: string;
  };
  category: (category: SupportTicketCategory) => string;
  priority: (priority: SupportTicketPriority) => string;
  status: (status: SupportTicketStatus) => string;
  view: string;
};

export type SupportTableMeta = {
  onView: (row: SupportTicket) => void;
  actionsClassName: string;
};

const columnHelper = createColumnHelper<SupportTicket>();

export function ticketRequesterLabel(row: SupportTicket) {
  const user = row.requester.user;
  if (!user) return "—";
  if (typeof user === "string") return user;
  const name = [user.name?.first, user.name?.last].filter(Boolean).join(" ");
  return name || user.phone || user.id || "—";
}

export function ticketRequesterId(row: SupportTicket): string | null {
  const user = row.requester.user;
  if (!user) return null;
  if (typeof user === "string") return user;
  return user.id ?? null;
}

export function createSupportTableColumns(labels: SupportTableLabels) {
  return [
    columnHelper.accessor("ticketNumber", {
      header: labels.columns.ticketNumber,
      size: 110,
      enableSorting: false,
      cell: (info) => (
        <span className="tabular-nums font-medium" dir="ltr">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "requester",
      header: labels.columns.requester,
      size: 160,
      cell: (info) => (
        <span className="block truncate">
          {ticketRequesterLabel(info.row.original)}
        </span>
      ),
    }),
    columnHelper.accessor("subject", {
      header: labels.columns.subject,
      size: 220,
      enableSorting: false,
      cell: (info) => (
        <span className="block truncate">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("category", {
      header: labels.columns.category,
      size: 120,
      enableSorting: false,
      cell: (info) => labels.category(info.getValue()),
    }),
    columnHelper.accessor("priority", {
      header: labels.columns.priority,
      size: 100,
      enableSorting: false,
      cell: (info) => (
        <Chip
          color={TICKET_PRIORITY_COLOR[info.getValue()]}
          size="sm"
          variant="soft"
        >
          {labels.priority(info.getValue())}
        </Chip>
      ),
    }),
    columnHelper.accessor("status", {
      header: labels.columns.status,
      size: 130,
      enableSorting: false,
      cell: (info) => (
        <Chip
          color={TICKET_STATUS_COLOR[info.getValue()]}
          size="sm"
          variant="soft"
        >
          {labels.status(info.getValue())}
        </Chip>
      ),
    }),
    columnHelper.accessor("lastMessageAt", {
      header: labels.columns.lastMessageAt,
      size: 130,
      enableSorting: false,
      cell: (info) => {
        const value = info.getValue();
        return value ? formatAdminDate(value) : "—";
      },
    }),
    columnHelper.display({
      id: "actions",
      header: labels.columns.actions,
      size: 110,
      cell: (info) => {
        const meta = info.table.options.meta as SupportTableMeta | undefined;
        if (!meta) return null;
        return (
          <div className={meta.actionsClassName}>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => meta.onView(info.row.original)}
            >
              {labels.view}
            </Button>
          </div>
        );
      },
    }),
  ];
}
