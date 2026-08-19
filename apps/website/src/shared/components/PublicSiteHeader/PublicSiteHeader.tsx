"use client";

import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { MenuLeft } from "@repo/icons/MenuLeft";
import { Moon } from "@repo/icons/Moon";
import { Sun } from "@repo/icons/Sun";
import { Logo } from "@repo/ui/common/Logo";
import { useThemeTransition } from "@repo/theme";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  publicSiteFooterVariants,
  publicSiteHeaderVariants,
} from "./PublicSiteHeader.styles";

const header = publicSiteHeaderVariants();
const footer = publicSiteFooterVariants();

const NAV_ITEMS = [
  { href: "/clubs", key: "clubs" },
  { href: "/coaches", key: "coaches" },
  { href: "/for-clubs", key: "forClubs" },
  { href: "/pricing", key: "pricing" },
  { href: "/articles", key: "articles" },
] as const;

function SiteThemeToggle() {
  const t = useTranslations("PublicSite");
  const { isDark, mounted, toggleThemeWithTransition } = useThemeTransition();

  return (
    <Button
      aria-label={t("themeToggle")}
      aria-pressed={mounted ? isDark : undefined}
      isIconOnly
      size="lg"
      variant="ghost"
      onPress={() => {
        void toggleThemeWithTransition();
      }}
    >
      {mounted && isDark ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
}

export function PublicSiteHeader() {
  const t = useTranslations("PublicSite");

  return (
    <header className={header.root()}>
      <div className={header.inner()}>
        <Link className={header.brand()} href="/">
          <Logo className={header.brandMark()} size="sm" title={t("brand")} />
          <span>{t("brand")}</span>
        </Link>
        <nav aria-label={t("navAria")} className={header.nav()}>
          {NAV_ITEMS.map((item) => (
            <Link className={header.link()} href={item.href} key={item.href}>
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className={header.actions()}>
          <SiteThemeToggle />
          <Drawer>
            <Button
              aria-label={t("menuAria")}
              className={header.menuTrigger()}
              isIconOnly
              size="lg"
              variant="ghost"
            >
              <MenuLeft size={20} />
            </Button>
            <Drawer.Backdrop>
              <Drawer.Content
                className={header.drawerContent()}
                placement="left"
              >
                <Drawer.Dialog className={header.drawerDialog()}>
                  <Drawer.CloseTrigger />
                  <Drawer.Header>
                    <Drawer.Heading>{t("menuTitle")}</Drawer.Heading>
                  </Drawer.Header>
                  <Drawer.Body className={header.drawerBody()}>
                    <nav aria-label={t("navAria")}>
                      {NAV_ITEMS.map((item) => (
                        <Link
                          className={header.drawerLink()}
                          href={item.href}
                          key={item.href}
                        >
                          {t(item.key)}
                        </Link>
                      ))}
                    </nav>
                  </Drawer.Body>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </div>
      </div>
    </header>
  );
}

export function PublicSiteFooter() {
  const t = useTranslations("PublicSite");

  return (
    <footer className={footer.root()}>
      <div className={footer.inner()}>
        <span>{t("copyright")}</span>
        <span>{t("tagline")}</span>
      </div>
    </footer>
  );
}
