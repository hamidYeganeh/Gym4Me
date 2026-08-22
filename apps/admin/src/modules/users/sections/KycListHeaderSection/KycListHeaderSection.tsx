import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type { KycRequestKind, KycRequestStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import { kycListHeaderSectionVariants } from "./KycListHeaderSection.styles";
import type { KycListHeaderSectionProps } from "./KycListHeaderSection.types";

const KYC_STATUSES: KycRequestStatus[] = ["pending", "approved", "rejected"];
const KYC_KINDS: KycRequestKind[] = ["identity", "document"];

export function KycListHeaderSection({
  statusFilter,
  kindFilter,
  onStatusChange,
  onKindChange,
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
      <div className={styles.filters()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filterStatus")}
          options={KYC_STATUSES.map((item) => ({
            value: item,
            label: t(`kyc.${item}`),
          }))}
          value={statusFilter}
          onChange={(value) => onStatusChange(value as typeof statusFilter)}
        />
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filterKind")}
          options={KYC_KINDS.map((item) => ({
            value: item,
            label: t(`kycKind.${item}`),
          }))}
          value={kindFilter}
          onChange={(value) => onKindChange(value as typeof kindFilter)}
        />
        <Button size="sm" variant="ghost" onPress={onRefresh}>
          {t("refresh")}
        </Button>
      </div>
    </section>
  );
}
