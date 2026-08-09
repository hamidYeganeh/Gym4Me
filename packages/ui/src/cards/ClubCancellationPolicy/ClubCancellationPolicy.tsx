"use client";

import { Card, Typography } from "@heroui/react";
import { clubCancellationPolicyVariants } from "./ClubCancellationPolicy.styles";
import type {
  ClubCancellationPolicyProps,
  ClubCancellationPolicyStepColor,
  ClubCancellationPolicyStepStatus,
} from "./ClubCancellationPolicy.types";

const DEFAULT_STEP_COLORS: ClubCancellationPolicyStepColor[] = [
  "success",
  "warning",
  "danger",
  "accent",
];

const STEP_COLOR_CSS_VAR: Record<ClubCancellationPolicyStepColor, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  accent: "var(--accent)",
};

function resolveStatus(
  explicit: ClubCancellationPolicyStepStatus | undefined,
  index: number,
  activeIndex: number | undefined,
): ClubCancellationPolicyStepStatus {
  if (explicit != null) return explicit;
  if (activeIndex == null) return "completed";
  if (index < activeIndex) return "completed";
  if (index === activeIndex) return "current";
  return "pending";
}

function resolveColor(
  explicit: ClubCancellationPolicyStepColor | undefined,
  index: number,
): ClubCancellationPolicyStepColor {
  return (
    explicit ??
    DEFAULT_STEP_COLORS[index % DEFAULT_STEP_COLORS.length] ??
    "accent"
  );
}

function connectorGradient(
  from: ClubCancellationPolicyStepColor,
  to: ClubCancellationPolicyStepColor,
) {
  return `linear-gradient(to bottom, ${STEP_COLOR_CSS_VAR[from]}, ${STEP_COLOR_CSS_VAR[to]})`;
}

export function ClubCancellationPolicy({
  steps,
  activeIndex,
  title,
  className,
  ...props
}: ClubCancellationPolicyProps) {
  const slots = clubCancellationPolicyVariants();

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      {title != null && title !== "" ? (
        <Typography className={slots.title()} type="h4" weight="bold">
          {title}
        </Typography>
      ) : null}

      <ol className={slots.list()}>
        {steps.map((step, index) => {
          const status = resolveStatus(step.status, index, activeIndex);
          const color = resolveColor(step.color, index);
          const nextColor = resolveColor(steps[index + 1]?.color, index + 1);
          const isLast = index === steps.length - 1;
          const stepSlots = clubCancellationPolicyVariants({
            status,
            color,
            isLast,
          });

          return (
            <li
              className={stepSlots.item()}
              key={step.id ?? `step-${index}`}
            >
              <div aria-hidden className={stepSlots.rail()}>
                <span className={stepSlots.node()}>
                  <span className={stepSlots.nodeDot()} />
                </span>
                {!isLast ? (
                  <span
                    className={stepSlots.connector()}
                    style={{
                      backgroundImage: connectorGradient(color, nextColor),
                    }}
                  />
                ) : null}
              </div>

              <div className={stepSlots.content()}>
                <Typography
                  className={stepSlots.stepTitle()}
                  type="body"
                  weight="bold"
                >
                  {step.title}
                </Typography>
                <Typography
                  className={stepSlots.stepDescription()}
                  type="body-sm"
                >
                  {step.description}
                </Typography>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
