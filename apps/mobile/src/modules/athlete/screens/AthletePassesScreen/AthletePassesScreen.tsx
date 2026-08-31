"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { PassKind, PassStatus } from "../../lib/athlete-passes-data";
import { athletePassesScreenVariants } from "./AthletePassesScreen.styles";
import type { AthletePassesScreenProps } from "./AthletePassesScreen.types";

const PASS_KINDS: PassKind[] = ["trial", "guest_pass", "gift"];

function kindLabel(
  t: ReturnType<typeof useTranslations<"AthletePasses">>,
  kind: PassKind,
) {
  switch (kind) {
    case "trial":
      return t("kindTrial");
    case "guest_pass":
      return t("kindGuestPass");
    case "gift":
      return t("kindGift");
    default:
      return kind;
  }
}

function statusLabel(
  t: ReturnType<typeof useTranslations<"AthletePasses">>,
  status: PassStatus,
) {
  switch (status) {
    case "available":
      return t("statusAvailable");
    case "used":
      return t("statusUsed");
    case "expired":
      return t("statusExpired");
    default:
      return status;
  }
}

export function AthletePassesScreen({
  owned,
  offers,
  activeKind,
  pending = false,
  message = null,
  onKindChange,
  onClaim,
  className,
}: AthletePassesScreenProps) {
  const t = useTranslations("AthletePasses");
  const styles = athletePassesScreenVariants();
  const router = useRouter();

  const filteredOwned = owned.filter((pass) => pass.kind === activeKind);
  const filteredOffers = offers.filter((offer) => offer.kind === activeKind);

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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

        <div className={styles.tabs()} role="tablist" aria-label={t("tabsLabel")}>
          {PASS_KINDS.map((kind) => (
            <Button
              key={kind}
              onPress={() => onKindChange(kind)}
              size="lg"
              variant={activeKind === kind ? "primary" : "outline"}
            >
              {kindLabel(t, kind)}
            </Button>
          ))}
        </div>

        <section className={styles.section()}>
          <Typography type="h3" weight="semibold">
            {t("offersTitle")}
          </Typography>
          {filteredOffers.length === 0 ? (
            <Typography className={styles.meta()} type="body-sm">
              {t("offersEmpty")}
            </Typography>
          ) : (
            <div className={styles.list()}>
              {filteredOffers.map((offer) => (
                <article className={styles.card()} key={offer.id}>
                  <div className={styles.rowTop()}>
                    <Typography type="body" weight="semibold">
                      {offer.title}
                    </Typography>
                    {offer.priceLabel ? (
                      <Typography className={styles.meta()} type="body-sm">
                        {offer.priceLabel}
                      </Typography>
                    ) : null}
                  </div>
                  <Typography type="body-sm">{offer.description}</Typography>
                  {onClaim ? (
                    <div className={styles.actions()}>
                      <Button
                        isDisabled={pending}
                        onPress={() => void onClaim(offer.id)}
                        size="lg"
                        variant="primary"
                      >
                        {t("claim")}
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section()}>
          <Typography type="h3" weight="semibold">
            {t("ownedTitle")}
          </Typography>
          {filteredOwned.length === 0 ? (
            <Typography className={styles.meta()} type="body-sm">
              {t("ownedEmpty")}
            </Typography>
          ) : (
            <div className={styles.list()}>
              {filteredOwned.map((pass) => (
                <article className={styles.card()} key={pass.id}>
                  <div className={styles.rowTop()}>
                    <Typography type="body" weight="semibold">
                      {pass.title}
                    </Typography>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{statusLabel(t, pass.status)}</Chip.Label>
                    </Chip>
                  </div>
                  {pass.clubName ? (
                    <Typography className={styles.meta()} type="body-sm">
                      {pass.clubName}
                    </Typography>
                  ) : null}
                  <Typography className={styles.meta()} type="body-sm">
                    {t("expires")}: {pass.expiresAtLabel}
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
      </div>
    </AppLayout>
  );
}
