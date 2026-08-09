"use client";

import { Card, Typography } from "@heroui/react";
import { ChevronRight, ExclamationMarkTriangle } from "@repo/icons";
import { welcomeMetricCardVariants } from "./WelcomeMetricCard.styles";
import type {
  WelcomeMetricCardProps,
  WelcomeMetricTone,
} from "./WelcomeMetricCard.types";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const WEIGHT_PATH =
  "M2 38 C 12 34, 18 18, 28 22 S 42 48, 54 36 S 72 10, 86 20 S 104 42, 118 28";
const WEIGHT_FILL = `${WEIGHT_PATH} L118 56 L2 56 Z`;

const HEART_STEP =
  "M2 40 H18 V28 H34 V34 H50 V12 H66 V22 H82 V30 H98 V18 H114 V26 H118";
const HEART_FILL = `${HEART_STEP} V56 H2 Z`;

/** Dual pill bars per weekday (systolic/diastolic demo). */
const PRESSURE_BARS: { x: number; top: number; mid: number; bottom: number }[] =
  [
    { x: 8, top: 10, mid: 28, bottom: 48 },
    { x: 24, top: 16, mid: 30, bottom: 46 },
    { x: 40, top: 8, mid: 26, bottom: 50 },
    { x: 56, top: 14, mid: 32, bottom: 44 },
    { x: 72, top: 20, mid: 34, bottom: 48 },
    { x: 88, top: 12, mid: 28, bottom: 46 },
    { x: 104, top: 18, mid: 30, bottom: 50 },
  ];

function MetricChart({
  tone,
  animationKey,
}: {
  tone: WelcomeMetricTone;
  animationKey: string | number;
}) {
  const styles = welcomeMetricCardVariants({ tone });

  if (tone === "pressure") {
    return (
      <div className={styles.chartWrap()}>
        <svg
          aria-hidden
          className={styles.chart()}
          key={animationKey}
          viewBox="0 0 120 56"
        >
          {PRESSURE_BARS.map((bar, index) => (
            <g key={bar.x}>
              <rect
                className="fill-stats-purple/90 opacity-0 motion-safe:animate-[welcome-score-fade_0.55s_var(--ease-app)_forwards]"
                height={bar.mid - bar.top}
                rx={2.5}
                style={{ animationDelay: `${0.12 + index * 0.05}s` }}
                width={8}
                x={bar.x}
                y={bar.top}
              />
              <rect
                className="fill-stats-purple/45 opacity-0 motion-safe:animate-[welcome-score-fade_0.55s_var(--ease-app)_forwards]"
                height={bar.bottom - bar.mid - 4}
                rx={2.5}
                style={{ animationDelay: `${0.18 + index * 0.05}s` }}
                width={8}
                x={bar.x}
                y={bar.mid + 4}
              />
            </g>
          ))}
        </svg>
        <div className={styles.weekdayRow()}>
          {WEEKDAYS.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
      </div>
    );
  }

  if (tone === "heart") {
    return (
      <div className={styles.chartWrap()}>
        <svg
          aria-hidden
          className={styles.chart()}
          key={animationKey}
          viewBox="0 0 120 56"
        >
          <defs>
            <linearGradient id="welcome-hr-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--stats-red)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--stats-red)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="opacity-0 motion-safe:animate-[welcome-score-fade_0.7s_var(--ease-app)_0.35s_forwards]"
            d={HEART_FILL}
            fill="url(#welcome-hr-fill)"
          />
          <path
            className="fill-none stroke-stats-red stroke-[2.25] [stroke-linecap:round] [stroke-linejoin:round] [stroke-dasharray:240] [stroke-dashoffset:240] motion-safe:animate-[welcome-score-draw_1.1s_var(--ease-app)_0.15s_forwards]"
            d={HEART_STEP}
          />
        </svg>
        <div className={styles.weekdayRow()}>
          {WEEKDAYS.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartWrap()}>
      <svg
        aria-hidden
        className={styles.chart()}
        key={animationKey}
        viewBox="0 0 120 56"
      >
        <defs>
          <linearGradient id="welcome-weight-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="opacity-0 motion-safe:animate-[welcome-score-fade_0.7s_var(--ease-app)_0.4s_forwards]"
          d={WEIGHT_FILL}
          fill="url(#welcome-weight-fill)"
        />
        <path
          className="fill-none stroke-2 stroke-accent/40 [stroke-linecap:round] [stroke-linejoin:round] [stroke-dasharray:200] [stroke-dashoffset:200] motion-safe:animate-[welcome-score-draw_1s_var(--ease-app)_0.1s_forwards]"
          d="M2 42 C 14 30, 22 44, 34 36 S 54 16, 68 28 S 90 48, 118 24"
        />
        <path
          className="fill-none stroke-accent stroke-[2.25] [stroke-linecap:round] [stroke-linejoin:round] [stroke-dasharray:200] [stroke-dashoffset:200] motion-safe:animate-[welcome-score-draw_1.1s_var(--ease-app)_0.25s_forwards]"
          d={WEIGHT_PATH}
        />
      </svg>
    </div>
  );
}

export function WelcomeMetricCard({
  className,
  title,
  periodLabel,
  value,
  unit,
  status,
  tone,
  icon: Icon,
  trailing = "chevron",
  animationKey = 0,
}: WelcomeMetricCardProps) {
  const styles = welcomeMetricCardVariants({ tone });

  return (
    <Card className={styles.root({ className })} variant="transparent">
      <Card.Header className={styles.header()}>
        <div className={styles.titleRow()}>
          <Icon aria-hidden className={styles.titleIcon()} size={20} />
          <Typography className={styles.title()} type="body" weight="semibold">
            {title}
          </Typography>
        </div>
        <span className={styles.periodRow()}>
          {periodLabel}
          {trailing === "warning" ? (
            <ExclamationMarkTriangle
              aria-hidden
              className={`${styles.periodIcon()} text-danger`}
              size={14}
            />
          ) : (
            <ChevronRight
              aria-hidden
              className={styles.periodIcon()}
              size={14}
            />
          )}
        </span>
      </Card.Header>

      {/* Plain div — HeroUI Card.Content defaults to a column stack. */}
      <div className={styles.body()}>
        <div className={styles.metrics()}>
          <div className={styles.valueRow()}>
            <Typography className={styles.value()} type="h2" weight="bold">
              {value}
            </Typography>
            <span className={styles.unit()}>{unit}</span>
          </div>
          <Typography className={styles.status()} type="body-xs">
            {status}
          </Typography>
        </div>

        <MetricChart animationKey={animationKey} tone={tone} />
      </div>
    </Card>
  );
}
