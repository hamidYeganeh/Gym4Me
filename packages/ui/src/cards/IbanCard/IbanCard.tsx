"use client";

import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { WifiHigh } from "@repo/icons/WifiHigh";
import { LogoMark } from "../../common/LogoMark";
import { IbanCardMastercard } from "./IbanCard.mastercard";
import { IbanCardPattern } from "./IbanCard.pattern";
import { ibanCardVariants } from "./IbanCard.styles";
import type { IbanCardProps } from "./IbanCard.types";

/** Groups digits/alphanumerics into 4-character chunks with double spaces. */
function formatIbanNumber(value: string) {
  const compact = value.replace(/\s+/g, "");
  if (compact.length === 0) return value;
  return compact.match(/.{1,4}/g)?.join("  ") ?? value;
}

export function IbanCard({
  holderName,
  expiry,
  number,
  networkLogo,
  networkLogoLabel = "Mastercard",
  className,
  ...props
}: IbanCardProps) {
  const slots = ibanCardVariants();
  const displayNumber =
    typeof number === "string" ? formatIbanNumber(number) : number;

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      <IbanCardPattern className={slots.pattern()} />

      <div className={slots.body()}>
        <div className={slots.header()}>
          <span aria-hidden className={slots.logo()}>
            <LogoMark
              color="currentColor"
              gradient={false}
              instanceId="iban-card"
              shadow={false}
              size={26}
              title=""
            />
          </span>
          <span aria-hidden className={slots.contactless()}>
            <WifiHigh size={32} />
          </span>
        </div>

        <div className={slots.footer()}>
          <div className={slots.meta()}>
            <div className={slots.metaRow()}>
              <Typography
                className={slots.holderName()}
                // @ts-expect-error RAC slot opt-out (null clears inherited slot)
                slot={null}
                type="body-xs"
                weight="bold"
              >
                {holderName}
              </Typography>
              <Typography
                className={slots.expiry()}
                // @ts-expect-error RAC slot opt-out (null clears inherited slot)
                slot={null}
                type="body-xs"
                weight="bold"
              >
                {expiry}
              </Typography>
            </div>
            <Typography
              className={slots.number()}
              // @ts-expect-error RAC slot opt-out (null clears inherited slot)
              slot={null}
              type="body"
              weight="bold"
            >
              {displayNumber}
            </Typography>
          </div>

          <span className={slots.network()}>
            {networkLogo ?? (
              <IbanCardMastercard
                className={slots.networkLogo()}
                title={networkLogoLabel}
              />
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}
