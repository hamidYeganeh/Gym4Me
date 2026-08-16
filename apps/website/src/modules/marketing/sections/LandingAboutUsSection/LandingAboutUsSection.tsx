"use client";

import { Avatar, Button, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { StarFull } from "@repo/icons/StarFull";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_ASSETS } from "../../lib/landing-assets";
import { landingReveal } from "../../lib/landing-motion";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingAboutUsSectionStyles } from "./LandingAboutUsSection.styles";
import type {
  LandingAboutUsReviewer,
  LandingAboutUsSectionProps,
} from "./LandingAboutUsSection.types";

const COPY = {
  label: "اپ Gym4Me",
  title: "باشگاه، مربی و کلاس را در یک مسیر پیدا کن و رزرو کن.",
  statValue: "۳",
  statLineOne: "نقش",
  statLineTwo: "در یک اپ",
  paragraphs: [
    "ورزشکار باشگاه نزدیک را کشف می‌کند، مربی جلسه خصوصی می‌بندد و مدیر باشگاه عضویت و ظرفیت را می‌بیند.",
    "پرداخت، حضور و تمدید همان حلقه‌ای است که محصول برای بازار ایران طراحی شده: نقشه، پیامک، و تقویم شمسی.",
  ],
  cta: "دانلود اپ",
} as const;

const PORTRAITS = {
  start: {
    src: LANDING_ASSETS.coaches[0].src,
    alt: LANDING_ASSETS.coaches[0].alt,
  },
  end: {
    src: LANDING_ASSETS.facilities.clay,
    alt: "سالن وزنه و فضای تمرین باشگاه",
  },
} as const;

const REVIEWERS: LandingAboutUsReviewer[] = LANDING_ASSETS.coaches.map(
  (coach) => ({
    src: coach.src,
    alt: coach.name,
    fallback: coach.name.slice(0, 1),
  }),
);

export function LandingAboutUsSection({
  className,
}: LandingAboutUsSectionProps) {
  const slots = landingAboutUsSectionStyles();
  const reduce = useReducedMotion();
  const { scrollTo } = useLandingScroll();

  return (
    <section
      id="about"
      className={slots.root({ className })}
      dir="rtl"
      lang="fa"
    >
      <motion.div
        className={slots.inner()}
        initial={reduce ? false : { opacity: 0, y: 20 }}
        transition={landingReveal()}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <header className={slots.header()}>
          <motion.div
            className={slots.labelRow()}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            transition={landingReveal(0.2)}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <span aria-hidden className={slots.labelChip()}>
              <BarbellHorizontal size={14} />
            </span>
            <Typography className={slots.label()} type="body-xs">
              {COPY.label}
            </Typography>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            transition={landingReveal(0.3)}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Typography className={slots.title()} type="h2" weight="bold">
              {COPY.title}
            </Typography>
          </motion.div>
        </header>

        <div className={slots.columns()}>
          <motion.div
            className={slots.startCol()}
            initial={reduce ? false : { opacity: 0, x: 30 }}
            transition={landingReveal(0.4)}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <img
              alt={PORTRAITS.start.alt}
              className={slots.startImage()}
              src={PORTRAITS.start.src}
            />
          </motion.div>

          <motion.div
            className={slots.middleCol()}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            transition={landingReveal(0.5)}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className={slots.statRow()}>
              <span className={slots.statValue()}>{COPY.statValue}</span>
              <div className={slots.statMeta()}>
                <span className={slots.statLine()}>{COPY.statLineOne}</span>
                <span className={slots.statLine()}>{COPY.statLineTwo}</span>
              </div>
            </div>

            <div className={slots.divider()} />

            <div className={slots.copy()}>
              {COPY.paragraphs.map((text) => (
                <Typography
                  className={slots.paragraph()}
                  key={text}
                  type="body"
                >
                  {text}
                </Typography>
              ))}
            </div>

            <div className={slots.ctaRow()}>
              <Button
                className={slots.cta()}
                onPress={() => scrollTo("#download")}
              >
                <span className={slots.ctaLabel()}>{COPY.cta}</span>
                <span aria-hidden className={slots.ctaChip()}>
                  <ArrowRight size={16} />
                </span>
              </Button>

              <div className={slots.reviews()}>
                <div className={slots.avatars()}>
                  {REVIEWERS.map((reviewer, index) => (
                    <Avatar
                      className={slots.avatar({
                        className:
                          index > 0 ? slots.avatarOverlap() : undefined,
                      })}
                      key={reviewer.src}
                    >
                      <Avatar.Image alt={reviewer.alt} src={reviewer.src} />
                      <Avatar.Fallback>{reviewer.fallback}</Avatar.Fallback>
                    </Avatar>
                  ))}
                </div>
                <div className={slots.reviewMeta()}>
                  <span
                    aria-label="۵ از ۵"
                    className={slots.stars()}
                    role="img"
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <StarFull aria-hidden key={index} size={15} />
                    ))}
                  </span>
                  <Typography className={slots.reviewCount()} type="body-xs">
                    نظرهای داخل اپ
                  </Typography>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={slots.endCol()}
            initial={reduce ? false : { opacity: 0, x: -30 }}
            transition={landingReveal(0.6)}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <img
              alt={PORTRAITS.end.alt}
              className={slots.endImage()}
              src={PORTRAITS.end.src}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
