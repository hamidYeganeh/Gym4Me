"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Share1 } from "@repo/icons/Share1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import type { ReferralInviteStatus } from "@/modules/athlete/lib/referral-data";
import { athleteReferralScreenVariants } from "./AthleteReferralScreen.styles";
import type { AthleteReferralScreenProps } from "./AthleteReferralScreen.types";

const STATUS_KEY: Record<ReferralInviteStatus, string> = {
  pending: "statusPending",
  sent: "statusSent",
  joined: "statusJoined",
  expired: "statusExpired",
  unknown: "statusUnknown",
};

const STATUS_COLOR: Record<
  ReferralInviteStatus,
  "warning" | "success" | "default"
> = {
  pending: "warning",
  sent: "default",
  joined: "success",
  expired: "default",
  unknown: "default",
};

export function AthleteReferralScreen({
  view,
  pending = false,
  onInvite,
  className,
}: AthleteReferralScreenProps) {
  const t = useTranslations("AthleteReferral");
  const styles = athleteReferralScreenVariants();
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(view.referralCode);
    } catch {
      // ignore clipboard failures
    }
  };

  const handleShare = async () => {
    const text = t("shareText", {
      code: view.referralCode,
      url: view.inviteUrl,
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: t("title"), text, url: view.inviteUrl });
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore share failures
    }
  };

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

        <section className={styles.codeCard()}>
          <Typography type="body-sm">{t("codeLabel")}</Typography>
          <Typography
            className={styles.codeValue()}
            type="h2"
            weight="bold"
          >
            {view.referralCode}
          </Typography>
          <div className={styles.actions()}>
            <Button fullWidth onPress={() => void handleCopy()} variant="secondary">
              {t("copyCode")}
            </Button>
            <Button fullWidth onPress={() => void handleShare()} variant="primary">
              <Share1 size={18} />
              {t("shareInvite")}
            </Button>
          </div>
          <Typography className={styles.meta()} type="body-sm">
            {view.inviteUrl}
          </Typography>
        </section>

        <div className={styles.stats()}>
          <div className={styles.stat()}>
            <Typography className={styles.statValue()} type="h4" weight="bold">
              {toPersianDigits(view.stats.invitesSent)}
            </Typography>
            <Typography className={styles.statLabel()} type="body-sm">
              {t("statSent")}
            </Typography>
          </div>
          <div className={styles.stat()}>
            <Typography className={styles.statValue()} type="h4" weight="bold">
              {toPersianDigits(view.stats.invitesJoined)}
            </Typography>
            <Typography className={styles.statLabel()} type="body-sm">
              {t("statJoined")}
            </Typography>
          </div>
          <div className={styles.stat()}>
            <Typography className={styles.statValue()} type="h4" weight="bold">
              {toPersianDigits(view.stats.totalReferred)}
            </Typography>
            <Typography className={styles.statLabel()} type="body-sm">
              {t("statTotal")}
            </Typography>
          </div>
        </div>

        {onInvite ? (
          <section className={styles.inviteForm()}>
            <Typography type="body" weight="semibold">
              {t("inviteTitle")}
            </Typography>
            <TextField>
              <Label>{t("phoneLabel")}</Label>
              <Input
                inputMode="tel"
                onChange={(event) => setPhone(event.target.value)}
                placeholder={t("phonePlaceholder")}
                value={phone}
              />
            </TextField>
            <Button
              fullWidth
              isDisabled={pending || phone.trim().length < 8}
              onPress={() => {
                const cleaned = phone.trim();
                if (!cleaned) return;
                void onInvite([cleaned]);
                setPhone("");
              }}
              variant="primary"
            >
              {t("sendInvite")}
            </Button>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <Typography type="body-sm">{t("invitesTitle")}</Typography>
          {view.invites.length === 0 ? (
            <div className={styles.empty()}>
              <Typography type="h4" weight="semibold">
                {t("emptyTitle")}
              </Typography>
              <Typography className={styles.meta()} type="body-sm">
                {t("emptyBody")}
              </Typography>
            </div>
          ) : (
            <div className={styles.list()}>
              {view.invites.map((invite) => (
                <article className={styles.inviteCard()} key={invite.id}>
                  <div className={styles.inviteMeta()}>
                    <Typography type="body" weight="semibold">
                      {invite.phone}
                    </Typography>
                    <Typography className={styles.meta()} type="body-sm">
                      {invite.createdLabel}
                    </Typography>
                  </div>
                  <Chip color={STATUS_COLOR[invite.status]} size="sm" variant="soft">
                    <Chip.Label>{t(STATUS_KEY[invite.status])}</Chip.Label>
                  </Chip>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
