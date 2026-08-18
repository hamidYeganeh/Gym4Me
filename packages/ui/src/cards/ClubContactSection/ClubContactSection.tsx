"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Telephone1 } from "@repo/icons/Telephone1";
import { clubContactSectionVariants } from "./ClubContactSection.styles";
import type { ClubContactSectionProps } from "./ClubContactSection.types";

export function ClubContactSection({
  title,
  phones,
  onCall,
  className,
  ...props
}: ClubContactSectionProps) {
  const slots = clubContactSectionVariants();

  if (phones.length === 0) return null;

  return (
    <section className={slots.root({ className })} {...props}>
      <Typography className={slots.title()} type="h4" weight="semibold">
        {title}
      </Typography>

      <ul className={slots.list()}>
        {phones.map((phone) => (
          <li className={slots.item()} key={phone.id}>
            <div className={slots.text()}>
              <Typography className={slots.label()} type="body">
                {phone.label}
              </Typography>
              <Typography className={slots.number()} weight="bold">
                {phone.number}
              </Typography>
            </div>

            <Button
              aria-label={phone.callLabel}
              className={slots.callButton()}
              isIconOnly
              onPress={() => onCall?.(phone)}
              size="lg"
              variant="secondary"
            >
              <Telephone1 aria-hidden className={slots.callIcon()} size={20} />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
