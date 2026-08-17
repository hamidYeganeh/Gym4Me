import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { supportTicketsFiltersSectionVariants } from "./SupportTicketsFiltersSection.styles";
import {
  SUPPORT_TICKET_STATUS_FILTERS,
  type SupportTicketsFiltersSectionProps,
} from "./SupportTicketsFiltersSection.types";

export function SupportTicketsFiltersSection({
  statusFilter,
  onStatusChange,
  onRefresh,
  className,
}: SupportTicketsFiltersSectionProps) {
  const t = useTranslations("Admin.Support");
  const styles = supportTicketsFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      {SUPPORT_TICKET_STATUS_FILTERS.map((value) => (
        <Button
          key={value}
          size="sm"
          variant={statusFilter === value ? "primary" : "secondary"}
          onPress={() => onStatusChange(value)}
        >
          {value === "all" ? t("filterAll") : t(`status.${value}`)}
        </Button>
      ))}
      <Button size="sm" variant="ghost" onPress={onRefresh}>
        {t("refresh")}
      </Button>
    </div>
  );
}
