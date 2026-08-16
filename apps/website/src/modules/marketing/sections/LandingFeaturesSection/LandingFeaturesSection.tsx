"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { Check } from "@repo/icons/Check";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { LANDING_ASSETS, LANDING_CLUBS } from "../../lib/landing-assets";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingFeaturesSectionStyles } from "./LandingFeaturesSection.styles";
import type {
  LandingFeaturesCheckItem,
  LandingFeaturesSectionProps,
} from "./LandingFeaturesSection.types";

const CHECK_ITEMS: LandingFeaturesCheckItem[] = [
  { label: "کشف باشگاه و مربی روی نقشه و لیست" },
  { label: "رزرو کلاس، جلسه و تمدید عضویت از یک اپ" },
  { label: "پرداخت، حضور و یادآوری بدون پیگیری دستی" },
];

const MOCKUP_CLUB = LANDING_CLUBS[1]!;

function CheckRow({
  item,
  iconClassName,
  rowClassName,
  labelClassName,
}: {
  item: LandingFeaturesCheckItem;
  iconClassName: string;
  rowClassName: string;
  labelClassName: string;
}) {
  return (
    <div className={rowClassName}>
      <Check size={18} className={iconClassName} aria-hidden />
      <span className={labelClassName}>{item.label}</span>
    </div>
  );
}

export function LandingFeaturesSection({
  className,
}: LandingFeaturesSectionProps) {
  const slots = landingFeaturesSectionStyles();
  const { scrollTo } = useLandingScroll();
  const quoteAuthor = LANDING_ASSETS.coaches[1]!;
  const portrait = LANDING_ASSETS.coaches[0]!;

  return (
    <section
      id="features"
      className={slots.root({ className })}
      dir="rtl"
      lang="fa"
    >
      <div className={slots.inner()}>
        <div className={slots.bento()}>
          <div className={slots.heroCard()}>
            <img
              src={LANDING_ASSETS.hero}
              alt="فضای باشگاه در Gym4Me"
              className={slots.heroImg()}
              loading="lazy"
            />
            <div className={slots.mockup()}>
              <div className={slots.chrome()} aria-hidden>
                <span className={slots.trafficClose()} />
                <span className={slots.trafficMin()} />
                <span className={slots.trafficMax()} />
              </div>
              <div className={slots.mockupStage()}>
                <ClubCard
                  actionLabel="مشاهده"
                  className={slots.mockupClub()}
                  features={[...MOCKUP_CLUB.features]}
                  image={MOCKUP_CLUB.image}
                  imageAlt={MOCKUP_CLUB.title}
                  onAction={() => scrollTo("#clubs")}
                  orientation="vertical"
                  price={MOCKUP_CLUB.price}
                  pricePrefix="از"
                  priceSuffix="تومان"
                  rating={MOCKUP_CLUB.rating}
                  ratingCount={MOCKUP_CLUB.ratingCount}
                  subtitle={MOCKUP_CLUB.subtitle}
                  title={MOCKUP_CLUB.title}
                />
              </div>
            </div>
          </div>

          <blockquote className={slots.quoteCard()}>
            <Typography className={slots.quote()} type="body" weight="medium">
              Gym4Me همان مسیری را می‌بندد که در باشگاه هر روز تکرار می‌شود:
              پیدا کردن سالن، رزرو زمان، پرداخت و برگشتن برای جلسه بعد.
            </Typography>
            <footer className={slots.authorRow()}>
              <img
                src={quoteAuthor.src}
                alt={quoteAuthor.name}
                className={slots.avatar()}
                loading="lazy"
              />
              <div>
                <Typography
                  className={slots.authorName()}
                  type="body-sm"
                  weight="semibold"
                >
                  {quoteAuthor.name}
                </Typography>
                <Typography className={slots.authorRole()} type="body-xs">
                  {quoteAuthor.role}
                </Typography>
              </div>
            </footer>
          </blockquote>

          <div className={slots.portraitCard()}>
            <img
              src={portrait.src}
              alt={portrait.alt}
              className={slots.portraitImg()}
              loading="lazy"
            />
          </div>
        </div>

        <div className={slots.content()}>
          <Typography className={slots.heading()} type="h2" weight="medium">
            کشف باشگاه.
            <br />
            رزرو جلسه.
            <br />
            تمدید عضویت.
          </Typography>
          <Typography className={slots.body()} type="body">
            یک اپ برای ورزشکار، مربی و مدیر باشگاه. نقش فعال همان چیزی است که
            مجوز می‌دهد، نه لیست نقش‌ها.
          </Typography>
          <div className={slots.actions()}>
            <Button
              className={slots.primaryBtn()}
              onPress={() => scrollTo("#download")}
              size="lg"
              variant="primary"
            >
              دانلود اپ
              <span className={slots.primaryChip()} aria-hidden>
                <ArrowRight size={18} />
              </span>
            </Button>
            <Button
              className={slots.secondaryBtn()}
              onPress={() => scrollTo("#clubs")}
              size="lg"
              variant="secondary"
            >
              تماشای باشگاه‌ها
            </Button>
          </div>
          <div className={slots.checklist()}>
            {CHECK_ITEMS.map((item) => (
              <CheckRow
                key={item.label}
                item={item}
                iconClassName={slots.checkIcon()}
                rowClassName={slots.checkRow()}
                labelClassName={slots.checkLabel()}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
