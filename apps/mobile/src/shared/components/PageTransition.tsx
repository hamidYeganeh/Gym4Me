"use client";

import { duration, ease } from "@repo/theme";
import { animate } from "motion";
import { TransitionRouter } from "next-transition-router";
import {
  startTransition,
  useRef,
  type ReactNode,
} from "react";
import {
  classifyNavigation,
  shouldAnimatePageTransition,
  type NavigationDirection,
} from "@/shared/lib/navigation-direction";
import { pageTransitionVariants } from "./PageTransition.styles";

const PAGE_SHELL_ATTR = "data-page-shell";

/** App is `dir="rtl"` — forward edge is physical left. */
const AXIS = -1;

type PageTransitionProps = {
  children: ReactNode;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getShell(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${PAGE_SHELL_ATTR}]`);
}

function leaveOffset(dir: NavigationDirection): string {
  // Push: current card recesses under the incoming page.
  // Pop: current card exits toward the forward edge.
  if (dir === 1) return `${-AXIS * 28}%`;
  return `${AXIS * 100}%`;
}

function enterFrom(dir: NavigationDirection): string {
  if (dir === 1) return `${AXIS * 100}%`;
  return `${-AXIS * 28}%`;
}

/**
 * Telegram-style stack transitions via
 * [`next-transition-router`](https://github.com/ismamz/next-transition-router).
 */
export function PageTransition({ children }: PageTransitionProps) {
  const styles = pageTransitionVariants();
  const directionRef = useRef<NavigationDirection>(0);

  return (
    <TransitionRouter
      auto
      enter={(next) => {
        const shell = getShell();
        const dir = directionRef.current;

        if (!shell || dir === 0 || prefersReducedMotion()) {
          shell?.style.removeProperty("transform");
          shell?.style.removeProperty("opacity");
          shell?.style.removeProperty("will-change");
          next();
          return;
        }

        shell.style.willChange = "transform";
        const controls = animate(
          shell,
          {
            x: [enterFrom(dir), 0],
            opacity: [dir === -1 ? 0.9 : 1, 1],
          },
          { duration: duration.moderate, ease: [...ease.outFluid] },
        );

        void controls.then(() => {
          shell.style.removeProperty("transform");
          shell.style.removeProperty("opacity");
          shell.style.removeProperty("will-change");
          requestAnimationFrame(() => startTransition(next));
        });

        return () => {
          controls.stop();
        };
      }}
      leave={(next, from, to) => {
        const fromPath = from ?? "";
        // `router.back()` leaves `to` undefined — treat as pop.
        const dir: NavigationDirection = to
          ? classifyNavigation(fromPath, to)
          : -1;

        const shouldSkip =
          prefersReducedMotion() ||
          !shouldAnimatePageTransition(fromPath) ||
          (to ? !shouldAnimatePageTransition(to) : false) ||
          dir === 0;

        directionRef.current = shouldSkip ? 0 : dir;

        const shell = getShell();
        if (!shell || shouldSkip) {
          shell?.style.removeProperty("will-change");
          next();
          return;
        }

        shell.style.willChange = "transform";
        const controls = animate(
          shell,
          { x: leaveOffset(dir), opacity: dir === 1 ? 0.88 : 1 },
          { duration: duration.moderate, ease: [...ease.outFluid] },
        );

        void controls.then(() => next());

        return () => {
          controls.stop();
        };
      }}
    >
      <div className={styles.root()} data-page-shell="">
        {children}
      </div>
    </TransitionRouter>
  );
}
