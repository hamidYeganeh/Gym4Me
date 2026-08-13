"use client";

import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { MapPin1 } from "@repo/icons";
import { MediaImage } from "@repo/ui/common/MediaImage";
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
    <article
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-black text-white",
        className,
      )}
    >
      <MediaImage
        alt={club.imageAlt ?? club.title}
        className="pointer-events-none absolute inset-0 size-full object-cover select-none"
        image={club.imageSrc}
        sizes="320px"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-linear-to-t from-black/85 from-10% via-black/50 via-50% to-transparent"
      />
      <div className="relative z-10 mt-auto flex flex-col justify-end gap-2 px-5 pt-16 pb-5">
        <p className="text-[1.375rem] leading-snug font-bold tracking-tight text-balance">
          {club.title}
        </p>
        <p className="flex items-center gap-1.5 text-sm leading-none text-white/80">
          <MapPin1 aria-hidden className="size-3.5 shrink-0" size={14} />
          <span>{club.label}</span>
        </p>
      </div>
    </article>
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
