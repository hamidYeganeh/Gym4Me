"use client";

import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { CloseX } from "@repo/icons/CloseX";
import { House1 } from "@repo/icons/House1";
import { Plus } from "@repo/icons/Plus";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
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
  const isEmpty = addresses.length === 0;

  useEffect(() => {
    if (isOpen) {
      setDraftId(selectedId);
    }
  }, [isOpen, selectedId]);

  const handleAddNew = () => {
    onOpenChange(false);
    onAddNew?.();
  };

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
            {isEmpty ? null : (
              <Typography className={styles.description()} type="body-sm">
                {description}
              </Typography>
            )}
          </Drawer.Header>
          <Drawer.Body className={styles.body()}>
            {isEmpty ? (
              <EmptyState
                className={styles.empty()}
                description={description}
                illustration={EMPTY_STATE_ILLUSTRATIONS.locations}
                illustrationAlt=""
                layout="media"
                primaryAction={
                  onAddNew
                    ? {
                        label: addLabel,
                        onPress: handleAddNew,
                        endContent: <Plus size={18} />,
                      }
                    : undefined
                }
                title={emptyLabel}
              />
            ) : (
              <>
                <div className={styles.list()} role="listbox">
                  {addresses.map((address) => {
                    const selected = address.id === draftId;
                    const itemSlots = discoveryLocationSheetVariants({
                      selected,
                    });
                    return (
                      <div
                        key={address.id}
                        role="option"
                        aria-selected={selected}
                      >
                        <Button
                          className={itemSlots.item()}
                          onPress={() => setDraftId(address.id)}
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
                      </div>
                    );
                  })}
                </div>

                <div className={styles.addRow()}>
                  <Button
                    className={styles.addButton()}
                    onPress={handleAddNew}
                    variant="ghost"
                  >
                    <Typography className={styles.addLabel()} type="body-sm">
                      {addLabel}
                    </Typography>
                    <Plus aria-hidden className="text-accent" size={16} />
                  </Button>
                </div>
              </>
            )}
          </Drawer.Body>
          {isEmpty ? null : (
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
          )}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
