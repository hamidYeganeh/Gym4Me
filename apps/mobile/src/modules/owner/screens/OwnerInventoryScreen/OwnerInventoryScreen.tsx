"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { OwnerInventoryCondition } from "../../lib/owner-inventory-data";
import { ownerInventoryScreenVariants } from "./OwnerInventoryScreen.styles";
import type { OwnerInventoryScreenProps } from "./OwnerInventoryScreen.types";

const CONDITION_COLOR: Record<
  OwnerInventoryCondition,
  "success" | "warning" | "danger"
> = {
  good: "success",
  needs_repair: "warning",
  out_of_service: "danger",
};

const CONDITION_KEY = {
  good: "conditionGood",
  needs_repair: "conditionNeedsRepair",
  out_of_service: "conditionOutOfService",
} as const;

export function OwnerInventoryScreen({
  items,
  className,
}: OwnerInventoryScreenProps) {
  const t = useTranslations("OwnerInventory");
  const router = useRouter();
  const styles = ownerInventoryScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("listTitle")}
          </Typography>
          {items.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {items.map((item, index) => (
                <div key={item.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {item.name}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("quantity", { count: item.quantity })} · {item.locationLabel}
                      </Typography>
                    </span>
                    <Chip
                      color={CONDITION_COLOR[item.condition]}
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>{t(CONDITION_KEY[item.condition])}</Chip.Label>
                    </Chip>
                  </div>
                  {index < items.length - 1 ? (
                    <div aria-hidden className={styles.divider()} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
