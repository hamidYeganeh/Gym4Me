"use client";

import { stagger, transition } from "@repo/theme";
import { motion, type Variants } from "motion/react";
import { ownerHomeStaggerSectionVariants } from "./OwnerHomeStaggerSection.styles";
import type {
  OwnerHomeStaggerItemProps,
  OwnerHomeStaggerSectionProps,
} from "./OwnerHomeStaggerSection.types";

const contentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.children,
      delayChildren: stagger.delayChildren,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition,
  },
};

export function OwnerHomeStaggerSection({
  children,
  reduceMotion,
}: OwnerHomeStaggerSectionProps) {
  const styles = ownerHomeStaggerSectionVariants();

  return (
    <motion.div
      animate="visible"
      className={styles.content()}
      initial={reduceMotion ? false : "hidden"}
      variants={contentVariants}
    >
      {children}
    </motion.div>
  );
}

export function OwnerHomeStaggerItem({ children }: OwnerHomeStaggerItemProps) {
  return <motion.div variants={sectionVariants}>{children}</motion.div>;
}
