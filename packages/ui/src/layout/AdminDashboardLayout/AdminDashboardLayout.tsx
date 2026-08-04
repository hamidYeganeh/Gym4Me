"use client";

import { useState, type ReactNode } from "react";
import { Avatar, Badge, Button, SearchField, Typography } from "@heroui/react";
import {
  ArrowSignOut1,
  Calendar2,
  ChartTrendUp,
  Gear1,
  House1,
  Moon,
  SliderLineThreeHorizontal,
  Sun,
  User,
} from "@repo/icons";
import { useTheme } from "@repo/theme";
import { Logo } from "../../common/Logo";
import { adminDashboardLayoutVariants } from "./AdminDashboardLayout.styles";
import type {
  AdminDashboardLayoutProps,
  AdminDashboardNavId,
} from "./AdminDashboardLayout.types";

const APP_NAME = "Gym4Me";

const DEFAULT_AVATAR =
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg";

const NAV_ICONS: Record<AdminDashboardNavId, ReactNode> = {
  home: <House1 size={22} />,
  calendar: <Calendar2 size={22} />,
  profile: <User size={22} />,
  settings: <Gear1 size={22} />,
  analytics: <ChartTrendUp size={22} />,
  logout: <ArrowSignOut1 size={22} />,
};

const NAV_ORDER: AdminDashboardNavId[] = [
  "home",
  "calendar",
  "profile",
  "settings",
  "analytics",
  "logout",
];

export function AdminDashboardLayout({
  children,
  labels,
  activeNavId: activeNavIdProp,
  onNavPress,
  onLogoPress,
  onFilterPress,
  onAvatarPress,
  avatarSrc = DEFAULT_AVATAR,
  notificationCount = 2,
  className,
}: AdminDashboardLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [uncontrolledActiveId, setUncontrolledActiveId] =
    useState<AdminDashboardNavId>("home");
  const activeNavId = activeNavIdProp ?? uncontrolledActiveId;
  const styles = adminDashboardLayoutVariants();
  const isDark = resolvedTheme === "dark";

  const handleNavPress = (id: AdminDashboardNavId) => {
    if (activeNavIdProp === undefined) {
      setUncontrolledActiveId(id);
    }
    onNavPress?.(id);
  };

  return (
    <div className={styles.shell({ className })}>
      <aside className={styles.sidebar()} aria-label={labels.navAriaLabel}>
        <Button
          isIconOnly
          size="lg"
          variant="ghost"
          aria-label={APP_NAME}
          className={styles.logoButton()}
          onPress={onLogoPress}
        >
          <Logo color="var(--accent-foreground)" shadow={false} size="sm" />
        </Button>

        <nav className={styles.nav()}>
          {NAV_ORDER.map((id) => {
            const isActive = id === activeNavId;

            return (
              <div key={id} className={styles.navItemWrap()}>
                {isActive ? <span className={styles.navIndicator()} /> : null}
                <Button
                  isIconOnly
                  size="lg"
                  variant={isActive ? "secondary" : "primary"}
                  aria-label={labels.nav[id]}
                  aria-current={isActive ? "page" : undefined}
                  className={styles.navItem()}
                  onPress={() => handleNavPress(id)}
                >
                  {NAV_ICONS[id]}
                </Button>
              </div>
            );
          })}
        </nav>

        <div className={styles.avatarWrap()}>
          <Badge.Anchor>
            <Button
              isIconOnly
              size="lg"
              variant="ghost"
              aria-label={labels.avatarAlt}
              className={styles.logoButton()}
              onPress={onAvatarPress}
            >
              <Avatar className={styles.avatar()} size="lg">
                <Avatar.Image alt={labels.avatarAlt} src={avatarSrc} />
                <Avatar.Fallback>
                  {labels.avatarAlt.slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
            </Button>
            {notificationCount > 0 ? (
              <Badge color="danger" size="sm">
                {notificationCount}
              </Badge>
            ) : null}
          </Badge.Anchor>
        </div>
      </aside>

      <div className={styles.main()}>
        <header className={styles.header()}>
          <Typography className={styles.greeting()} type="h3" weight="bold">
            {labels.greeting}
          </Typography>

          <div className={styles.headerActions()}>
            <SearchField
              aria-label={labels.searchAriaLabel}
              className={styles.search()}
              name="admin-search"
              variant="secondary"
            >
              <SearchField.Group className={styles.searchGroup()}>
                <SearchField.SearchIcon />
                <SearchField.Input
                  className={styles.searchInput()}
                  placeholder={labels.searchPlaceholder}
                />
                <Button
                  isIconOnly
                  size="lg"
                  variant="ghost"
                  aria-label={labels.filtersAriaLabel}
                  className={styles.filterButton()}
                  onPress={onFilterPress}
                >
                  <SliderLineThreeHorizontal size={18} />
                </Button>
              </SearchField.Group>
            </SearchField>

            <Button
              isIconOnly
              size="lg"
              variant="ghost"
              aria-label={isDark ? labels.themeToLight : labels.themeToDark}
              className={styles.themeButton()}
              onPress={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </header>

        <main className={styles.content()}>{children}</main>
      </div>
    </div>
  );
}
