"use client";

import { useState } from "react";
import {
  Button,
  Chip,
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
import type { FamilyConsentStatus } from "../../lib/athlete-family-data";
import { athleteFamilyAccountsScreenVariants } from "./AthleteFamilyAccountsScreen.styles";
import type { AthleteFamilyAccountsScreenProps } from "./AthleteFamilyAccountsScreen.types";

function consentLabel(
  t: ReturnType<typeof useTranslations<"AthleteFamily">>,
  status: FamilyConsentStatus,
) {
  switch (status) {
    case "pending":
      return t("consentPending");
    case "granted":
      return t("consentGranted");
    case "revoked":
      return t("consentRevoked");
    default:
      return status;
  }
}

export function AthleteFamilyAccountsScreen({
  childProfiles,
  pending = false,
  message = null,
  error = null,
  onAddChild,
  className,
}: AthleteFamilyAccountsScreenProps) {
  const t = useTranslations("AthleteFamily");
  const styles = athleteFamilyAccountsScreenVariants();
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");

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

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            {t("addChildTitle")}
          </Typography>
          <div className={styles.form()}>
            <TextField>
              <Label>{t("nameLabel")}</Label>
              <Input
                onChange={(event) => setName(event.target.value)}
                placeholder={t("namePlaceholder")}
                value={name}
              />
            </TextField>
            <TextField>
              <Label>{t("birthDateLabel")}</Label>
              <Input
                onChange={(event) => setBirthDate(event.target.value)}
                type="date"
                value={birthDate}
              />
            </TextField>
            <Button
              fullWidth
              isDisabled={pending || !name.trim() || !birthDate}
              onPress={() => {
                void Promise.resolve(
                  onAddChild({ name: name.trim(), birthDate }),
                ).then(() => {
                  setName("");
                  setBirthDate("");
                });
              }}
              variant="primary"
            >
              {t("addChild")}
            </Button>
          </div>
        </section>

        <section>
          <Typography type="h3" weight="semibold">
            {t("listTitle")}
          </Typography>
          {childProfiles.length === 0 ? (
            <Typography className={styles.meta()} type="body-sm">
              {t("emptyBody")}
            </Typography>
          ) : (
            <div className={styles.list()}>
              {childProfiles.map((child) => (
                <article className={styles.row()} key={child.id}>
                  <div className={styles.rowTop()}>
                    <Typography type="body" weight="semibold">
                      {child.name}
                    </Typography>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>
                        {consentLabel(t, child.consentStatus)}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.meta()} type="body-sm">
                    {t("birthDate")}: {child.birthDateLabel}
                  </Typography>
                </article>
              ))}
            </div>
          )}
        </section>

        {message ? (
          <Typography className={styles.feedback()} type="body-sm">
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography className={styles.error()} type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
