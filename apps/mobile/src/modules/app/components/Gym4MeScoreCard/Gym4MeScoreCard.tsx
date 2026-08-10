"use client";

import Image from "next/image";
import { gym4MeScoreCardVariants } from "./Gym4MeScoreCard.styles";
import type { Gym4MeScoreCardProps } from "./Gym4MeScoreCard.types";

const SCORE_CARD_SRC = "/welcome/score-card.svg";

export function Gym4MeScoreCard({
  className,
  label,
  statusLabel,
  score,
  delta,
}: Gym4MeScoreCardProps) {
  const styles = gym4MeScoreCardVariants();
  const alt = `${label} ${score} ${delta} ${statusLabel}`;

  return (
    <div className={styles.root({ className })}>
      <Image
        alt={alt}
        className={styles.image()}
        draggable={false}
        height={294}
        src={SCORE_CARD_SRC}
        width={375}
      />
    </div>
  );
}
