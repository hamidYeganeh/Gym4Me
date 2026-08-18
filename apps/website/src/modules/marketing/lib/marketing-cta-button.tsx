"use client";

import { buttonVariants } from "@heroui/react/button";
import { ArrowForward1 } from "@repo/icons/ArrowForward1";
import { BookOpen } from "@repo/icons/BookOpen";

type MarketingCtaButtonProps = {
  href: string;
  label: string;
  variant?: "primary" | "outline";
};

export function MarketingCtaButton({
  href,
  label,
  variant = "primary",
}: MarketingCtaButtonProps) {
  const Icon = variant === "primary" ? ArrowForward1 : BookOpen;

  return (
    <a
      href={href}
      data-load="false"
      className={buttonVariants({
        size: "lg",
        variant,
        className: "marketing-cta rounded-(--radius) font-semibold",
      })}
    >
      <Icon size={20} />
      {label}
    </a>
  );
}
