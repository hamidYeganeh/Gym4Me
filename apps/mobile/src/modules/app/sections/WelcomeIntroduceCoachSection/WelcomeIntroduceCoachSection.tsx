"use client";

import { Typography } from "@heroui/react";
import {
  CheckCircle,
  ChevronRight,
  HeartEcg,
  MapPin1,
  StarFull,
} from "@repo/icons";
import { motion } from "motion/react";
import {
  welcomeIntroduceSlideStackVariants,
  welcomeIntroduceStageItemVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceCoachSectionVariants } from "./WelcomeIntroduceCoachSection.styles";
import type { WelcomeIntroduceCoachSectionProps } from "./WelcomeIntroduceCoachSection.types";

export function WelcomeIntroduceCoachSection({
  className,
  name,
  price,
  specialty,
  distance,
  rating,
  reviews,
  availability,
}: WelcomeIntroduceCoachSectionProps) {
  const styles = welcomeIntroduceCoachSectionVariants();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceSlideStackVariants}
    >
      <motion.div variants={welcomeIntroduceStageItemVariants}>
        <div aria-hidden className={styles.avatars()}>
          <span className={`${styles.avatar()} ${styles.avatarA()}`} />
          <span className={`${styles.avatar()} ${styles.avatarB()}`} />
          <span className={`${styles.avatar()} ${styles.avatarC()}`} />
          <span className={`${styles.avatar()} ${styles.avatarD()}`} />
          <span className={`${styles.avatar()} ${styles.avatarE()}`} />
        </div>
        <div aria-hidden className={styles.connector()}>
          <span className={styles.line()} />
          <span className={styles.pin()} />
        </div>
      </motion.div>

      <motion.div
        className={styles.card()}
        variants={welcomeIntroduceStageItemVariants}
      >
        <div className={styles.cardTop()}>
          <div aria-hidden className={styles.photo()} />
          <div className={styles.info()}>
            <Typography className={styles.name()} type="body" weight="semibold">
              {name}
            </Typography>
            <p className={styles.price()}>{price}</p>
            <div className={styles.metaRow()}>
              <span className={styles.metaItem()}>
                <HeartEcg aria-hidden className={styles.metaIcon()} size={16} />
                {specialty}
              </span>
              <span aria-hidden>·</span>
              <span className={styles.metaItem()}>
                <MapPin1 aria-hidden className={styles.metaIcon()} size={16} />
                {distance}
              </span>
            </div>
            <div className={styles.ratingRow()}>
              <span className={styles.stars()}>
                {Array.from({ length: 5 }, (_, i) => (
                  <StarFull
                    aria-hidden
                    key={i}
                    size={14}
                    className={i < 4 ? undefined : "opacity-35"}
                  />
                ))}
              </span>
              <span>{rating}</span>
              <span className="text-muted">({reviews})</span>
            </div>
            <p className={styles.availability()}>
              <CheckCircle aria-hidden size={16} />
              {availability}
            </p>
          </div>
          <ChevronRight aria-hidden className={styles.chevron()} size={20} />
        </div>
        <div aria-hidden className={styles.thumbs()}>
          <span className={`${styles.thumb()} ${styles.thumbA()}`} />
          <span className={`${styles.thumb()} ${styles.thumbB()}`} />
          <span className={`${styles.thumb()} ${styles.thumbC()}`} />
          <span className={`${styles.thumb()} ${styles.thumbD()}`} />
        </div>
      </motion.div>
    </motion.div>
  );
}
