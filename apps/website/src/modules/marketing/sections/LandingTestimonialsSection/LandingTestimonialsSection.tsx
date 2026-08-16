"use client";

import { Typography } from "@heroui/react";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { LANDING_REVIEWS } from "../../lib/landing-assets";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { landingTestimonialsSectionStyles } from "./LandingTestimonialsSection.styles";
import type { LandingTestimonialsSectionProps } from "./LandingTestimonialsSection.types";

export function LandingTestimonialsSection({
  className,
}: LandingTestimonialsSectionProps) {
  const slots = landingTestimonialsSectionStyles();

  return (
    <section
      id="testimonials"
      className={slots.root({ className })}
      dir="rtl"
      lang="fa"
    >
      <header className={slots.header()}>
        <ClipReveal
          as="h2"
          className={slots.title()}
          mode="lines"
          text={"نظر اعضا بعد از\nرزرو واقعی"}
        />
        <Typography className={slots.hint()} type="body">
          همان کارت نظری که روی صفحه باشگاه و مربی در اپ می‌بینی.
        </Typography>
      </header>

      <div className={slots.grid()}>
        {LANDING_REVIEWS.map((review, index) => (
          <InViewRise delayIn={index * 90} fromY={24} key={review.title}>
            <ReviewCard
              avatar={review.avatarSrc}
              avatarAlt={review.authorName}
              avatarFallback={review.authorName.slice(0, 1)}
              className={slots.card()}
              content={review.content}
              date={review.date}
              dislikeLabel="نپسندیدم"
              isVerified
              likeLabel="پسندیدم"
              rating={review.rating}
              reportLabel="گزارش"
              title={review.title}
              verifiedLabel="نظر تأییدشده"
            />
          </InViewRise>
        ))}
      </div>
    </section>
  );
}
