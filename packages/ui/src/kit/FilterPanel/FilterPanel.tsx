"use client";

import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Typography } from "@heroui/react/typography";
import { SliderLineThreeHorizontal } from "@repo/icons/SliderLineThreeHorizontal";
import { filterPanelVariants } from "./FilterPanel.styles";
import type {
  FilterPanelProps,
  FilterPanelSectionProps,
} from "./FilterPanel.types";

export function FilterPanelSection({
  label,
  children,
  className,
  chipRow = false,
}: FilterPanelSectionProps) {
  const slots = filterPanelVariants();

  return (
    <section className={slots.section({ className })}>
      <Typography className={slots.sectionLabel()} type="body-sm" weight="semibold">
        {label}
      </Typography>
      {chipRow ? <div className={slots.chipRow()}>{children}</div> : children}
    </section>
  );
}

export function FilterPanel({
  isOpen,
  onOpenChange,
  title,
  description,
  closeLabel = "Close",
  submitLabel,
  onSubmit,
  submitIcon,
  isPending = false,
  isSubmitDisabled = false,
  closeOnSubmit = true,
  children,
  className,
}: FilterPanelProps) {
  const slots = filterPanelVariants();

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Drawer.Content className={slots.content({ className })} placement="bottom">
        <Drawer.Dialog className={slots.dialog()}>
          <Drawer.Handle />
          <div className={slots.header()}>
            <div className={slots.headingRow()}>
              <Typography className={slots.title()} type="h3" weight="bold">
                {title}
              </Typography>
              <Drawer.CloseTrigger
                aria-label={closeLabel}
                className={slots.close()}
              />
            </div>
            {description ? (
              <Typography className={slots.description()} type="body-sm">
                {description}
              </Typography>
            ) : null}
          </div>

          <Drawer.Body className={slots.body()}>{children}</Drawer.Body>

          <Drawer.Footer className={slots.footer()}>
            <Button
              className={slots.submit()}
              fullWidth
              isDisabled={isSubmitDisabled}
              isPending={isPending}
              onPress={() => {
                onSubmit?.();
                if (closeOnSubmit) onOpenChange(false);
              }}
              size="lg"
              type="button"
              variant="primary"
            >
              {submitLabel}
              <span className={slots.submitIcon()}>
                {submitIcon ?? <SliderLineThreeHorizontal size={18} />}
              </span>
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
