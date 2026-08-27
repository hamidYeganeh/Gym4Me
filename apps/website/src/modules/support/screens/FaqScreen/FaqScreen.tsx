"use client";

import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import type { PublicFaqItem } from "@repo/api";
import { Accordion } from "@heroui/react/accordion";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { useTranslations } from "next-intl";
import { PublicSiteFooter, PublicSiteHeader } from "@/shared/components/PublicSiteHeader";
import { landingFaqSectionStyles } from "@/modules/marketing/sections/LandingFaqSection/LandingFaqSection.styles";

export function FaqScreen({ items = [], error = false }: { items?: PublicFaqItem[]; error?: boolean }) {
  const t = useTranslations("PublicFaq");
  const slots = landingFaqSectionStyles();

  return (
    <>
      <PublicSiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-10 sm:py-20" dir="rtl">
        <header className="mb-10 text-center">
          <Typography type="h1" weight="bold">{t("title")}</Typography>
          <Typography className="mt-3 text-muted" type="body">
            <TextWithBrand>{t("subtitle")}</TextWithBrand>
          </Typography>
        </header>
        {error ? (
          <div className="rounded-(--radius-card-lg) border border-danger/30 bg-danger/10 p-8 text-center" role="alert">
            <p>{t("loadError")}</p>
            <Button className="mt-5" onPress={() => window.location.reload()}>{t("retry")}</Button>
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-(--radius-card-lg) bg-surface-secondary p-8 text-center text-muted">{t("empty")}</p>
        ) : (
          <Accordion aria-label={t("title")} className={slots.list()} hideSeparator>
            {items.map((item, index) => (
              <Accordion.Item className={slots.item()} id={item.id} key={item.id}>
                <Accordion.Heading>
                  <Accordion.Trigger className={slots.trigger()}>
                    <span className={slots.heading()}>
                      <span className={slots.question()}>{item.question}</span>
                      <span className={slots.number()}>{new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2, useGrouping: false }).format(index + 1)}</span>
                    </span>
                    <Plus aria-hidden className={slots.plus()} size={24} />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel><Accordion.Body className={slots.body()}>{item.answer}</Accordion.Body></Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </main>
      <PublicSiteFooter />
    </>
  );
}
