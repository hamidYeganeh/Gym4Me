"use client";

import { Accordion, Typography } from "@heroui/react";
import { Plus } from "@repo/icons/Plus";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { landingReveal } from "../../lib/landing-motion";
import { landingFaqSectionStyles } from "./LandingFaqSection.styles";
import type {
  LandingFaqItem,
  LandingFaqSectionProps,
} from "./LandingFaqSection.types";

export function LandingFaqSection({ className }: LandingFaqSectionProps) {
  const t = useTranslations("MarketingLanding.landingFaq");
  const slots = landingFaqSectionStyles();
  const faqItems = t.raw("items") as LandingFaqItem[];

  return (
    <section
      className={slots.root({ className })}
      dir="rtl"
      id="faq"
      lang="fa"
    >
      <div className={slots.inner()}>
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          transition={landingReveal(0.1)}
          viewport={{ once: true, margin: "-100px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Typography className={slots.title()} type="h2" weight="semibold">
            {t("title")}
          </Typography>
        </motion.div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={landingReveal(0.2)}
          viewport={{ once: true, margin: "-50px" }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
        >
          <Accordion className={slots.list()} hideSeparator>
            {faqItems.map((item) => (
              <Accordion.Item className={slots.item()} id={item.id} key={item.id}>
                <Accordion.Heading>
                  <Accordion.Trigger className={slots.trigger()}>
                    <span className={slots.heading()}>
                      <span className={slots.question()}>{item.question}</span>
                      <span className={slots.number()}>{item.number}</span>
                    </span>
                    <Plus aria-hidden className={slots.plus()} size={24} />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className={slots.body()}>
                    {item.answer}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
