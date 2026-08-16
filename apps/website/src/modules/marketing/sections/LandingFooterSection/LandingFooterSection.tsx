"use client";

import { BrandMark, LandingPillButton } from "../../lib/landing-controls";
import { LandingEyebrow } from "../../lib/landing-ui";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingFooterSectionStyles } from "./LandingFooterSection.styles";
import type { LandingFooterSectionProps } from "./LandingFooterSection.types";

const COLS = [
  {
    title: "کشف",
    links: [
      { label: "ورزش‌ها", href: "#sports" },
      { label: "باشگاه‌ها", href: "#clubs" },
      { label: "مربی‌ها", href: "#coaches" },
      { label: "کلاس‌ها", href: "#classes" },
    ],
  },
  {
    title: "اپ",
    links: [
      { label: "دانلود", href: "#download" },
      { label: "ویژگی‌ها", href: "#features" },
      { label: "مقالات", href: "#articles" },
    ],
  },
  {
    title: "پشتیبانی",
    links: [
      { label: "سؤالات متداول", href: "#faq" },
      { label: "درباره", href: "#about" },
      { label: "نظر اعضا", href: "#testimonials" },
      { label: "تماس", href: "#contact" },
    ],
  },
] as const;

export function LandingFooterSection({ className }: LandingFooterSectionProps) {
  const slots = landingFooterSectionStyles();
  const { openContact, scrollTo } = useLandingScroll();

  return (
    <footer id="contact" className={slots.root({ className })}>
      <div className={slots.ctaBand()}>
        <div>
          <LandingEyebrow tone="light">شروع کن</LandingEyebrow>
          <ClipReveal
            as="p"
            mode="lines"
            text={"آماده‌ای\nرزرو کنی؟"}
            className={slots.ctaTitle()}
          />
        </div>
        <InViewRise delayIn={150} fromY={20}>
          <LandingPillButton
            variant="light"
            onPress={() => scrollTo("#download")}
          >
            دانلود اپ
          </LandingPillButton>
        </InViewRise>
      </div>

      <div className={slots.columns()}>
        <div className={slots.brandCol()}>
          <div className={slots.brandRow()}>
            <BrandMark size={22} instanceId="footer-brand" />
            <span>Gym4Me</span>
          </div>
          <p className={slots.blurb()}>
            اپ کشف باشگاه، مربی و کلاس در ایران. رزرو، پرداخت و تمدید عضویت در
            یک مسیر.
          </p>
          <address className={slots.address()}>
            <a href="mailto:hello@gym4me.app">hello@gym4me.app</a>
            <br />
            <a href="tel:+982100000000">۰۲۱-۰۰۰۰۰۰۰۰</a>
            <br />
            <span className={slots.addrMuted()}>تهران، ایران</span>
          </address>
        </div>

        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className={slots.colTitle()}>{col.title}</p>
            <ul className={slots.colList()}>
              {col.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      if (link.href === "#contact") {
                        openContact();
                        return;
                      }
                      scrollTo(link.href);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={slots.bottom()}>
        <p>© ۲۰۲۶ Gym4Me. همه حقوق محفوظ است.</p>
        <nav className={slots.social()} aria-label="شبکه‌های اجتماعی">
          <a href="#instagram">اینستاگرام</a>
          <a href="#x">X</a>
          <a href="#youtube">یوتیوب</a>
          <a href="#linkedin">لینکدین</a>
        </nav>
        <nav className={slots.legal()} aria-label="قوانین">
          <a href="#privacy">حریم خصوصی</a>
          <a href="#terms">شرایط</a>
        </nav>
      </div>
    </footer>
  );
}
