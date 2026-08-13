"use client";

import { Button, Typography } from "@heroui/react";
import { Chat } from "@repo/icons/Chat";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { CoachMessageThread } from "../../lib/coach-messages-data";
import { coachMessagesScreenVariants } from "./CoachMessagesScreen.styles";
import type { CoachMessagesScreenProps } from "./CoachMessagesScreen.types";

export function CoachMessagesScreen({
  threads,
  className,
}: CoachMessagesScreenProps) {
  const t = useTranslations("CoachMessages");
  const styles = coachMessagesScreenVariants();
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root({ className })}
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
            {threads.map((thread: CoachMessageThread) => (
              <button
                className={styles.item()}
                key={thread.id}
                onClick={() => router.push(`/coach/messages/${thread.id}`)}
                type="button"
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
              </button>
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
