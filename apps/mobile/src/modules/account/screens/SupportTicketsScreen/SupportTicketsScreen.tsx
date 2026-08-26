"use client";

import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { Spinner } from "@heroui/react/spinner";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import { formatJalaliDateTime } from "@/shared/lib/booking-view";
import { supportTicketsScreenVariants } from "./SupportTicketsScreen.styles";
import type { SupportTicketsScreenProps } from "./SupportTicketsScreen.types";

export function SupportTicketsScreen({
  className,
  roleSegment = "athlete",
  tickets,
  loading,
  creating,
  error,
  onCreate,
}: SupportTicketsScreenProps) {
  const t = useTranslations("Mobile.SupportTickets");
  const styles = supportTicketsScreenVariants();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.push(`/${roleSegment}/profile/help`)}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        {onCreate ? (
          <form
            className={styles.form()}
            onSubmit={(event) => {
              event.preventDefault();
              if (!subject.trim() || !body.trim()) return;
              void Promise.resolve(
                onCreate({ subject: subject.trim(), body: body.trim() }),
              ).then(() => {
                setSubject("");
                setBody("");
              });
            }}
          >
            <Typography type="body" weight="semibold">
              {t("newTitle")}
            </Typography>
            <TextField>
              <Label>{t("subjectLabel")}</Label>
              <Input
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("subjectPlaceholder")}
                value={subject}
              />
            </TextField>
            <TextField>
              <Label>{t("bodyLabel")}</Label>
              <TextArea
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("bodyPlaceholder")}
                rows={4}
                value={body}
              />
            </TextField>
            {error ? (
              <Typography className="text-danger" type="body-sm">
                {error}
              </Typography>
            ) : null}
            <div className={styles.actions()}>
              <Button
                isDisabled={creating || !subject.trim() || !body.trim()}
                type="submit"
                variant="primary"
              >
                {creating ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <Typography className={styles.empty()} type="body">
            {t("empty")}
          </Typography>
        ) : (
          <div className={styles.list()}>
            {tickets.map((ticket) => (
              <article className={styles.item()} key={ticket.id}>
                <Typography type="body" weight="semibold">
                  {ticket.subject}
                </Typography>
                <Typography className={styles.itemMeta()} type="body-sm">
                  {ticket.ticketNumber} · {ticket.status} ·{" "}
                  {formatJalaliDateTime(ticket.createdAt)}
                </Typography>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
