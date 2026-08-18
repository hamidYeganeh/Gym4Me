"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Chat } from "@repo/icons/Chat";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FaceHappy } from "@repo/icons/FaceHappy";
import { QuestionMark } from "@repo/icons/QuestionMark";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { ProfileMenuRow } from "@/modules/account/components/ProfileMenuRow";
import { helpCenterScreenVariants } from "./HelpCenterScreen.styles";
import type { HelpCenterScreenProps } from "./HelpCenterScreen.types";

const ICON = 24;

export function HelpCenterScreen({
  className,
  roleSegment = "athlete",
}: HelpCenterScreenProps) {
  const t = useTranslations("Mobile.HelpCenter");
  const styles = helpCenterScreenVariants();
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
              onPress={() => router.push(`/${roleSegment}/profile`)}
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

        <div className={styles.stack()}>
          <ProfileMenuRow
            hint={t("faqHint")}
            icon={<QuestionMark size={ICON} />}
            label={t("faq")}
            onPress={() => router.push(`/${roleSegment}/profile/help/faq`)}
          />
          <ProfileMenuRow
            hint={t("chatHint")}
            icon={<Chat size={ICON} />}
            label={t("liveChat")}
            onPress={() => {
              window.location.href = `tel:${t("supportPhone")}`;
            }}
          />
          <ProfileMenuRow
            hint={t("feedbackHint")}
            icon={<FaceHappy size={ICON} />}
            label={t("feedback")}
            onPress={() =>
              router.push(`/${roleSegment}/profile/help/tickets`)
            }
          />
        </div>
      </div>
    </AppLayout>
  );
}
