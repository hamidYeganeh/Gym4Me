import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { kycListHeaderSectionVariants } from "./KycListHeaderSection.styles";
import type { KycListHeaderSectionProps } from "./KycListHeaderSection.types";

export function KycListHeaderSection({
  statusFilter,
  onStatusChange,
  onRefresh,
  className,
}: KycListHeaderSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = kycListHeaderSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {t("kycTitle")}
      </Typography>
      <Typography className={styles.subtitle()}>{t("kycSubtitle")}</Typography>
      <div className={styles.actions()}>
        {(["pending", "approved", "rejected", "all"] as const).map((value) => (
          <FilterChip
            key={value}
            onPress={() => onStatusChange(value)}
            selected={statusFilter === value}
          >
            {value === "all" ? t("filterAll") : t(`kyc.${value}`)}
          </FilterChip>
        ))}
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}
