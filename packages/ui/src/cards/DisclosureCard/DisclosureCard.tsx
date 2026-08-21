"use client";

import { ChevronRight } from "@repo/icons/ChevronRight";
import { CloseX } from "@repo/icons/CloseX";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Transition,
} from "motion/react";
import { useState } from "react";
import useMeasure from "react-use-measure";
import { disclosureCardVariants } from "./DisclosureCard.styles";
import type {
  DisclosureCardCollection,
  DisclosureCardItem,
  DisclosureCardProps,
} from "./DisclosureCard.types";

const springConfig: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 1.1,
};

const defaultFormatItemsCount = (count: number) => `${count} Items`;
const defaultFormatPrice = (price: number) => `$${price}`;

export function DisclosureCard({
  collections,
  formatItemsCount = defaultFormatItemsCount,
  formatPrice = defaultFormatPrice,
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
  onItemPress,
  slots,
}: {
  collection: DisclosureCardCollection;
  formatItemsCount: (count: number) => string;
  formatPrice: (price: number) => string;
  onItemPress?: DisclosureCardProps["onItemPress"];
  slots: Slots;
}) {
  const { name: title, items } = collection;
  const [isExpanded, setIsExpanded] = useState(false);
  const [ref, bounds] = useMeasure({ offsetSize: true });

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
              <motion.div
                key="collapsed"
                className={slots.collapsed()}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(true)}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                <div className={slots.iconGrid()}>
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.name}-${index}`}
                      className={slots.iconTileCollapsed()}
                      layoutId={`${collection.id}-${item.id}`}
                      transition={{ ...springConfig, delay: 0.01 }}
                    >
                      <item.icon className="size-4" size={16} />
                    </motion.div>
                  ))}
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
              </motion.div>
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
                    aria-label="Close"
                    className={slots.closeButton()}
                    onClick={() => setIsExpanded(false)}
                    type="button"
                  >
                    <CloseX className="text-current" size={16} />
                  </button>
                </motion.div>

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

  return (
    <div
      className={slots.row()}
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
        <item.icon className="size-6" size={24} />
      </motion.div>
      <motion.div
        animate={{ opacity: 1 }}
        className={slots.rowMeta()}
        initial={{ opacity: 0 }}
      >
        <motion.p className={slots.itemName()}>{item.name}</motion.p>
        <p className={slots.itemPrice()}>{formatPrice(item.price)}</p>
      </motion.div>
      <ChevronRight className={slots.rowChevron()} size={24} />
    </div>
  );
}
