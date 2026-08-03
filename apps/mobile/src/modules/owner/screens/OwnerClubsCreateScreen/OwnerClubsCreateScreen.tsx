"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ownerClubsCreateScreenStyles as styles } from "./OwnerClubsCreateScreen.styles";

export function OwnerClubsCreateScreen() {
  const t = useTranslations("OwnerClubsCreate");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          className="border-b-0 bg-background"
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
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <Typography className={styles.title} type="h3" weight="semibold">
          {t("title")}
        </Typography>
        <Typography className={styles.subtitle} type="body">
          {t("subtitle")}
        </Typography>
      </div>
    </AppLayout>
  );
}
