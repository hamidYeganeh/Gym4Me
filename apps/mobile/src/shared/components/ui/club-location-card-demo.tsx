"use client";

import { ClubLocationCard } from "@repo/ui/cards/ClubLocationCard";

type ClubLocationCardDemoProps = {
  openLabel: string;
  hoursLabel: string;
  distanceValue: string;
  distanceLabel: string;
  scoreValue: string;
  scoreLabel: string;
  studentsValue: string;
  studentsLabel: string;
};

export function ClubLocationCardDemo({
  openLabel,
  hoursLabel,
  distanceValue,
  distanceLabel,
  scoreValue,
  scoreLabel,
  studentsValue,
  studentsLabel,
}: ClubLocationCardDemoProps) {
  return (
    <ClubLocationCard
      hoursLabel={hoursLabel}
      status="open"
      statusLabel={openLabel}
      stats={[
        { key: "distance", value: distanceValue, label: distanceLabel },
        { key: "score", value: scoreValue, label: scoreLabel },
        { key: "students", value: studentsValue, label: studentsLabel },
      ]}
    />
  );
}
