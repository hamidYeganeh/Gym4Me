"use client";

import { useEffect } from "react";
import {
  BrandMark,
  CloseIconButton,
  LandingPillButton,
} from "../../lib/landing-controls";
import { InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { cn } from "../../lib/marketing-cn";
import { landingMenuOverlayStyles } from "./LandingMenuOverlay.styles";
import type { LandingMenuOverlayProps } from "./LandingMenuOverlay.types";

const LINKS = [
  { label: "ورزش‌ها", href: "#sports" },
  { label: "باشگاه‌ها", href: "#clubs" },
  { label: "مربی‌ها", href: "#coaches" },
  { label: "کلاس‌ها", href: "#classes" },
  { label: "دانلود", href: "#download" },
  { label: "سؤالات متداول", href: "#faq" },
  { label: "تماس", href: "#contact" },
] as const;

export function LandingMenuOverlay({ className }: LandingMenuOverlayProps) {
  const slots = landingMenuOverlayStyles();
  const { menuOpen, closeMenu, scrollTo } = useLandingScroll();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <div
      className={cn(slots.root({ className }), !menuOpen && "pointer-events-none")}
      aria-hidden={!menuOpen}
    >
      <button
        type="button"
        className={slots.backdrop()}
        style={{ opacity: menuOpen ? 1 : 0 }}
        aria-label="بستن منو"
        onClick={closeMenu}
      />
      <div
        className={slots.panel()}
        style={{
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? "translateY(0)" : "translateY(-24px)",
        }}
      >
        <div className={slots.top()}>
          <div className={slots.brand()}>
            <BrandMark size={20} instanceId="menu-brand" />
            <span>Gym4Me</span>
          </div>
          <CloseIconButton onPress={closeMenu} tone="light" />
        </div>

        <nav className={slots.nav()} aria-label="منوی تمام‌صفحه">
          {LINKS.map((link, i) => (
            <InViewRise key={link.href} delayIn={menuOpen ? 120 + i * 70 : 0} fromY={28}>
              <a
                href={link.href}
                className={slots.link()}
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu();
                  window.setTimeout(() => scrollTo(link.href), 50);
                }}
              >
                {link.label}
              </a>
            </InViewRise>
          ))}
        </nav>

        <div className={slots.bottom()}>
          <LandingPillButton
            variant="light"
            onPress={() => {
              closeMenu();
              window.setTimeout(() => scrollTo("#download"), 120);
            }}
          >
            دانلود اپ
          </LandingPillButton>
          <nav className={slots.social()} aria-label="شبکه‌ها">
            <a href="#instagram">اینستاگرام</a>
            <a href="#x">X</a>
            <a href="#youtube">یوتیوب</a>
            <a href="#linkedin">لینکدین</a>
          </nav>
        </div>
      </div>
    </div>
  );
}
