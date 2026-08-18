"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { stagger, transition } from "@repo/theme";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { initialsFromLabel } from "../../lib/community-data";
import { communityStoriesSectionVariants } from "./CommunityStoriesSection.styles";
import type { CommunityStoriesSectionProps } from "./CommunityStoriesSection.types";

export function CommunityStoriesSection({
  members,
  onMemberPress,
  className,
}: CommunityStoriesSectionProps) {
  const t = useTranslations("CommunityHome");
  const slots = communityStoriesSectionVariants();
  const reduceMotion = useReducedMotion();

  if (members.length === 0) return null;

  return (
    <section aria-label={t("storiesAria")} className={slots.root({ className })}>
      <div className={slots.scroller()}>
        {members.map((member, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            key={member.id}
            transition={{
              ...transition,
              delay: reduceMotion ? 0 : index * stagger.children,
            }}
          >
            <Button
              className={slots.item()}
              onPress={() => onMemberPress?.(member.id)}
              variant="ghost"
            >
              <span className={slots.ring()}>
                <span className={slots.ringInner()}>
                  <Avatar className={slots.avatar()}>
                    {member.avatarSrc ? (
                      <Avatar.Image
                        alt={member.username}
                        src={member.avatarSrc}
                      />
                    ) : null}
                    <Avatar.Fallback>
                      {initialsFromLabel(member.username)}
                    </Avatar.Fallback>
                  </Avatar>
                </span>
              </span>
              <Typography
                className={slots.username()}
                truncate
                type="body-xs"
                weight="medium"
              >
                {member.username}
              </Typography>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
