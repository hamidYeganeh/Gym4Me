"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { SearchField } from "@heroui/react/search-field";
import { Typography } from "@heroui/react/typography";
import { Bell1 } from "@repo/icons/Bell1";
import { CloseX } from "@repo/icons/CloseX";
import { MagnifyingGlass } from "@repo/icons/MagnifyingGlass";
import { Sparkle2 } from "@repo/icons/Sparkle2";
import { useTranslations } from "next-intl";
import { greetingPeriod, initialsFromLabel } from "../../lib/community-data";
import { communityHomeHeaderSectionVariants } from "./CommunityHomeHeaderSection.styles";
import type { CommunityHomeHeaderSectionProps } from "./CommunityHomeHeaderSection.types";

const GREETING_KEYS = {
  morning: "greetingMorning",
  afternoon: "greetingAfternoon",
  evening: "greetingEvening",
  night: "greetingNight",
} as const;

export function CommunityHomeHeaderSection({
  firstName,
  avatarSrc,
  isPro = false,
  isSearchOpen = false,
  searchValue = "",
  onSearchChange,
  onNotificationPress,
  onSearchPress,
  className,
}: CommunityHomeHeaderSectionProps) {
  const t = useTranslations("CommunityHome");
  const slots = communityHomeHeaderSectionVariants();
  const greeting = t(GREETING_KEYS[greetingPeriod()], { name: firstName });

  return (
    <header className={slots.root({ className })}>
      <div className={slots.bar()}>
        <div className={slots.identity()}>
          <Avatar className={slots.avatar()} size="lg">
            {avatarSrc ? (
              <Avatar.Image alt={firstName} src={avatarSrc} />
            ) : null}
            <Avatar.Fallback>{initialsFromLabel(firstName)}</Avatar.Fallback>
          </Avatar>
          <div className={slots.copy()}>
            <Typography className={slots.greeting()} type="h3" weight="bold">
              {greeting}
            </Typography>
            <Typography className={slots.status()} type="body-sm">
              <span>{t("roleLabel")}</span>
              {isPro ? (
                <>
                  <span aria-hidden className={slots.statusDot()}>
                    •
                  </span>
                  <Sparkle2 className={slots.proIcon()} size={14} />
                  <span>{t("proLabel")}</span>
                </>
              ) : null}
            </Typography>
          </div>
        </div>
        <div className={slots.actions()}>
          <Button
            aria-label={t("notifications")}
            className={slots.notifyButton()}
            isIconOnly
            onPress={onNotificationPress}
            size="lg"
            variant="outline"
          >
            <Bell1 size={20} />
          </Button>
          <Button
            aria-label={isSearchOpen ? t("closeSearch") : t("search")}
            className={slots.searchButton()}
            isIconOnly
            onPress={onSearchPress}
            size="lg"
            variant="secondary"
          >
            {isSearchOpen ? <CloseX size={20} /> : <MagnifyingGlass size={20} />}
          </Button>
        </div>
      </div>
      {isSearchOpen ? (
        <div className={slots.searchRow()}>
          <SearchField
            aria-label={t("searchAria")}
            autoComplete="off"
            autoFocus
            className={slots.searchField()}
            name="community-search"
            value={searchValue}
            variant="secondary"
            onChange={onSearchChange}
          >
            <SearchField.Group className={slots.searchGroup()}>
              <SearchField.SearchIcon />
              <SearchField.Input
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder={t("searchPlaceholder")}
                spellCheck={false}
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
      ) : null}
    </header>
  );
}
