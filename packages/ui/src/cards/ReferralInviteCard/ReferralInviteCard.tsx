"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Ticket } from "@repo/icons/Ticket";
import { referralInviteCardVariants } from "./ReferralInviteCard.styles";
import type { ReferralInviteCardProps } from "./ReferralInviteCard.types";

export function ReferralInviteCard({
  title,
  description,
  codeLabel,
  referralCode,
  successLabel,
  successCount,
  actionLabel,
  onAction,
  icon,
  actionClassName,
  className,
  ...props
}: ReferralInviteCardProps) {
  const slots = referralInviteCardVariants();

  return (
    <article className={slots.root({ className })} {...props}>
      <span aria-hidden className={slots.watermark()}>
        <span className={slots.watermarkStack()}>
          <Ticket
            className={slots.watermarkIcon({
              className: slots.watermarkIconBack(),
            })}
            size={78}
          />
          <Ticket
            className={slots.watermarkIcon({
              className: slots.watermarkIconFront(),
            })}
            size={78}
          />
        </span>
      </span>

      <div className={slots.header()}>
        <span aria-hidden className={slots.iconBadge()}>
          {icon ?? <Ticket size={22} />}
        </span>
        <div className={slots.copy()}>
          <Typography className={slots.title()} type="body" weight="bold">
            {title}
          </Typography>
          <Typography className={slots.description()} type="body-sm">
            {description}
          </Typography>
        </div>
      </div>

      <div className={slots.stats()}>
        <div className={slots.stat()}>
          <Typography className={slots.statLabel()} type="body-sm">
            {successLabel}
          </Typography>
          <Typography
            className={slots.statValue({ className: slots.successValue() })}
            weight="bold"
          >
            {successCount}
          </Typography>
        </div>
        <div className={slots.stat()}>
          <Typography className={slots.statLabel()} type="body-sm">
            {codeLabel}
          </Typography>
          <Typography
            className={slots.statValue({ className: slots.codeValue() })}
            dir="ltr"
            weight="bold"
          >
            {referralCode}
          </Typography>
        </div>
      </div>

      <Button
        aria-label={actionLabel}
        className={slots.action({ className: actionClassName })}
        fullWidth
        onPress={onAction}
        size="lg"
        variant="primary"
      >
        <Ticket size={18} />
        {actionLabel}
      </Button>
    </article>
  );
}
