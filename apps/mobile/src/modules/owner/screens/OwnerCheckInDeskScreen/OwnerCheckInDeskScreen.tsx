"use client";

import {
  Button,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ownerCheckInDeskScreenVariants } from "./OwnerCheckInDeskScreen.styles";
import type { OwnerCheckInDeskScreenProps } from "./OwnerCheckInDeskScreen.types";

export function OwnerCheckInDeskScreen({
  pending = false,
  message,
  error,
  onSubmit,
  className,
}: OwnerCheckInDeskScreenProps) {
  const t = useTranslations("OwnerCheckInDesk");
  const styles = ownerCheckInDeskScreenVariants();
  const router = useRouter();
  const [code, setCode] = useState("");

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

        <form
          className={styles.form()}
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = code.trim();
            if (!trimmed) return;
            void Promise.resolve(onSubmit(trimmed)).then(() => setCode(""));
          }}
        >
          <TextField>
            <Label>{t("codeLabel")}</Label>
            <Input
              onChange={(event) => setCode(event.target.value)}
              placeholder={t("codePlaceholder")}
              value={code}
            />
          </TextField>
          <Button
            isDisabled={pending || !code.trim()}
            type="submit"
            variant="primary"
          >
            {t("submit")}
          </Button>
        </form>

        {message ? (
          <Typography className={styles.success()} type="body-sm">
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography className={styles.danger()} type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
