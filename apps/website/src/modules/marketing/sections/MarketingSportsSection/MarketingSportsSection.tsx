"use client";

import { Button } from "@heroui/react/button";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Basketball } from "@repo/icons/Basketball";
import { Boxing } from "@repo/icons/Boxing";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { JumpingRope } from "@repo/icons/JumpingRope";
import { Kettlebell } from "@repo/icons/Kettlebell";
import { MapPin1 } from "@repo/icons/MapPin1";
import { Medal } from "@repo/icons/Medal";
import { PersonBiking } from "@repo/icons/PersonBiking";
import { PersonRunning } from "@repo/icons/PersonRunning";
import { PersonSwimming } from "@repo/icons/PersonSwimming";
import { PersonYoga } from "@repo/icons/PersonYoga";
import { Soccer } from "@repo/icons/Soccer";
import { Stopwatch } from "@repo/icons/Stopwatch";
import { Tennis } from "@repo/icons/Tennis";
import { Trophy1 } from "@repo/icons/Trophy1";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { MouseEvent, MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "../../lib/marketing-cn";
import { marketingSportsSectionStyles } from "./MarketingSportsSection.styles";
import type {
  MarketingSportsIcon,
  MarketingSportsSectionProps,
} from "./MarketingSportsSection.types";

const DEFAULT_ICONS: MarketingSportsIcon[] = [
  { id: 1, icon: BarbellHorizontal, className: "top-[10%] left-[10%]", tone: "glass" },
  { id: 2, icon: PersonRunning, className: "top-[18%] right-[8%]", tone: "solid" },
  { id: 3, icon: Basketball, className: "top-[78%] left-[10%]", tone: "glass" },
  { id: 4, icon: PersonYoga, className: "bottom-[10%] right-[10%]", tone: "solid" },
  { id: 5, icon: Kettlebell, className: "top-[6%] left-[32%]", tone: "glass" },
  { id: 6, icon: PersonSwimming, className: "top-[8%] right-[30%]", tone: "glass" },
  { id: 7, icon: Trophy1, className: "bottom-[8%] left-[26%]", tone: "solid" },
  { id: 8, icon: Boxing, className: "top-[40%] left-[14%]", tone: "glass" },
  { id: 9, icon: PersonBiking, className: "top-[72%] right-[24%]", tone: "glass" },
  { id: 10, icon: Medal, className: "top-[88%] left-[68%]", tone: "solid" },
  { id: 11, icon: Stopwatch, className: "top-[48%] right-[6%]", tone: "glass" },
  { id: 12, icon: HeartEcg, className: "top-[54%] left-[5%]", tone: "solid" },
  { id: 13, icon: JumpingRope, className: "top-[6%] left-[56%]", tone: "glass" },
  { id: 14, icon: Tennis, className: "bottom-[6%] right-[44%]", tone: "glass" },
  { id: 15, icon: Soccer, className: "top-[26%] right-[20%]", tone: "solid" },
  { id: 16, icon: MapPin1, className: "top-[58%] left-[30%]", tone: "glass" },
];

function FloatingSportIcon({
  mouseX,
  mouseY,
  iconData,
  index,
  reduceMotion,
  solidClassName,
  glassClassName,
}: {
  mouseX: MutableRefObject<number>;
  mouseY: MutableRefObject<number>;
  iconData: MarketingSportsIcon;
  index: number;
  reduceMotion: boolean;
  solidClassName: string;
  glassClassName: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const isSolid = iconData.tone === "solid";
  const Icon = iconData.icon;

  useEffect(() => {
    if (reduceMotion) return;

    const handleMouseMove = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(
        mouseX.current - centerX,
        mouseY.current - centerY,
      );

      if (distance < 150) {
        const angle = Math.atan2(
          mouseY.current - centerY,
          mouseX.current - centerX,
        );
        const force = (1 - distance / 150) * 50;
        x.set(-Math.cos(angle) * force);
        y.set(-Math.sin(angle) * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reduceMotion, x, y]);

  return (
    <motion.div
      ref={ref}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.06,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("absolute", iconData.className)}
      aria-hidden
    >
      <motion.div
        className={isSolid ? solidClassName : glassClassName}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -8, 0, 8, 0],
                x: [0, 6, 0, -6, 0],
                rotate: [0, 5, 0, -5, 0],
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: [0.45, 0, 0.55, 1],
          delay: (index % 4) * 0.2,
        }}
      >
        <Icon size={36} />
      </motion.div>
    </motion.div>
  );
}

export function MarketingSportsSection({
  className,
  ...props
}: MarketingSportsSectionProps) {
  const t = useTranslations("MarketingLanding.sports");
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const reduceMotion = useReducedMotion() ?? false;
  const slots = marketingSportsSectionStyles();
  const ctaHref = t("ctaHref");

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    mouseX.current = event.clientX;
    mouseY.current = event.clientY;
  };

  const handleCtaPress = () => {
    if (ctaHref.startsWith("#")) {
      document.querySelector(ctaHref)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.location.assign(ctaHref);
  };

  return (
    <section
      id="programs"
      dir="rtl"
      onMouseMove={handleMouseMove}
      className={slots.root({ className })}
      {...props}
    >
      <div className={slots.grid()} aria-hidden />

      <div className={slots.icons()}>
        {DEFAULT_ICONS.map((iconData, index) => (
          <FloatingSportIcon
            key={iconData.id}
            mouseX={mouseX}
            mouseY={mouseY}
            iconData={iconData}
            index={index}
            reduceMotion={reduceMotion}
            solidClassName={slots.iconSolid()}
            glassClassName={slots.iconGlass()}
          />
        ))}
      </div>

      <div className={slots.copy()}>
        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={slots.title()}
        >
          {t("title")}
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={slots.subtitle()}
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.14, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={slots.ctaWrap()}
        >
          <Button size="lg" onPress={handleCtaPress} className={slots.cta()}>
            {t("ctaText")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
