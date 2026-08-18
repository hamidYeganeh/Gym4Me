"use client";

import type { Key } from "react";
import { Button } from "@heroui/react/button";
import { SearchField } from "@heroui/react/search-field";
import { Tabs } from "@heroui/react/tabs";
import { SliderLineThreeHorizontal } from "@repo/icons/SliderLineThreeHorizontal";
import { adminSectionHeaderVariants } from "./AdminSectionHeader.styles";
import type { AdminSectionHeaderProps } from "./AdminSectionHeader.types";

export function AdminSectionHeader({
  tabs = [],
  activeTabId,
  onTabPress,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  filtersAriaLabel,
  onFilterPress,
  className,
  endContent,
}: AdminSectionHeaderProps) {
  const styles = adminSectionHeaderVariants();

  return (
    <div className={styles.root({ className })}>
      {tabs.length > 0 && activeTabId ? (
        <Tabs
          className={styles.tabs()}
          selectedKey={activeTabId}
          variant="secondary"
          onSelectionChange={(key: Key) => onTabPress?.(String(key))}
        >
          <Tabs.ListContainer className={styles.tabsListContainer()}>
            <Tabs.List aria-label="section" className={styles.tabsList()}>
              {tabs.map((tab) => (
                <Tabs.Tab key={tab.id} id={tab.id}>
                  {tab.label}
                  <Tabs.Indicator className={styles.tabIndicator()} />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          {tabs.map((tab) => (
            <Tabs.Panel key={tab.id} className="hidden" id={tab.id}>
              {null}
            </Tabs.Panel>
          ))}
        </Tabs>
      ) : (
        <div />
      )}

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SearchField
          aria-label={searchAriaLabel}
          autoComplete="off"
          className={styles.search()}
          name="admin-section-search"
          value={searchValue}
          variant="secondary"
          onChange={onSearchChange}
        >
          <SearchField.Group className={styles.searchGroup()}>
            <SearchField.SearchIcon className={styles.searchIcon()} />
            <SearchField.Input
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              className={styles.searchInput()}
              placeholder={searchPlaceholder}
              spellCheck={false}
            />
            <Button
              isIconOnly
              size="lg"
              variant="ghost"
              aria-label={filtersAriaLabel}
              className={styles.filterButton()}
              onPress={onFilterPress}
            >
              <SliderLineThreeHorizontal size={18} />
            </Button>
          </SearchField.Group>
        </SearchField>
        {endContent}
      </div>
    </div>
  );
}
