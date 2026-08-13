"use client";

import { useState, type ReactNode } from "react";
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  SearchField,
  Tooltip,
  Typography,
} from "@heroui/react";
import {
  ArrowSignOut1,
  BarbellHorizontal,
  Building2,
  Calendar2,
  ChartTrendUp,
  Database,
  Gear1,
  Headset1,
  House1,
  Image1,
  ListThreeSquare,
  MapPin2,
  Moon,
  Newspaper1,
  PriceTag,
  ShieldCheck,
  SliderLineThreeHorizontal,
  Sun,
  Ticket,
  Trophy1,
  User,
  UsersThree,
  Wallet,
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
  users: <UsersThree size={22} />,
  clubs: <Building2 size={22} />,
  bookings: <Ticket size={22} />,
  finance: <Wallet size={22} />,
  catalogs: <PriceTag size={22} />,
  ops: <ShieldCheck size={22} />,
  locations: <MapPin2 size={22} />,
  sports: <BarbellHorizontal size={22} />,
  choices: <ListThreeSquare size={22} />,
  refs: <Database size={22} />,
  articles: <Newspaper1 size={22} />,
  banners: <Image1 size={22} />,
  gamification: <Trophy1 size={22} />,
  support: <Headset1 size={22} />,
  calendar: <Calendar2 size={22} />,
  profile: <User size={22} />,
  settings: <Gear1 size={22} />,
  analytics: <ChartTrendUp size={22} />,
  logout: <ArrowSignOut1 size={22} />,
};

const NAV_ORDER: AdminDashboardNavId[] = [
  "home",
  "users",
  "clubs",
  "bookings",
  "finance",
  "catalogs",
  "ops",
  "locations",
  "sports",
  "choices",
  "refs",
  "articles",
  "banners",
  "gamification",
  "support",
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
  breadcrumbs = [],
  header,
  className,
}: AdminDashboardLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [uncontrolledActiveId, setUncontrolledActiveId] =
    useState<AdminDashboardNavId>("home");
  const activeNavId = activeNavIdProp ?? uncontrolledActiveId;
  const isDark = resolvedTheme === "dark";
  const colorScheme = isDark ? "dark" : "light";
  const styles = adminDashboardLayoutVariants({ colorScheme });
  const hasCustomHeader = Boolean(header);

  const handleNavPress = (id: AdminDashboardNavId) => {
    if (activeNavIdProp === undefined) {
      setUncontrolledActiveId(id);
    }
    onNavPress?.(id);
  };

  const themeToggle = (
    <Button
      isIconOnly
      size="lg"
      variant="ghost"
      aria-label={isDark ? labels.themeToLight : labels.themeToDark}
      className={
        hasCustomHeader ? styles.themeButtonSection() : styles.themeButton()
      }
      onPress={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );

  return (
    <div className={styles.shell({ className })}>
      <aside className={styles.sidebar()} aria-label={labels.navAriaLabel}>
        <Tooltip delay={300}>
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
          <Tooltip.Content placement="end" showArrow>
            <Tooltip.Arrow />
            {APP_NAME}
          </Tooltip.Content>
        </Tooltip>

        <nav className={styles.nav()}>
          {NAV_ORDER.map((id) => {
            const isActive = id === activeNavId;

            return (
              <div key={id} className={styles.navItemWrap()}>
                {isActive ? <span className={styles.navIndicator()} /> : null}
                <Tooltip delay={300}>
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
                  <Tooltip.Content placement="end" showArrow>
                    <Tooltip.Arrow />
                    {labels.nav[id]}
                  </Tooltip.Content>
                </Tooltip>
              </div>
            );
          })}
        </nav>

        <div className={styles.avatarWrap()}>
          <Badge.Anchor>
            <Tooltip delay={300}>
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
              <Tooltip.Content placement="end" showArrow>
                <Tooltip.Arrow />
                {labels.avatarAlt}
              </Tooltip.Content>
            </Tooltip>
            {notificationCount > 0 ? (
              <Badge color="danger" size="sm">
                {notificationCount}
              </Badge>
            ) : null}
          </Badge.Anchor>
        </div>
      </aside>

      <div className={styles.main()}>
        <header
          className={hasCustomHeader ? styles.headerSection() : styles.header()}
        >
          {breadcrumbs.length > 0 ? (
            <Breadcrumbs
              aria-label={labels.breadcrumbsAriaLabel}
              className={styles.breadcrumbs()}
            >
              {breadcrumbs.map((item, index) => (
                <Breadcrumbs.Item
                  key={`${item.label}-${index}`}
                  className={styles.breadcrumbItem()}
                  onPress={item.onPress}
                >
                  {item.label}
                </Breadcrumbs.Item>
              ))}
            </Breadcrumbs>
          ) : null}
          <div className={styles.headerRow()}>
            {hasCustomHeader ? (
              <>
                <div className="min-w-0 flex-1">{header}</div>
                {themeToggle}
              </>
            ) : (
              <>
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
                {themeToggle}
              </div>
              </>
            )}
          </div>
        </header>

        <main className={styles.content()}>{children}</main>
      </div>
    </div>
  );
}
