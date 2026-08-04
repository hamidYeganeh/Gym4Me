"use client";

import { duration, ease, useThemeTransition } from "@repo/theme";
import { motion } from "motion/react";
import { useId } from "react";

interface AnimatedThemeTogglerProps {
  className?: string;
  "aria-label"?: string;
}

const THEME_ICON_TRANSITION = {
  ease: ease.inOut,
  duration: duration.slow,
} as const;

/**
 * Morphing sun/moon control wired to `useThemeTransition` / next-themes.
 * Icon morph inspired by toggles.dev / Skiper UI ThemeToggleButton2.
 */
export function AnimatedThemeToggler({
  className = "",
  "aria-label": ariaLabel = "Toggle theme",
}: AnimatedThemeTogglerProps) {
  const { isDark, toggleThemeWithTransition } = useThemeTransition();
  const clipId = useId().replace(/:/g, "");

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isDark}
      className={[
        "inline-flex size-10 items-center justify-center rounded-full",
        "bg-default text-foreground transition-transform duration-moderate ease-app",
        "active:scale-95",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        void toggleThemeWithTransition();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="size-5"
      >
        <clipPath id={clipId}>
          <motion.path
            initial={false}
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={THEME_ICON_TRANSITION}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <motion.circle
            initial={false}
            animate={{ r: isDark ? 10 : 8 }}
            transition={THEME_ICON_TRANSITION}
            cx="16"
            cy="16"
          />
          <motion.g
            initial={false}
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={THEME_ICON_TRANSITION}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}
