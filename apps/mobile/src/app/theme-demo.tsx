"use client";

import { Button, Card, Chip, Surface } from "@heroui/react";
import {
  BarbellHorizontal,
  Gear1,
  Heart,
  House1,
  Kettlebell,
  Moon,
  Sun,
  User,
} from "@repo/icons";
import { useTheme } from "@repo/theme";
import { useEffect, useState } from "react";

type ThemeDemoLabels = {
  primaryAction: string;
  secondaryAction: string;
  variantsLabel: string;
  surfacesLabel: string;
  chipsLabel: string;
  iconsLabel: string;
  themeLight: string;
  themeDark: string;
  chipNew: string;
  chipSuccess: string;
  chipWarning: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
};

export function ThemeDemo({ labels }: { labels: ThemeDemoLabels }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? (resolvedTheme ?? theme) : "dark";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-3">
        <Button
          variant={activeTheme === "light" ? undefined : "outline"}
          onPress={() => setTheme("light")}
          className="gap-2"
        >
          <Sun size={18} />
          {labels.themeLight}
        </Button>
        <Button
          variant={activeTheme === "dark" ? undefined : "outline"}
          onPress={() => setTheme("dark")}
          className="gap-2"
        >
          <Moon size={18} />
          {labels.themeDark}
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.iconsLabel}
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-foreground">
          <House1 size={28} />
          <BarbellHorizontal size={28} />
          <Kettlebell size={28} />
          <Heart size={28} />
          <User size={28} />
          <Gear1 size={28} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.variantsLabel}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2">
            <BarbellHorizontal size={18} />
            {labels.primaryAction}
          </Button>
          <Button variant="secondary">{labels.secondaryAction}</Button>
          <Button variant="tertiary">{labels.secondaryAction}</Button>
          <Button variant="outline">{labels.secondaryAction}</Button>
          <Button variant="ghost">{labels.secondaryAction}</Button>
          <Button variant="danger">{labels.secondaryAction}</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.chipsLabel}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Chip color="accent">{labels.chipNew}</Chip>
          <Chip color="success">{labels.chipSuccess}</Chip>
          <Chip color="warning">{labels.chipWarning}</Chip>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">
          {labels.surfacesLabel}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Surface variant="default" className="rounded-xl p-4">
            <p className="text-sm text-foreground">{labels.surfacePrimary}</p>
          </Surface>
          <Surface variant="secondary" className="rounded-xl p-4">
            <p className="text-sm text-foreground">{labels.surfaceSecondary}</p>
          </Surface>
          <Surface variant="tertiary" className="rounded-xl p-4">
            <p className="text-sm text-foreground">{labels.surfaceTertiary}</p>
          </Surface>
        </div>
      </section>

      <Card>
        <Card.Header>
          <Card.Title>{labels.primaryAction}</Card.Title>
          <Card.Description>{labels.secondaryAction}</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">{labels.primaryAction}</Button>
            <Button size="sm" variant="outline">
              {labels.secondaryAction}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
