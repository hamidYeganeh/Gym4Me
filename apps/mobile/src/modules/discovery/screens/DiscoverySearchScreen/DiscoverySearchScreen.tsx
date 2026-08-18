"use client";

import { Button } from "@heroui/react/button";
import { SearchField } from "@heroui/react/search-field";
import { Typography } from "@heroui/react/typography";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Clock } from "@repo/icons/Clock";
import { Funnel1 } from "@repo/icons/Funnel1";
import { MapPin1 } from "@repo/icons/MapPin1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicUser } from "@repo/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  DISCOVERY_MOCK_ADDRESSES,
  formatAddressLine,
  type DiscoveryAddressItem,
} from "../../lib/discovery-addresses-data";
import {
  pushDiscoverySearchHistory,
  readDiscoverySearchHistory,
  type DiscoverySearchHistoryItem,
} from "../../lib/discovery-search-history";
import { DiscoveryLocationSheet } from "../../sections/DiscoveryLocationSheet";
import { discoverySearchScreenStyles as styles } from "./DiscoverySearchScreen.styles";
import type { DiscoverySearchScreenProps } from "./DiscoverySearchScreen.types";

function profileAddressItem(
  user: PublicUser | null,
  label: string,
): DiscoveryAddressItem | null {
  if (!user) return null;
  const line = formatAddressLine(user.address);
  if (!line) return null;
  return {
    id: "profile",
    label,
    line,
    city: user.address.city?.trim() || label,
  };
}

export function DiscoverySearchScreen({
  className,
}: DiscoverySearchScreenProps) {
  const t = useTranslations("DiscoverySearch");
  const tHome = useTranslations("DiscoveryHome");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<DiscoverySearchHistoryItem[]>([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setHistory(readDiscoverySearchHistory());
  }, []);

  const profile = profileAddressItem(user, tHome("locationProfileLabel"));
  const addresses = profile
    ? [
        profile,
        ...DISCOVERY_MOCK_ADDRESSES.filter((item) => item.id !== "home"),
      ]
    : DISCOVERY_MOCK_ADDRESSES;

  const selectedAddress =
    addresses.find((item) => item.id === selectedAddressId) ??
    addresses[0] ??
    null;

  const locationLine =
    selectedAddress?.line ||
    selectedAddress?.city ||
    selectedAddress?.label ||
    tHome("locationFallback");

  const commitSearch = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setHistory(pushDiscoverySearchHistory(trimmed));
    setQuery(trimmed);
    router.push(
      `/discovery/coaches?q=${encodeURIComponent(trimmed)}`,
    );
  };

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <>
          <div aria-hidden className={styles.headerSpacer} />
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.toolbar}>
                <Button
                  aria-label={t("back")}
                  className={styles.iconButton}
                  isIconOnly
                  onPress={() => router.back()}
                  size="lg"
                  variant="ghost"
                >
                  <ChevronLeft size={22} />
                </Button>

                <SearchField
                  aria-label={t("searchAria")}
                  autoFocus
                  className={styles.searchField}
                  name="discovery-search"
                  value={query}
                  variant="secondary"
                  onChange={setQuery}
                  onSubmit={commitSearch}
                >
                  <SearchField.Group className={styles.searchGroup}>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder={t("placeholder")} />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>

                <Button
                  aria-label={t("filterAria")}
                  className={styles.iconButton}
                  isIconOnly
                  onPress={() => router.push("/discovery/coaches")}
                  size="lg"
                  variant="ghost"
                >
                  <Funnel1 size={22} />
                </Button>
              </div>

              <Button
                aria-expanded={isLocationOpen}
                aria-haspopup="dialog"
                aria-label={t("locationAria", { location: locationLine })}
                className={styles.locationButton}
                onPress={() => setIsLocationOpen(true)}
                variant="secondary"
              >
                <MapPin1 className={styles.locationPin} size={20} />
                <span className={styles.locationLabel}>{locationLine}</span>
                <ChevronDown className={styles.locationChevron} size={16} />
              </Button>
            </div>
          </header>

          <DiscoveryLocationSheet
            addresses={addresses}
            addLabel={tHome("locationSheetAdd")}
            closeLabel={tHome("locationSheetClose")}
            description={tHome("locationSheetDescription")}
            emptyLabel={tHome("locationSheetEmpty")}
            isOpen={isLocationOpen}
            onAddNew={() =>
              router.push(
                isAuthenticated ? "/athlete/profile/edit" : "/auth/login",
              )
            }
            onOpenChange={setIsLocationOpen}
            onSelect={setSelectedAddressId}
            selectedId={selectedAddress?.id ?? ""}
            title={tHome("locationSheetTitle")}
            updateLabel={tHome("locationSheetUpdate")}
          />
        </>
      }
    >
      <div className={styles.content}>
        <Typography className={styles.sectionTitle} type="h4" weight="bold">
          {t("latestTitle")}
        </Typography>

        {history.length === 0 ? (
          <Typography className={styles.empty} type="body-sm">
            {t("latestEmpty")}
          </Typography>
        ) : (
          <div className={styles.historyList} role="list">
            {history.map((item) => (
              <div key={`${item.query}-${item.savedAt}`} role="listitem">
                <Button
                  aria-label={t("latestItemAria", { query: item.query })}
                  className={styles.historyItem}
                  variant="ghost"
                  onPress={() => commitSearch(item.query)}
                >
                  <Clock className={styles.historyIcon} size={18} />
                  <span className={styles.historyQuery}>{item.query}</span>
                  <ArrowUpRight
                    aria-hidden
                    className={styles.historyAction}
                    size={18}
                  />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
