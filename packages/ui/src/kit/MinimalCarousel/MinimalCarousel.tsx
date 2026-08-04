"use client";

import { Button, Typography } from "@heroui/react";
import { Copy1, DotThreeHorizontal } from "@repo/icons";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useState, type CSSProperties, type MouseEvent } from "react";
import { minimalCarouselVariants } from "./MinimalCarousel.styles";
import type {
  MinimalCarouselCard,
  MinimalCarouselProps,
} from "./MinimalCarousel.types";

const layoutTransition: Transition = {
  type: "spring",
  bounce: 0.2,
  duration: 0.6,
};

const instantTransition: Transition = { duration: 0 };

export function MinimalCarousel({
  cards,
  copyLabel,
  editLabel,
  onCopyClick,
  onCustomizeClick,
  className,
  ...rootProps
}: MinimalCarouselProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? instantTransition : layoutTransition;

  const activeCard = cards.find((card) => card.id === activeId);
  const secondaryCards = cards.filter((card) => card.id !== activeId);
  const compact = Boolean(activeId);
  const slots = minimalCarouselVariants({ compact });

  const handleBackgroundClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setActiveId(null);
  };

  return (
    <div className={slots.root({ className })} {...rootProps}>
      <div className={slots.stage()} onClick={handleBackgroundClick}>
        <motion.div className={slots.stack()} layout={!reduceMotion}>
          <AnimatePresence mode="popLayout">
            {activeCard ? (
              <ExpandedCard
                card={activeCard}
                className={slots.expanded()}
                copyButtonClassName={slots.copyButton()}
                copyLabel={copyLabel}
                editButtonClassName={slots.editButton()}
                editLabel={editLabel}
                footerClassName={slots.expandedFooter()}
                headerClassName={slots.expandedHeader()}
                iconClassName={slots.expandedIcon()}
                metaClassName={slots.expandedMeta()}
                onCopyClick={onCopyClick}
                onCustomizeClick={onCustomizeClick}
                titleClassName={slots.expandedTitle()}
                transition={transition}
                valueClassName={slots.expandedValue()}
              />
            ) : null}
          </AnimatePresence>

          <motion.div className={slots.grid()} layout={!reduceMotion}>
            {(activeId ? secondaryCards : cards).map((card) => (
              <TileCard
                key={card.id}
                card={card}
                className={slots.tile()}
                headerClassName={slots.tileHeader()}
                iconSize={compact ? 20 : 28}
                metaClassName={slots.tileMeta()}
                moreBadgeClassName={slots.moreBadge()}
                onSelect={() => setActiveId(card.id)}
                titleClassName={slots.tileTitle()}
                transition={transition}
                valueClassName={slots.tileValue()}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

type ExpandedCardProps = {
  card: MinimalCarouselCard;
  className: string;
  headerClassName: string;
  iconClassName: string;
  copyButtonClassName: string;
  footerClassName: string;
  metaClassName: string;
  titleClassName: string;
  valueClassName: string;
  editButtonClassName: string;
  copyLabel: string;
  editLabel: string;
  transition: Transition;
  onCopyClick?: (card: MinimalCarouselCard) => void;
  onCustomizeClick?: (card: MinimalCarouselCard) => void;
};

function ExpandedCard({
  card,
  className,
  headerClassName,
  iconClassName,
  copyButtonClassName,
  footerClassName,
  metaClassName,
  titleClassName,
  valueClassName,
  editButtonClassName,
  copyLabel,
  editLabel,
  transition,
  onCopyClick,
  onCustomizeClick,
}: ExpandedCardProps) {
  const Icon = card.icon;
  const style: CSSProperties = { backgroundColor: card.color };

  return (
    <motion.div
      key={card.id}
      className={className}
      layoutId={card.id}
      style={style}
      transition={transition}
    >
      <div className={headerClassName}>
        <div aria-hidden className={iconClassName}>
          <Icon className="sm:size-11" size={38} />
        </div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            className={copyButtonClassName}
            size="sm"
            variant="ghost"
            onPress={() => onCopyClick?.(card)}
          >
            {copyLabel}
            <Copy1 size={16} />
          </Button>
        </motion.div>
      </div>

      <div className={footerClassName}>
        <div className={metaClassName}>
          <Typography className={titleClassName} type="h5" weight="semibold">
            {card.title}
          </Typography>
          <Typography className={valueClassName} type="body" weight="semibold">
            {card.value}
          </Typography>
        </div>

        <Button
          className={editButtonClassName}
          size="sm"
          variant="ghost"
          onPress={() => onCustomizeClick?.(card)}
        >
          {editLabel}
        </Button>
      </div>
    </motion.div>
  );
}

type TileCardProps = {
  card: MinimalCarouselCard;
  className: string;
  headerClassName: string;
  moreBadgeClassName: string;
  metaClassName: string;
  titleClassName: string;
  valueClassName: string;
  iconSize: number;
  transition: Transition;
  onSelect: () => void;
};

function TileCard({
  card,
  className,
  headerClassName,
  moreBadgeClassName,
  metaClassName,
  titleClassName,
  valueClassName,
  iconSize,
  transition,
  onSelect,
}: TileCardProps) {
  const Icon = card.icon;
  const style: CSSProperties = { backgroundColor: card.color };

  return (
    <motion.div
      className={className}
      layoutId={card.id}
      role="button"
      style={style}
      tabIndex={0}
      transition={transition}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelect();
        }
      }}
    >
      <div className={headerClassName}>
        <Icon aria-hidden className="shrink-0" size={iconSize} />
        <div aria-hidden className={moreBadgeClassName}>
          <DotThreeHorizontal size={16} />
        </div>
      </div>

      <div className={metaClassName}>
        <Typography className={titleClassName} type="body-sm" weight="medium">
          {card.title}
        </Typography>
        <Typography className={valueClassName} type="body-sm" weight="semibold">
          {card.value}
        </Typography>
      </div>
    </motion.div>
  );
}
