"use client";

import { Button } from "@heroui/react";
import { Moon, Sun } from "@repo/icons";
import { useThemeTransition } from "@repo/theme";
import { useTranslations } from "next-intl";

export function MarketingThemeToggle() {
  const t = useTranslations("MarketingLanding.header");
  const { isDark, mounted, toggleThemeWithTransition } = useThemeTransition();

  return (
    <Button
      isIconOnly
      size="lg"
      variant="ghost"
      aria-label={t("themeToggle")}
      aria-pressed={mounted ? isDark : undefined}
      className="marketing-theme-toggle rounded-(--radius) text-(--color-header-text,currentColor)"
      onPress={() => {
        void toggleThemeWithTransition();
      }}
    >
      {mounted && isDark ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
}
