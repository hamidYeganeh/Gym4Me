"use client";

import { Button, Drawer, Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { CloseX } from "@repo/icons/CloseX";
import { House1 } from "@repo/icons/House1";
import { Plus } from "@repo/icons/Plus";
import { useEffect, useState } from "react";
import { discoveryLocationSheetVariants } from "./DiscoveryLocationSheet.styles";
import type { DiscoveryLocationSheetProps } from "./DiscoveryLocationSheet.types";

export function DiscoveryLocationSheet({
  isOpen,
  onOpenChange,
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  title,
  description,
  emptyLabel,
  addLabel,
  updateLabel,
  closeLabel,
}: DiscoveryLocationSheetProps) {
  const styles = discoveryLocationSheetVariants();
  const [draftId, setDraftId] = useState(selectedId);

  useEffect(() => {
    if (isOpen) {
      setDraftId(selectedId);
    }
  }, [isOpen, selectedId]);

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="bottom">
        <Drawer.Dialog className={styles.dialog()}>
          <Drawer.Handle />
          <Drawer.CloseTrigger
            aria-label={closeLabel}
            className={styles.close()}
          >
            <CloseX size={20} />
          </Drawer.CloseTrigger>
          <Drawer.Header className={styles.header()}>
            <Drawer.Heading className={styles.heading()}>{title}</Drawer.Heading>
            <Typography className={styles.description()} type="body-sm">
              {description}
            </Typography>
          </Drawer.Header>
          <Drawer.Body className={styles.body()}>
            {addresses.length === 0 ? (
              <Typography className={styles.empty()} type="body-sm">
                {emptyLabel}
              </Typography>
            ) : (
              <div className={styles.list()} role="listbox">
                {addresses.map((address) => {
                  const selected = address.id === draftId;
                  const itemSlots = discoveryLocationSheetVariants({
                    selected,
                  });
                  return (
                    <Button
                      aria-selected={selected}
                      className={itemSlots.item()}
                      key={address.id}
                      onPress={() => setDraftId(address.id)}
                      role="option"
                      variant="ghost"
                    >
                      <span aria-hidden className={styles.itemIcon()}>
                        <House1 size={22} />
                      </span>
                      <span className={styles.itemCopy()}>
                        <Typography
                          className={styles.itemLabel()}
                          type="body-sm"
                          weight="semibold"
                        >
                          {address.label}
                        </Typography>
                        <Typography
                          className={styles.itemLine()}
                          type="body-xs"
                        >
                          {address.line}
                        </Typography>
                      </span>
                      <span aria-hidden className={itemSlots.itemCheck()}>
                        {selected ? <Check size={14} /> : null}
                      </span>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className={styles.addRow()}>
              <Button
                className={styles.addButton()}
                onPress={() => {
                  onOpenChange(false);
                  onAddNew?.();
                }}
                variant="ghost"
              >
                <Typography className={styles.addLabel()} type="body-sm">
                  {addLabel}
                </Typography>
                <Plus aria-hidden className="text-accent" size={16} />
              </Button>
            </div>
          </Drawer.Body>
          <Drawer.Footer className={styles.footer()}>
            <Button
              className={styles.updateButton()}
              isDisabled={!draftId}
              variant="primary"
              onPress={() => {
                if (!draftId) return;
                onSelect(draftId);
                onOpenChange(false);
              }}
            >
              {updateLabel}
              <Check aria-hidden size={18} />
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
