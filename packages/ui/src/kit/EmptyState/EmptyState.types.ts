import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";
import type { EmptyStateVariantProps } from "./EmptyState.styles";

export type EmptyStateStatus = NonNullable<EmptyStateVariantProps["status"]>;
export type EmptyStateLayout = NonNullable<EmptyStateVariantProps["layout"]>;

export type EmptyStateAction = {
  label: ReactNode;
  onPress?: ButtonProps["onPress"];
  /** Leading icon inside the primary button. */
  startContent?: ReactNode;
  /** Trailing icon inside the primary button. */
  endContent?: ReactNode;
  /** HeroUI button variant (default `primary`). */
  variant?: ButtonProps["variant"];
};

export type EmptyStateSuggestion = {
  key?: string;
  label: ReactNode;
  icon?: ReactNode;
  onPress?: ButtonProps["onPress"];
};

export type EmptyStateProps = Omit<
  HTMLAttributes<HTMLElement>,
  "title" | "children"
> & {
  /**
   * Visual tone for status icon circles and badge accents.
   * - `neutral` — muted / default empty
   * - `success` — payment / confirm success
   * - `danger` — error / failed
   * - `warning` — update required / caution
   * - `accent` — locked / premium
   */
  status?: EmptyStateStatus;
  /**
   * - `media` — large illustration (search / session / locked)
   * - `icon` — circular status glyph (success / failure)
   * - `compact` — badge + copy without hero media (update required)
   */
  layout?: EmptyStateLayout;
  /** Large illustration — URL string or custom node. Defaults to the no-data treadmill. */
  illustration?: string | ReactNode;
  /** Accessible alt when `illustration` is a URL. */
  illustrationAlt?: string;
  /** Glyph shown inside the status circle when `layout="icon"`. */
  icon?: ReactNode;
  /** Optional pill badge above the title (e.g. "Subscribe to plus"). */
  badge?: ReactNode;
  /** Leading icon inside the badge chip. */
  badgeIcon?: ReactNode;
  /** Primary heading. */
  title: ReactNode;
  /** Supporting copy under the title. */
  description?: ReactNode;
  /** Primary CTA. */
  primaryAction?: EmptyStateAction;
  /** Secondary text/ghost action under the primary CTA. */
  secondaryAction?: EmptyStateAction;
  /** Optional category / keyword suggestion chips. */
  suggestions?: EmptyStateSuggestion[];
  /** Accessible label for the suggestions row. */
  suggestionsLabel?: string;
  /** Stretch primary action to full width (default `true`). */
  fullWidthActions?: boolean;
};

export type EmptyStateSkeletonProps = {
  layout?: EmptyStateLayout;
  className?: string;
  /** Show suggestion chip placeholders. */
  showSuggestions?: boolean;
  /** Show secondary action placeholder. */
  showSecondaryAction?: boolean;
};
