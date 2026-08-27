"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Typography } from "@heroui/react/typography";
import { ReferralInviteCard } from "@repo/ui/cards/ReferralInviteCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

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
  const tHome = useTranslations("AthleteHome");
  const styles = athleteReferralScreenVariants();
  const router = useRouter();
  const [phone, setPhone] = useState("");

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
      headerClassName="shadow-none"
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <ReferralInviteCard
          actionLabel={tHome("referralAction")}
          codeLabel={tHome("referralCodeLabel")}
          copiedCodeLabel={tHome("referralCopiedCode")}
          copyCodeLabel={tHome("referralCopyCode")}
          description={tHome("referralDescription")}
          onAction={() => void handleShare()}
          referralCode={view.referralCode}
          successCount={toPersianDigits(view.stats.invitesJoined)}
          successLabel={tHome("referralSuccessLabel")}
          title={tHome("referralCardTitle")}
        />

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
              <TextWithBrand>{t("inviteTitle")}</TextWithBrand>
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
