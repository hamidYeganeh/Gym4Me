"use client";

import { useEffect, useRef } from "react";
import { Check } from "@repo/icons/Check";
import { formStepperVariants } from "./FormStepper.styles";
import type { FormStepperProps } from "./FormStepper.types";

/**
 * Horizontal wizard progress indicator for multi-step forms.
 * Renders numbered circles joined by connectors; completed steps show a check.
 * Scrolls horizontally when steps do not fit, keeping labels readable.
 */
export function FormStepper({
  steps,
  activeIndex,
  "aria-label": ariaLabel,
  className,
}: FormStepperProps) {
  const base = formStepperVariants();
  const rootRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const stepEl = stepRefs.current[activeIndex];
    const rootEl = rootRef.current;
    if (!stepEl || !rootEl) return;

    const rootRect = rootEl.getBoundingClientRect();
    const stepRect = stepEl.getBoundingClientRect();
    const offset =
      stepRect.left -
      rootRect.left -
      (rootRect.width - stepRect.width) / 2;

    rootEl.scrollBy({ left: offset, behavior: "smooth" });
  }, [activeIndex, steps.length]);

  return (
    <nav
      ref={rootRef}
      aria-label={ariaLabel}
      className={base.root({ className })}
    >
      {steps.map((step, index) => {
        const state =
          index < activeIndex
            ? "done"
            : index === activeIndex
              ? "active"
              : "pending";
        const slots = formStepperVariants({ state });
        // Connector before the circle is filled once the step is reached.
        const startConnector = formStepperVariants({
          state: index <= activeIndex ? "done" : "pending",
        }).connector({ className: index === 0 ? "opacity-0" : undefined });
        const endConnector = formStepperVariants({
          state: index < activeIndex ? "done" : "pending",
        }).connector({
          className: index === steps.length - 1 ? "opacity-0" : undefined,
        });

        return (
          <div
            ref={(node) => {
              stepRefs.current[index] = node;
            }}
            aria-current={state === "active" ? "step" : undefined}
            className={base.step()}
            key={step.key}
          >
            <div className={base.indicatorRow()}>
              <span aria-hidden className={startConnector} />
              <span className={slots.circle()}>
                {state === "done" ? <Check aria-hidden size={16} /> : index + 1}
              </span>
              <span aria-hidden className={endConnector} />
            </div>
            <span className={slots.label()}>{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
