"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { PaperPlaneHorizontal } from "@repo/icons/PaperPlaneHorizontal";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { coachThreadScreenVariants } from "./CoachThreadScreen.styles";
import type { CoachThreadScreenProps } from "./CoachThreadScreen.types";

export function CoachThreadScreen({
  thread,
  messages,
  sending = false,
  error = null,
  onSend,
  className,
}: CoachThreadScreenProps) {
  const t = useTranslations("CoachMessages");
  const styles = coachThreadScreenVariants();
  const router = useRouter();
  const [draft, setDraft] = useState("");

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push("/coach/messages")}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={thread.title}
        />
      }
    >
      <div className={styles.content()}>
        <div className={styles.messages()}>
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                className={
                  message.fromCoach
                    ? styles.bubbleCoach()
                    : styles.bubbleAthlete()
                }
                key={message.id}
              >
                <Typography type="body-sm">{message.body}</Typography>
                <Typography className={styles.bubbleMeta()} type="body-sm">
                  {message.sentAtLabel}
                </Typography>
              </div>
            ))
          ) : (
            <Typography className={styles.empty()} type="body-sm">
              {t("messagesEmpty")}
            </Typography>
          )}
        </div>

        <form
          className={styles.composer()}
          onSubmit={(event) => {
            event.preventDefault();
            const body = draft.trim();
            if (!body || !onSend) return;
            void Promise.resolve(onSend(body)).then(() => setDraft(""));
          }}
        >
          <TextField className={styles.composerField()}>
            <Label className="sr-only">{t("composerLabel")}</Label>
            <Input
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("composerPlaceholder")}
              value={draft}
            />
          </TextField>
          <Button
            aria-label={t("send")}
            isDisabled={sending || !draft.trim() || !onSend}
            isIconOnly
            size="lg"
            type="submit"
            variant="primary"
          >
            <PaperPlaneHorizontal size={20} />
          </Button>
        </form>
        {error ? (
          <Typography className="text-danger" type="body-sm">
            {t("sendError")}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
