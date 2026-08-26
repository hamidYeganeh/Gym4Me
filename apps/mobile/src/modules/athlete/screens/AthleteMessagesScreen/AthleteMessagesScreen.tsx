"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Chat } from "@repo/icons/Chat";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { AthleteMessageThread } from "../../lib/athlete-messages-data";
import { athleteMessagesScreenVariants } from "./AthleteMessagesScreen.styles";
import type { AthleteMessagesScreenProps } from "./AthleteMessagesScreen.types";

export function AthleteMessagesScreen({
  threads,
  className,
}: AthleteMessagesScreenProps) {
  const t = useTranslations("AthleteMessages");
  const styles = athleteMessagesScreenVariants();
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
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

        {threads.length > 0 ? (
          <div className={styles.list()}>
            {threads.map((thread: AthleteMessageThread) => (
              <Button
                className={styles.item()}
                key={thread.id}
                variant="ghost"
                onPress={() => router.push(`/athlete/messages/${thread.id}`)}
              >
                <span className={styles.itemIcon()} aria-hidden>
                  <Chat size={22} />
                </span>
                <span className={styles.itemBody()}>
                  <Typography type="body" weight="semibold">
                    {thread.title}
                  </Typography>
                  <Typography className={styles.itemPreview()} type="body-sm">
                    {thread.preview}
                  </Typography>
                </span>
                <Typography className={styles.itemMeta()} type="body-sm">
                  {thread.updatedLabel}
                </Typography>
              </Button>
            ))}
          </div>
        ) : (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className="text-muted" type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
