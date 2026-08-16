"use client";

import { Accordion, Typography } from "@heroui/react";
import { Plus } from "@repo/icons/Plus";
import { motion } from "framer-motion";
import { landingReveal } from "../../lib/landing-motion";
import { landingFaqSectionStyles } from "./LandingFaqSection.styles";
import type {
  LandingFaqItem,
  LandingFaqSectionProps,
} from "./LandingFaqSection.types";

const FAQ_ITEMS: LandingFaqItem[] = [
  {
    id: "signup",
    number: "{۰۱}",
    question: "چطور در Gym4Me ثبت‌نام کنم؟",
    answer:
      "شماره موبایل خود را وارد کنید، کد تأیید پیامکی را بزنید و پروفایل‌تان را کامل کنید. همان مسیر ورود در اپ موبایل.",
  },
  {
    id: "find-club",
    number: "{۰۲}",
    question: "چطور باشگاه نزدیکم را پیدا کنم؟",
    answer:
      "در کشف، باشگاه‌ها را روی نقشه یا لیست ببینید، بر اساس رشته و محله فیلتر کنید و جزئیات سالن، مربی و ظرفیت را باز کنید.",
  },
  {
    id: "book",
    number: "{۰۳}",
    question: "چطور جلسه یا کلاس رزرو کنم؟",
    answer:
      "باشگاه یا کلاس را انتخاب کنید، زمان خالی را بزنید و پرداخت را تمام کنید. رزرو در تقویم شما ثبت می‌شود و قبل از جلسه یادآوری می‌گیرید.",
  },
  {
    id: "membership",
    number: "{۰۴}",
    question: "عضویت باشگاه چطور تمدید می‌شود؟",
    answer:
      "از پروفایل یا صفحهٔ باشگاه، دورهٔ فعال را ببینید و تمدید کنید. پرداخت عضویت جدا از اشتراک پلتفرم است و موجودی کیف‌پول بعد از تسویه به‌روز می‌شود.",
  },
];

export function LandingFaqSection({ className }: LandingFaqSectionProps) {
  const slots = landingFaqSectionStyles();

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
            سؤالات متداول
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
            {FAQ_ITEMS.map((item) => (
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
