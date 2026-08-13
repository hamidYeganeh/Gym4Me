import type { HTMLAttributes } from "react";

export type MarketingClubsCard = {
  title: string;
  label: string;
  imageSrc: string;
  imageAlt?: string;
};

export type MarketingClubsSectionProps = HTMLAttributes<HTMLElement>;
