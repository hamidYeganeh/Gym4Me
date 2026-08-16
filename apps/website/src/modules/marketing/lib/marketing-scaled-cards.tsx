"use client";

import { ClubCard } from "@repo/ui/cards/ClubCard";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import {
  CLUB_CARD_HEIGHT,
  CLUB_CARD_WIDTH,
  COACH_CARD_HEIGHT,
  COACH_CARD_WIDTH,
} from "./marketing-home-data";
import { cn } from "./marketing-cn";

export type MarketingClubPosterData = {
  title: string;
  label: string;
  imageSrc: string;
  imageAlt?: string;
  rating?: number;
  ratingCount?: number;
  price?: string;
  features?: { label: string }[];
};

export type MarketingCoachPosterData = {
  name: string;
  specialty: string;
  imageSrc: string;
  imageAlt?: string;
  rating: number;
  reviewCount: number;
  yearsOfExperience: number;
  isCertified?: boolean;
  certifiedLabel?: string;
  experienceLabel?: string;
  isNew?: boolean;
  badgeLabel?: string;
};

export function MarketingClubPoster({
  club,
  className,
}: {
  club: MarketingClubPosterData;
  className?: string;
}) {
  return (
    <ClubCard
      actionLabel="مشاهده"
      className={cn("h-full w-full max-w-none", className)}
      features={club.features}
      image={club.imageSrc}
      imageAlt={club.imageAlt ?? club.title}
      orientation="vertical"
      price={club.price}
      pricePrefix={club.price ? "از" : undefined}
      priceSuffix={club.price ? "تومان" : undefined}
      rating={club.rating}
      ratingCount={club.ratingCount}
      subtitle={club.label}
      title={club.title}
    />
  );
}

export function ScaledClubCard({
  club,
  scale,
  className,
}: {
  club: MarketingClubPosterData;
  scale: number;
  className?: string;
}) {
  return (
    <div
      className={cn("pointer-events-auto relative shrink-0 overflow-hidden", className)}
      style={{
        width: CLUB_CARD_WIDTH * scale,
        height: CLUB_CARD_HEIGHT * scale,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: CLUB_CARD_WIDTH,
          height: CLUB_CARD_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        <MarketingClubPoster club={club} />
      </div>
    </div>
  );
}

export function ScaledCoachCard({
  coach,
  scale,
  className,
}: {
  coach: MarketingCoachPosterData;
  scale: number;
  className?: string;
}) {
  const experienceText = (coach.experienceLabel ?? "{years} سال سابقه").replace(
    "{years}",
    String(coach.yearsOfExperience),
  );

  return (
    <div
      className={cn("pointer-events-auto relative shrink-0 overflow-hidden", className)}
      style={{
        width: COACH_CARD_WIDTH * scale,
        height: COACH_CARD_HEIGHT * scale,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: COACH_CARD_WIDTH,
          height: COACH_CARD_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        <CoachFeatureCard
          certifiedLabel={coach.isCertified ? coach.certifiedLabel : undefined}
          experienceLabel={experienceText}
          image={coach.imageSrc}
          imageAlt={coach.imageAlt ?? coach.name}
          isNew={coach.isNew}
          newLabel={coach.badgeLabel}
          rating={coach.rating}
          ratingCount={coach.reviewCount}
          specialty={coach.specialty}
          title={coach.name}
        />
      </div>
    </div>
  );
}
