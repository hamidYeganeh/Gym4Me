import { Button } from "@heroui/react/button";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../../lib/support-constants";
import { supportTicketsFiltersSectionVariants } from "./SupportTicketsFiltersSection.styles";
import type { SupportTicketsFiltersSectionProps } from "./SupportTicketsFiltersSection.types";

export function SupportTicketsFiltersSection({
  statusFilter,
  categoryFilter,
  priorityFilter,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onRefresh,
  className,
}: SupportTicketsFiltersSectionProps) {
  const t = useTranslations("Admin.Support");
  const styles = supportTicketsFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <AdminFilterSelect
        allLabel={t("filterAll")}
        label={t("filters.status")}
        options={TICKET_STATUSES.map((item) => ({
          value: item,
          label: t(`status.${item}`),
        }))}
        value={statusFilter}
        onChange={(value) =>
          onStatusChange(value as SupportTicketStatus | "all")
        }
      />
      <AdminFilterSelect
        allLabel={t("filterAll")}
        label={t("filters.category")}
        options={TICKET_CATEGORIES.map((item) => ({
          value: item,
          label: t(`category.${item}`),
        }))}
        value={categoryFilter}
        onChange={(value) =>
          onCategoryChange(value as SupportTicketCategory | "all")
        }
      />
      <AdminFilterSelect
        allLabel={t("filterAll")}
        label={t("filters.priority")}
        options={TICKET_PRIORITIES.map((item) => ({
          value: item,
          label: t(`priority.${item}`),
        }))}
        value={priorityFilter}
        onChange={(value) =>
          onPriorityChange(value as SupportTicketPriority | "all")
        }
      />
      <Button size="sm" variant="ghost" onPress={onRefresh}>
        {t("refresh")}
      </Button>
    </div>
  );
}
