"use client";

import { Button, Chip, Skeleton, Typography } from "@heroui/react";
import { MediaImage } from "../../common/MediaImage";
import { emptyStateVariants } from "./EmptyState.styles";
import type {
  EmptyStateProps,
  EmptyStateSkeletonProps,
} from "./EmptyState.types";

export function EmptyState({
  status = "neutral",
  layout = "media",
  illustration,
  illustrationAlt = "",
  icon,
  badge,
  badgeIcon,
  title,
  description,
  primaryAction,
  secondaryAction,
  suggestions,
  suggestionsLabel,
  fullWidthActions = true,
  className,
  ...props
}: EmptyStateProps) {
  const slots = emptyStateVariants({ status, layout });
  const showMedia = layout === "media" && illustration != null;
  const showIcon = layout === "icon" && icon != null;
  const showBadge = badge != null && badge !== "";
  const showSuggestions = suggestions != null && suggestions.length > 0;

  return (
    <section className={slots.root({ className })} {...props}>
      {showMedia ? (
        <div className={slots.media()}>
          {typeof illustration === "string" ? (
            <MediaImage
              alt={illustrationAlt}
              className={slots.illustration()}
              image={illustration}
            />
          ) : (
            <div className={slots.illustration()}>{illustration}</div>
          )}
        </div>
      ) : null}

      {showIcon ? (
        <span aria-hidden className={slots.iconCircle()}>
          <span className={slots.icon()}>{icon}</span>
        </span>
      ) : null}

      {showBadge ? (
        <Chip
          className={slots.badge()}
          color={
            status === "neutral"
              ? "default"
              : status === "accent"
                ? "accent"
                : status
          }
          size="sm"
          variant="soft"
        >
          {badgeIcon ? (
            <span className={slots.badgeIcon()}>{badgeIcon}</span>
          ) : null}
          <Chip.Label>{badge}</Chip.Label>
        </Chip>
      ) : null}

      <div className={slots.copy()}>
        <Typography className={slots.title()} type="h2" weight="bold">
          {title}
        </Typography>
        {description != null && description !== "" ? (
          <Typography className={slots.description()} type="body">
            {description}
          </Typography>
        ) : null}
      </div>

      {primaryAction || secondaryAction ? (
        <div className={slots.actions()}>
          {primaryAction ? (
            <Button
              className={slots.primaryAction()}
              fullWidth={fullWidthActions}
              onPress={primaryAction.onPress}
              size="lg"
              variant={primaryAction.variant ?? "primary"}
            >
              {primaryAction.startContent}
              {primaryAction.label}
              {primaryAction.endContent}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              className={slots.secondaryAction()}
              onPress={secondaryAction.onPress}
              size="md"
              variant={secondaryAction.variant ?? "ghost"}
            >
              {secondaryAction.startContent}
              {secondaryAction.label}
              {secondaryAction.endContent}
            </Button>
          ) : null}
        </div>
      ) : null}

      {showSuggestions ? (
        <div
          aria-label={suggestionsLabel}
          className={slots.suggestions()}
          role="group"
        >
          {suggestions.map((suggestion, index) => (
            <Button
              className={slots.suggestion()}
              key={suggestion.key ?? String(index)}
              onPress={suggestion.onPress}
              size="md"
              variant="ghost"
            >
              {suggestion.icon ? (
                <span className={slots.suggestionIcon()}>
                  {suggestion.icon}
                </span>
              ) : null}
              {suggestion.label}
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/** Skeleton that mirrors {@link EmptyState} layout slots. */
export function EmptyStateSkeleton({
  layout = "media",
  className,
  showSuggestions = false,
  showSecondaryAction = true,
}: EmptyStateSkeletonProps) {
  const slots = emptyStateVariants({ layout, status: "neutral" });

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={slots.root({ className })}
      role="status"
    >
      {layout === "media" ? (
        <Skeleton
          aria-hidden
          className="mb-6 aspect-square w-full max-w-[14rem] rounded-[2rem]"
        />
      ) : null}
      {layout === "icon" ? (
        <Skeleton
          aria-hidden
          className="mb-6 size-20 rounded-[1.75rem] sm:size-24 sm:rounded-[2rem]"
        />
      ) : null}
      {layout === "compact" ? (
        <Skeleton aria-hidden className="mb-4 h-8 w-44 rounded-full" />
      ) : (
        <Skeleton aria-hidden className="mb-4 h-8 w-36 rounded-full" />
      )}
      <div className={slots.copy()}>
        <Skeleton aria-hidden className="h-8 w-48 rounded-lg sm:h-9 sm:w-56" />
        <Skeleton aria-hidden className="mt-2 h-4 w-full max-w-sm rounded-md" />
        <Skeleton aria-hidden className="h-4 w-4/5 max-w-xs rounded-md" />
      </div>
      <div className={slots.actions()}>
        <Skeleton aria-hidden className="h-12 w-full rounded-full" />
        {showSecondaryAction ? (
          <Skeleton aria-hidden className="h-5 w-28 rounded-md" />
        ) : null}
      </div>
      {showSuggestions ? (
        <div className={slots.suggestions()}>
          <Skeleton aria-hidden className="h-10 w-20 rounded-full" />
          <Skeleton aria-hidden className="h-10 w-24 rounded-full" />
          <Skeleton aria-hidden className="h-10 w-28 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}
