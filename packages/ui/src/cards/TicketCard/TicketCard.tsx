"use client";

import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { WifiHigh } from "@repo/icons/WifiHigh";
import { Logo } from "../../common/Logo";
import { ticketCardVariants } from "./TicketCard.styles";
import type { TicketCardProps } from "./TicketCard.types";
import { TicketCardPattern } from "./TicketCardPattern";
import { TicketCardPaymentMark } from "./TicketCardPaymentMark";

export function TicketCard({
  title,
  subtitle,
  paymentLogo,
  contactlessIcon,
  mark,
  className,
  ...props
}: TicketCardProps) {
  const slots = ticketCardVariants();
  const hasText =
    (title != null && title !== "") || (subtitle != null && subtitle !== "");
  const showPayment = paymentLogo !== null;
  const showContactless = contactlessIcon !== null;
  const showMark = mark !== null;

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      <span aria-hidden className={slots.pattern()}>
        <TicketCardPattern className={slots.patternSvg()} />
      </span>

      {showPayment || showContactless ? (
        <div className={slots.header()}>
          {showPayment ? (
            <span className={slots.paymentBadge()}>
              {paymentLogo ?? (
                <TicketCardPaymentMark className={slots.paymentLogo()} />
              )}
            </span>
          ) : (
            <span />
          )}
          {showContactless ? (
            <span aria-hidden className={slots.contactless()}>
              {contactlessIcon ?? (
                <WifiHigh className={slots.contactlessIcon()} size={28} />
              )}
            </span>
          ) : null}
        </div>
      ) : null}

      {showMark ? (
        <span aria-hidden className={slots.mark()}>
          {mark ?? (
            <Logo
              color="var(--accent)"
              gradient
              shadow
              size={52}
              title=""
            />
          )}
        </span>
      ) : null}

      <div className={slots.footer()}>
        {hasText ? (
          <>
            {title != null && title !== "" ? (
              <Typography className={slots.title()} type="body" weight="bold">
                {title}
              </Typography>
            ) : null}
            {subtitle != null && subtitle !== "" ? (
              <Typography className={slots.subtitle()} type="body-sm">
                {subtitle}
              </Typography>
            ) : null}
          </>
        ) : (
          <>
            <span aria-hidden className={slots.skeletonShort()} />
            <span aria-hidden className={slots.skeletonLong()} />
          </>
        )}
      </div>
    </Card>
  );
}
