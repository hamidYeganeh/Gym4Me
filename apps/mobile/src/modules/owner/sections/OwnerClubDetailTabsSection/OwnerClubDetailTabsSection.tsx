import { Button } from "@heroui/react";
import { ownerClubDetailTabsSectionVariants } from "./OwnerClubDetailTabsSection.styles";
import type { OwnerClubDetailTabsSectionProps } from "./OwnerClubDetailTabsSection.types";

export function OwnerClubDetailTabsSection({
  tabs,
  activeTab,
  ariaLabel,
  onTabChange,
  className,
}: OwnerClubDetailTabsSectionProps) {
  const styles = ownerClubDetailTabsSectionVariants();

  return (
    <div
      aria-label={ariaLabel}
      className={styles.root({ className })}
      role="group"
    >
      {tabs.map((tab) => (
        <Button
          className={styles.tabChip()}
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          size="sm"
          variant={activeTab === tab.id ? "primary" : "ghost"}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
