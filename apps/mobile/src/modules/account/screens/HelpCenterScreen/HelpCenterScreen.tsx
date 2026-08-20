"use client";

import { Chat } from "@repo/icons/Chat";
import { FaceHappy } from "@repo/icons/FaceHappy";
import { QuestionMark } from "@repo/icons/QuestionMark";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { ProfileMenuRow } from "@/modules/account/components/ProfileMenuRow";
import { helpCenterScreenVariants } from "./HelpCenterScreen.styles";
import type { HelpCenterScreenProps } from "./HelpCenterScreen.types";
import { useRouter } from "@/shared/lib/app-router";

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
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.push(`/${roleSegment}/profile`)}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
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
