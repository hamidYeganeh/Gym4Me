"use client";

import { ClubLocationCard } from "@repo/ui/cards/ClubLocationCard";
import type { ClubLocationLatLng } from "@repo/ui/cards/ClubLocationCard";

/** Sample run around Laleh Park / Keshavarz Blvd, Tehran. */
const TEHRAN_DEMO_ROUTE: ClubLocationLatLng[] = [
  { lat: 35.7089, lng: 51.3912 },
  { lat: 35.7118, lng: 51.3948 },
  { lat: 35.7142, lng: 51.3915 },
  { lat: 35.7176, lng: 51.3962 },
  { lat: 35.7201, lng: 51.3924 },
  { lat: 35.7228, lng: 51.3981 },
  { lat: 35.7254, lng: 51.3945 },
];

type ClubLocationCardDemoProps = {
  title: string;
  duration: string;
  calories: string;
  distanceLabel: string;
  startLabel: string;
  endLabel: string;
  actionLabel: string;
};

export function ClubLocationCardDemo({
  title,
  duration,
  calories,
  distanceLabel,
  startLabel,
  endLabel,
  actionLabel,
}: ClubLocationCardDemoProps) {
  return (
    <ClubLocationCard
      actionLabel={actionLabel}
      calories={calories}
      distanceLabel={distanceLabel}
      duration={duration}
      endLabel={endLabel}
      route={TEHRAN_DEMO_ROUTE}
      startLabel={startLabel}
      title={title}
    />
  );
}
