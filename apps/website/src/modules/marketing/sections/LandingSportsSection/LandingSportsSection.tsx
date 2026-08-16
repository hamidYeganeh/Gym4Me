"use client";

import { Button, Typography } from "@heroui/react";
import { Archery } from "@repo/icons/Archery";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Basketball } from "@repo/icons/Basketball";
import { Boxing } from "@repo/icons/Boxing";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { JumpingRope } from "@repo/icons/JumpingRope";
import { Kettlebell } from "@repo/icons/Kettlebell";
import { PersonKarate } from "@repo/icons/PersonKarate";
import { PersonRunning } from "@repo/icons/PersonRunning";
import { PersonSwimming } from "@repo/icons/PersonSwimming";
import { PersonYoga } from "@repo/icons/PersonYoga";
import { Soccer } from "@repo/icons/Soccer";
import { Tennis } from "@repo/icons/Tennis";
import { SportCard } from "@repo/ui/cards/SportCard";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  LANDING_ASSETS,
  LANDING_SPORT_THEMES,
} from "../../lib/landing-assets";
import { LANDING_EASE_LOOP, landingReveal } from "../../lib/landing-motion";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingSportsSectionStyles } from "./LandingSportsSection.styles";
import type {
  LandingSportTile,
  LandingSportsSectionProps,
} from "./LandingSportsSection.types";

const SPORT_DEFS: LandingSportTile[] = [
  {
    id: "football",
    name: "فوتبال",
    subtitle: "ورزش‌های توپی",
    icon: Soccer,
    image: LANDING_ASSETS.collection[1].src,
  },
  {
    id: "bodybuilding",
    name: "بدنسازی",
    subtitle: "آمادگی جسمانی",
    icon: BarbellHorizontal,
    image: LANDING_ASSETS.facilities.clay,
  },
  {
    id: "yoga",
    name: "یوگا",
    subtitle: "آمادگی جسمانی",
    icon: PersonYoga,
    image: LANDING_ASSETS.collection[2].src,
  },
  {
    id: "crossfit",
    name: "کراس‌فیت",
    subtitle: "آمادگی جسمانی",
    icon: JumpingRope,
    image: LANDING_ASSETS.collection[0].src,
  },
  {
    id: "swimming",
    name: "شنا",
    subtitle: "آبی",
    icon: PersonSwimming,
    image: LANDING_ASSETS.facilities.harbor,
  },
  {
    id: "boxing",
    name: "بوکس",
    subtitle: "رزمی",
    icon: Boxing,
    image: LANDING_ASSETS.hero,
  },
  {
    id: "running",
    name: "دویدن",
    subtitle: "هوازی",
    icon: PersonRunning,
    image: LANDING_ASSETS.collection[1].src,
  },
  {
    id: "basketball",
    name: "بسکتبال",
    subtitle: "ورزش‌های توپی",
    icon: Basketball,
    image: LANDING_ASSETS.facilities.intro,
  },
  {
    id: "tennis",
    name: "تنیس",
    subtitle: "راکت",
    icon: Tennis,
    image: LANDING_ASSETS.collection[2].src,
  },
  {
    id: "functional",
    name: "فانکشنال",
    subtitle: "آمادگی جسمانی",
    icon: Kettlebell,
    image: LANDING_ASSETS.facilities.clay,
  },
  {
    id: "martial-arts",
    name: "رزمی",
    subtitle: "رزمی",
    icon: PersonKarate,
    image: LANDING_ASSETS.hero,
  },
  {
    id: "cardio",
    name: "قلبی",
    subtitle: "هوازی",
    icon: HeartEcg,
    image: LANDING_ASSETS.facilities.harbor,
  },
  {
    id: "archery",
    name: "تیراندازی",
    subtitle: "دقت",
    icon: Archery,
    image: LANDING_ASSETS.collection[0].src,
  },
];

const SPORT_ROW_1 = SPORT_DEFS.slice(0, 7);
const SPORT_ROW_2 = SPORT_DEFS.slice(6);

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: landingReveal(delay),
  }),
};

function SportTileCard({
  tile,
  themeIndex,
}: {
  tile: LandingSportTile;
  themeIndex: number;
}) {
  const slots = landingSportsSectionStyles();
  const theme =
    LANDING_SPORT_THEMES[themeIndex % LANDING_SPORT_THEMES.length]!;
  const Icon = tile.icon;

  return (
    <SportCard
      actionColor={theme.actionColor}
      actionForegroundColor={theme.actionForegroundColor}
      actionLabel={`مشاهده ${tile.name}`}
      className={slots.card()}
      color={theme.color}
      foregroundColor={theme.foregroundColor}
      size="sm"
      sport={{
        title: tile.name,
        subtitle: tile.subtitle,
        backgroundImage: tile.image,
        icon: <Icon />,
      }}
    />
  );
}

function MarqueeRow({
  tiles,
  direction,
  delay,
  themeOffset,
}: {
  tiles: LandingSportTile[];
  direction: "left" | "right";
  delay: number;
  themeOffset: number;
}) {
  const slots = landingSportsSectionStyles();
  const reduceMotion = useReducedMotion() ?? false;
  const loop = [...tiles, ...tiles];

  return (
    <motion.div
      className={slots.row()}
      custom={delay}
      initial="hidden"
      variants={fadeUpVariants}
      viewport={{ once: true, amount: 0.35 }}
      whileInView="visible"
    >
      <div aria-hidden className={slots.fadeStart()} />
      <div aria-hidden className={slots.fadeEnd()} />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : direction === "left"
              ? { x: ["0%", "-50%"] }
              : { x: ["-50%", "0%"] }
        }
        className={slots.track()}
        transition={{
          x: { duration: 42, repeat: Infinity, ease: LANDING_EASE_LOOP },
        }}
      >
        {loop.map((tile, index) => (
          <SportTileCard
            key={`${tile.id}-${index}`}
            themeIndex={index + themeOffset}
            tile={tile}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function LandingSportsSection({ className }: LandingSportsSectionProps) {
  const slots = landingSportsSectionStyles();
  const { scrollTo } = useLandingScroll();

  return (
    <section
      className={slots.root({ className })}
      dir="rtl"
      id="sports"
      lang="fa"
    >
      <div className={slots.headingWrap()}>
        <motion.div
          custom={0.1}
          initial="hidden"
          variants={fadeUpVariants}
          viewport={{ once: true, amount: 0.6 }}
          whileInView="visible"
        >
          <Typography className={slots.title()} type="h2" weight="medium">
            رشته‌هایی که در اپ
            <br />
            کشف می‌کنی
          </Typography>
          <Typography className={slots.hint()} type="body">
            از وزنه و دویدن تا یوگا و شنا. باشگاه و مربی مناسب هر رشته را در
            Gym4Me پیدا کن.
          </Typography>
        </motion.div>

        <motion.div
          className={slots.ctaWrap()}
          custom={0.2}
          initial="hidden"
          variants={fadeUpVariants}
          viewport={{ once: true, amount: 0.6 }}
          whileInView="visible"
        >
          <Button
            className={slots.cta()}
            size="lg"
            onPress={() => scrollTo("#clubs")}
          >
            مشاهده باشگاه‌ها
          </Button>
        </motion.div>
      </div>

      <div aria-hidden className={slots.marquee()}>
        <MarqueeRow
          delay={0.3}
          direction="left"
          themeOffset={0}
          tiles={SPORT_ROW_1}
        />
        <MarqueeRow
          delay={0.4}
          direction="right"
          themeOffset={2}
          tiles={SPORT_ROW_2}
        />
      </div>
    </section>
  );
}
