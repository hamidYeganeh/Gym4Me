"use client";

import { Button } from "@heroui/react/button";
import { useTranslations } from "next-intl";
import { coachClientDetailActionsSectionVariants } from "./CoachClientDetailActionsSection.styles";
import type { CoachClientDetailActionsSectionProps } from "./CoachClientDetailActionsSection.types";

export function CoachClientDetailActionsSection({
  sessionLogged,
  onLogSession,
  messaging = false,
  onSendMessage,
}: CoachClientDetailActionsSectionProps) {
  const t = useTranslations("CoachClientDetail");
  const styles = coachClientDetailActionsSectionVariants();

  return (
    <section className={styles.root()}>
      <Button
        fullWidth
        isDisabled={sessionLogged}
        onPress={onLogSession}
        variant="primary"
       size="lg">
        {sessionLogged ? t("logSessionDone") : t("logSession")}
      </Button>
      <Button size="lg"
        fullWidth
        isDisabled={messaging}
        onPress={() => {
          void onSendMessage?.();
        }}
        variant="ghost"
      >
        {messaging ? t("sendMessagePending") : t("sendMessage")}
      </Button>
    </section>
  );
}
