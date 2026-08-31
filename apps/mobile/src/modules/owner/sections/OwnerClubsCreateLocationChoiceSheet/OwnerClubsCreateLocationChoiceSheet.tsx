"use client";

import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Typography } from "@heroui/react/typography";
import { ownerClubsCreateLocationChoiceSheetVariants } from "./OwnerClubsCreateLocationChoiceSheet.styles";
import type { OwnerClubsCreateLocationChoiceSheetProps } from "./OwnerClubsCreateLocationChoiceSheet.types";

export function OwnerClubsCreateLocationChoiceSheet({
  title,
  options,
  value,
  emptyLabel,
  isOpen,
  onClose,
  onSelect,
}: OwnerClubsCreateLocationChoiceSheetProps) {
  const styles = ownerClubsCreateLocationChoiceSheetVariants();

  return (
    <Drawer.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Content placement="bottom">
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{title}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className={styles.body()}>
            {options.length === 0 ? (
              <Typography className={styles.empty()} type="body-sm">
                {emptyLabel}
              </Typography>
            ) : (
              <div aria-label={title} className={styles.wheel()} role="listbox">
                {options.map((option) => (
                  <Button size="lg"
                    aria-selected={value === option.id}
                    className={styles.wheelItem()}
                    data-selected={value === option.id || undefined}
                    key={option.id}
                    onPress={() => onSelect(option)}
                    variant="ghost"
                  >
                    {option.name}
                  </Button>
                ))}
              </div>
            )}
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
