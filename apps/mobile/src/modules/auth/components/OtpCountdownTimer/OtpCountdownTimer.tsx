"use client";

import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { memo, useEffect, useMemo, useState } from "react";
import { otpCountdownTimerVariants } from "./OtpCountdownTimer.styles";
import type { OtpCountdownTimerProps } from "./OtpCountdownTimer.types";

const MINUTES_FORMAT = {
  minimumIntegerDigits: 1,
  useGrouping: false,
} as const;

const SECONDS_FORMAT = {
  minimumIntegerDigits: 2,
  useGrouping: false,
} as const;

const numberFlowStyle = {
  color: "var(--foreground)",
  fontSize: "0.875rem",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
} as const;

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toLocaleString("fa-IR")}:${remainder
    .toLocaleString("fa-IR", { minimumIntegerDigits: 2 })
    .replace(/\u200e/g, "")}`;
}

function useNumberFlowReady() {
  const [ready, setReady] = useState(
    () =>
      typeof customElements !== "undefined" &&
      Boolean(customElements.get("number-flow-react")),
  );

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    void customElements.whenDefined("number-flow-react").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  return ready;
}

function OtpCountdownTimerInner({
  remainingSeconds,
  className,
}: OtpCountdownTimerProps) {
  const styles = otpCountdownTimerVariants();
  const ready = useNumberFlowReady();
  const { minutes, seconds } = useMemo(
    () => ({
      minutes: Math.floor(remainingSeconds / 60),
      seconds: remainingSeconds % 60,
    }),
    [remainingSeconds],
  );
  const staticLabel = useMemo(
    () => formatTimer(remainingSeconds),
    [remainingSeconds],
  );

  if (!ready) {
    return (
      <span className={styles.root({ className })}>{staticLabel}</span>
    );
  }

  return (
    <NumberFlowGroup>
      <span className={styles.root({ className })}>
        <NumberFlow
          className={styles.digit()}
          format={MINUTES_FORMAT}
          locales="fa-IR"
          style={numberFlowStyle}
          value={minutes}
          willChange
        />
        <span aria-hidden className={styles.separator()}>
          :
        </span>
        <NumberFlow
          className={styles.digit()}
          format={SECONDS_FORMAT}
          locales="fa-IR"
          style={numberFlowStyle}
          value={seconds}
          willChange
        />
      </span>
    </NumberFlowGroup>
  );
}

export const OtpCountdownTimer = memo(OtpCountdownTimerInner);
