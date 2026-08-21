"use client";

import { ReferralInviteCard } from "@repo/ui/cards/ReferralInviteCard";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useEffect, useState } from "react";
import { DEMO_REFERRAL } from "@/modules/athlete/lib/referral-data";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { accountReferral } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { athleteReferralInviteSectionVariants } from "./AthleteReferralInviteSection.styles";
import type { AthleteReferralInviteSectionProps } from "./AthleteReferralInviteSection.types";

type ReferralSummary = {
  referralCode: string;
  invitesJoined: number;
};

export function AthleteReferralInviteSection({
  className,
}: AthleteReferralInviteSectionProps) {
  const t = useTranslations("AthleteHome");
  const styles = athleteReferralInviteSectionVariants();
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();
  const [summary, setSummary] = useState<ReferralSummary | null>(null);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      setSummary({
        referralCode: DEMO_REFERRAL.referralCode,
        invitesJoined: DEMO_REFERRAL.stats.invitesJoined,
      });
      return;
    }

    let cancelled = false;
    accountReferral
      .me()
      .then((me) => {
        if (cancelled) return;
        setSummary({
          referralCode: me.referralCode,
          invitesJoined: me.stats.invitesJoined,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setSummary({
          referralCode: DEMO_REFERRAL.referralCode,
          invitesJoined: DEMO_REFERRAL.stats.invitesJoined,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!summary) return null;

  return (
    <section
      aria-label={t("referralCardTitle")}
      className={styles.root({ className })}
    >
      <ReferralInviteCard
        actionLabel={t("referralAction")}
        codeLabel={t("referralCodeLabel")}
        copiedCodeLabel={t("referralCopiedCode")}
        copyCodeLabel={t("referralCopyCode")}
        description={t("referralDescription")}
        onAction={() => router.push("/athlete/referral")}
        referralCode={summary.referralCode}
        successCount={toPersianDigits(summary.invitesJoined)}
        successLabel={t("referralSuccessLabel")}
        title={t("referralCardTitle")}
      />
    </section>
  );
}
