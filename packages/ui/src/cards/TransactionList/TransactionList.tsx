"use client";

import { ArrowRight } from "@repo/icons/ArrowRight";
import { CloseX } from "@repo/icons/CloseX";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Transition,
} from "motion/react";
import { useState } from "react";
import useMeasure from "react-use-measure";
import { transactionListVariants } from "./TransactionList.styles";
import type {
  TransactionListItem,
  TransactionListProps,
} from "./TransactionList.types";

const springConfig: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.6,
};

const opacityConfig: Transition = {
  duration: 0.4,
  ease: [0.19, 1, 0.22, 1],
};

export function TransactionList({
  transactions,
  title = "Transaction",
  allTransactionsLabel = "All transactions",
  closeLabel = "Close",
  paidViaLabel = "Paid Via",
  onAllTransactionsPress,
  className,
  ...props
}: TransactionListProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [ref, bounds] = useMeasure();
  const slots = transactionListVariants();
  const selected = transactions.find((t) => t.id === open) ?? null;
  const isCollapsed = open === null;

  return (
    <div className="w-full" {...props}>
      <MotionConfig transition={springConfig}>
        <motion.div
          animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
          className={slots.root({ className })}
        >
          <div className={slots.inner()} ref={ref}>
            <AnimatePresence mode="popLayout">
              {isCollapsed ? (
                <motion.div
                  key="collapsed"
                  animate={{ opacity: 1 }}
                  className={slots.list()}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  transition={opacityConfig}
                >
                  <span className={slots.heading()}>{title}</span>

                  {transactions.map((item) => (
                    <TransactionItem
                      key={item.id}
                      data={item}
                      onOpen={() => setOpen(item.id)}
                      slots={slots}
                    />
                  ))}

                  <button
                    className={slots.footer()}
                    onClick={onAllTransactionsPress}
                    type="button"
                  >
                    <p className={slots.footerLabel()}>{allTransactionsLabel}</p>
                    <ArrowRight className={slots.footerIcon()} size={14} />
                  </button>
                </motion.div>
              ) : (
                selected && (
                  <motion.div
                    key={`expanded-${selected.id}`}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  >
                    <TransactionItemExpanded
                      closeLabel={closeLabel}
                      data={selected}
                      onClose={() => setOpen(null)}
                      paidViaLabel={paidViaLabel}
                      slots={slots}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}

type Slots = ReturnType<typeof transactionListVariants>;

function TransactionItem({
  data,
  onOpen,
  slots,
}: {
  data: TransactionListItem;
  onOpen: () => void;
  slots: Slots;
}) {
  return (
    <button className={slots.item()} onClick={onOpen} type="button">
      <motion.div
        className={slots.iconTile()}
        layout="position"
        layoutId={`transaction-icon-${data.id}`}
      >
        <div className="flex items-center justify-center">{data.icon}</div>
      </motion.div>

      <div className={slots.itemBody()}>
        <motion.p
          className={slots.name()}
          layout="position"
          layoutId={`transaction-name-${data.id}`}
        >
          {data.name}
        </motion.p>

        <motion.p
          className={slots.category()}
          layout="position"
          layoutId={`transaction-category-${data.id}`}
        >
          {data.category}
        </motion.p>
      </div>

      <motion.p
        className={slots.amount()}
        layout="position"
        layoutId={`transaction-amount-${data.id}`}
      >
        {data.amount}
      </motion.p>
    </button>
  );
}

function TransactionItemExpanded({
  data,
  onClose,
  closeLabel,
  paidViaLabel,
  slots,
}: {
  data: TransactionListItem;
  onClose: () => void;
  closeLabel: string;
  paidViaLabel: string;
  slots: Slots;
}) {
  return (
    <div className={slots.expanded()}>
      <div className={slots.expandedHeader()}>
        <motion.div
          className={slots.iconTileExpanded()}
          layout="position"
          layoutId={`transaction-icon-${data.id}`}
        >
          {data.icon}
        </motion.div>

        <button
          aria-label={closeLabel}
          className={slots.closeButton()}
          onClick={onClose}
          type="button"
        >
          <CloseX className={slots.closeIcon()} size={16} />
        </button>
      </div>

      <div className={slots.expandedMeta()}>
        <div>
          <motion.p
            className={slots.name()}
            layout="position"
            layoutId={`transaction-name-${data.id}`}
          >
            {data.name}
          </motion.p>

          <motion.p
            className={slots.categoryExpanded()}
            layout="position"
            layoutId={`transaction-category-${data.id}`}
          >
            {data.category}
          </motion.p>
        </div>

        <motion.p
          className={slots.amountExpanded()}
          layout="position"
          layoutId={`transaction-amount-${data.id}`}
        >
          {data.amount}
        </motion.p>
      </div>

      <motion.div
        animate={{ opacity: 1 }}
        className={slots.details()}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{
          ...opacityConfig,
          delay: 0.1,
        }}
      >
        <div className={slots.divider()} />

        <p>#{data.transactionId}</p>
        <p>{data.date}</p>
        <p>{data.time}</p>

        <div className={slots.divider()} />

        <p>
          {paidViaLabel} {data.paymentMethod}
        </p>

        <p>
          XXXX {data.cardNumber}{" "}
          <span className={slots.cardType()}>{data.cardType}</span>
        </p>
      </motion.div>
    </div>
  );
}
