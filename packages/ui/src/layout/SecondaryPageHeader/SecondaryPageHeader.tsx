import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Header } from "../Header/Header";
import { secondaryPageHeaderVariants } from "./SecondaryPageHeader.styles";
import type { SecondaryPageHeaderProps } from "./SecondaryPageHeader.types";

export function SecondaryPageHeader({
  title,
  backAriaLabel = "Back",
  onBack,
  endContent,
  showBack = true,
  className,
}: SecondaryPageHeaderProps) {
  const slots = secondaryPageHeaderVariants();

  return (
    <Header
      appearance="bar"
      className={className}
      endContent={endContent}
      startContent={
        showBack ? (
          <Button
            aria-label={backAriaLabel}
            className={slots.backButton()}
            isIconOnly
            onPress={onBack}
            size="lg"
            variant="tertiary"
          >
            <ChevronLeft className="text-foreground" size={22} />
          </Button>
        ) : undefined
      }
      title={title}
    />
  );
}
