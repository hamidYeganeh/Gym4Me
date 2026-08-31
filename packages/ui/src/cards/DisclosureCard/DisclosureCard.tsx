"use client";

import { useEffect, useState, type ComponentType } from "react";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { CloseX } from "@repo/icons/CloseX";
import type { IconProps } from "@repo/icons/create-icon";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { getCachedIcon, loadIcon } from "@repo/icons/load-icon";
import { spring } from "@repo/theme";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Transition,
} from "motion/react";
import useMeasure from "react-use-measure";
import { disclosureCardVariants } from "./DisclosureCard.styles";
import type {
  DisclosureCardCollection,
  DisclosureCardIcon,
  DisclosureCardItem,
  DisclosureCardProps,
} from "./DisclosureCard.types";

const springConfig: Transition = {
  ...spring.gentle,
  mass: 1.1,
};

const PREVIEW_ICON_COUNT = 4;
const defaultFormatItemsCount = (count: number) => `${count} Items`;
const defaultFormatPrice = (price: number) => `$${price}`;

function itemSecondary(
  item: DisclosureCardItem,
  formatPrice: (price: number) => string,
) {
  if (item.detail?.trim()) return item.detail.trim();
  if (typeof item.price === "number") return formatPrice(item.price);
  return undefined;
}

function DisclosureIcon({
  icon,
  size,
}: {
  icon: DisclosureCardItem["icon"];
  size: number;
}) {
  const catalogName = typeof icon === "string" ? icon : null;
  const [Loaded, setLoaded] = useState<ComponentType<IconProps> | null>(() =>
    catalogName ? (getCachedIcon(catalogName) ?? null) : null,
  );

  useEffect(() => {
    if (!catalogName) {
      setLoaded(null);
      return;
    }
    let active = true;
    void loadIcon(catalogName).then((next) => {
      if (active) setLoaded(() => next);
    });
    return () => {
      active = false;
    };
  }, [catalogName]);

  const Icon: DisclosureCardIcon =
    typeof icon === "string" ? (Loaded ?? Sparkle1) : icon;

  return <Icon aria-hidden size={size} />;
}

export function DisclosureCard({
  collections,
  formatItemsCount = defaultFormatItemsCount,
  formatPrice = defaultFormatPrice,
  closeLabel = "Close",
  onItemPress,
  className,
  ...props
}: DisclosureCardProps) {
  const slots = disclosureCardVariants();

  return (
    <div className={slots.root({ className })} {...props}>
      <motion.div
        className={slots.list()}
        layout="position"
        transition={springConfig}
      >
        {collections.map((collection) => (
          <GridContainer
            key={collection.id}
            closeLabel={closeLabel}
            collection={collection}
            formatItemsCount={formatItemsCount}
            formatPrice={formatPrice}
            onItemPress={onItemPress}
            slots={slots}
          />
        ))}
      </motion.div>
    </div>
  );
}

type Slots = ReturnType<typeof disclosureCardVariants>;

function GridContainer({
  collection,
  formatItemsCount,
  formatPrice,
  closeLabel,
  onItemPress,
  slots,
}: {
  collection: DisclosureCardCollection;
  formatItemsCount: (count: number) => string;
  formatPrice: (price: number) => string;
  closeLabel: string;
  onItemPress?: DisclosureCardProps["onItemPress"];
  slots: Slots;
}) {
  const { name: title, items } = collection;
  const [isExpanded, setIsExpanded] = useState(false);
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const previewItems = items.slice(0, PREVIEW_ICON_COUNT);

  return (
    <MotionConfig transition={springConfig}>
      <motion.div
        animate={{
          height: bounds.height > 0 ? bounds.height : "auto",
        }}
        className={slots.card()}
      >
        <div className={slots.cardInner()} ref={ref}>
          <AnimatePresence
            key={isExpanded ? "expanded" : "collapsed"}
            mode="popLayout"
            propagate
          >
            {!isExpanded ? (
              <motion.button
                key="collapsed"
                aria-expanded={false}
                className={slots.collapsed()}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                type="button"
                onClick={() => setIsExpanded(true)}
              >
                <div className={slots.iconGrid()}>
                  {previewItems.length > 0 ? (
                    previewItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className={slots.iconTileCollapsed()}
                        layoutId={`${collection.id}-${item.id}`}
                        transition={{ ...springConfig, delay: 0.01 }}
                      >
                        <DisclosureIcon icon={item.icon} size={16} />
                      </motion.div>
                    ))
                  ) : (
                    <div
                      className={slots.iconTileCollapsed({
                        className: slots.iconTileMuted(),
                      })}
                    >
                      <Sparkle1 aria-hidden size={16} />
                    </div>
                  )}
                </div>

                <div className={slots.meta()}>
                  <motion.span
                    className={slots.title()}
                    layout="position"
                    layoutId={`title-${collection.id}`}
                  >
                    {title}
                  </motion.span>
                  <span className={slots.subtitle()}>
                    {formatItemsCount(items.length)}
                  </span>
                </div>

                <ChevronRight className={slots.chevron()} size={24} />
              </motion.button>
            ) : (
              <motion.div
                key="expanded"
                className={slots.expanded()}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.01, ease: "easeOut" }}
              >
                <motion.div className={slots.expandedHeader()} layout>
                  <motion.span
                    className={slots.titleExpanded()}
                    layout="position"
                    layoutId={`title-${collection.id}`}
                  >
                    {title}
                  </motion.span>
                  <button
                    aria-label={closeLabel}
                    className={slots.closeButton()}
                    type="button"
                    onClick={() => setIsExpanded(false)}
                  >
                    <CloseX className="text-current" size={16} />
                  </button>
                </motion.div>

                {items.length === 0 ? (
                  <p className={slots.empty()}>{collection.emptyLabel}</p>
                ) : (
                  <div className={slots.rows()}>
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <ItemRow
                          key={item.id}
                          collection={collection}
                          formatPrice={formatPrice}
                          item={item}
                          onItemPress={onItemPress}
                          slots={slots}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

function ItemRow({
  item,
  collection,
  formatPrice,
  onItemPress,
  slots,
}: {
  item: DisclosureCardItem;
  collection: DisclosureCardCollection;
  formatPrice: (price: number) => string;
  onItemPress?: DisclosureCardProps["onItemPress"];
  slots: Slots;
}) {
  const interactive = typeof onItemPress === "function";
  const secondary = itemSecondary(item, formatPrice);

  return (
    <div
      className={slots.row({
        className: interactive ? slots.rowInteractive() : undefined,
      })}
      onClick={
        interactive
          ? () => {
              onItemPress(item, collection);
            }
          : undefined
      }
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onItemPress(item, collection);
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <motion.div
        className={slots.iconTileExpanded()}
        layoutId={`${collection.id}-${item.id}`}
      >
        <DisclosureIcon icon={item.icon} size={24} />
      </motion.div>
      <motion.div
        animate={{ opacity: 1 }}
        className={slots.rowMeta()}
        initial={{ opacity: 0 }}
      >
        <motion.p className={slots.itemName()}>{item.name}</motion.p>
        {secondary ? <p className={slots.itemDetail()}>{secondary}</p> : null}
      </motion.div>
      {interactive ? (
        <ChevronRight className={slots.rowChevron()} size={24} />
      ) : null}
    </div>
  );
}
