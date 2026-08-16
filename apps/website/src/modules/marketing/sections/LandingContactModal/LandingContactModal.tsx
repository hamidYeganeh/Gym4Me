"use client";

import { Check } from "@repo/icons";
import { useEffect, useRef, useState } from "react";
import { CloseIconButton, LandingPillButton } from "../../lib/landing-controls";
import { ClipReveal } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { LandingEyebrow } from "../../lib/landing-ui";
import { cn } from "../../lib/marketing-cn";
import { landingContactModalStyles } from "./LandingContactModal.styles";
import type { LandingContactModalProps } from "./LandingContactModal.types";

export function LandingContactModal({ className }: LandingContactModalProps) {
  const slots = landingContactModalStyles();
  const { contactOpen, closeContact } = useLandingScroll();
  const nameRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    if (!contactOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContact();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => nameRef.current?.focus(), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [contactOpen, closeContact]);

  useEffect(() => {
    if (contactOpen) return;
    const t = window.setTimeout(() => {
      setSending(false);
      setSuccess(false);
      setFirstName("");
    }, 300);
    return () => window.clearTimeout(t);
  }, [contactOpen]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    setFirstName(name.split(/\s+/)[0] || "");
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSuccess(true);
    }, 700);
  };

  return (
    <div
      className={cn(
        slots.root({ className }),
        !contactOpen && "pointer-events-none",
      )}
      aria-hidden={!contactOpen}
    >
      <button
        type="button"
        className={slots.backdrop()}
        style={{ opacity: contactOpen ? 1 : 0 }}
        aria-label="بستن"
        onClick={closeContact}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className={slots.panel()}
        style={{
          opacity: contactOpen ? 1 : 0,
          transform: contactOpen
            ? "translateY(0) scale(1)"
            : "translateY(28px) scale(0.96)",
        }}
      >
        <div className={slots.header()}>
          <div>
            <LandingEyebrow>باشگاه تو</LandingEyebrow>
            <ClipReveal
              id="contact-modal-title"
              as="h2"
              mode="lines"
              text={"باشگاهت را\nدر اپ ثبت کن"}
              className={slots.title()}
              active={contactOpen && !success}
              stagger={90}
            />
          </div>
          <CloseIconButton onPress={closeContact} tone="dark" />
        </div>

        {success ? (
          <div className={slots.success()}>
            <div className={slots.check()}>
              <Check size={22} className="text-accent-foreground" aria-hidden />
            </div>
            <p className={slots.successTitle()}>درخواست دریافت شد</p>
            <p className={slots.successBody()}>
              ممنون {firstName || "دوست عزیز"}. تیم Gym4Me برای ثبت باشگاه یا
              مربی با تو تماس می‌گیرد.
            </p>
            <LandingPillButton variant="solid" onPress={closeContact}>
              تمام
            </LandingPillButton>
          </div>
        ) : (
          <form className={slots.form()} noValidate onSubmit={onSubmit}>
            <label className={slots.field()}>
              <span className={slots.label()}>نام کامل</span>
              <input
                ref={nameRef}
                name="name"
                type="text"
                placeholder="علی رضایی"
                className={slots.input()}
                required
              />
            </label>
            <label className={slots.field()}>
              <span className={slots.label()}>ایمیل</span>
              <input
                name="email"
                type="email"
                placeholder="you@email.com"
                className={slots.input()}
                required
                dir="ltr"
              />
            </label>
            <label className={slots.field()}>
              <span className={slots.label()}>چه کمکی از اپ می‌خواهی؟</span>
              <textarea
                name="note"
                rows={3}
                placeholder="می‌خواهم باشگاهم را در Gym4Me ثبت کنم…"
                className={slots.input()}
              />
            </label>
            <button
              type="submit"
              disabled={sending}
              className={slots.submit()}
            >
              {sending ? "در حال ارسال…" : "ارسال درخواست"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
