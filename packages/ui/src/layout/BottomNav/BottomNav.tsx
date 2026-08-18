"use client";

import { Button } from "@heroui/react/button";
import { Link } from "@heroui/react/link";
import { Popover } from "@heroui/react/popover";
import { Typography } from "@heroui/react/typography";
import { useState, type ReactNode } from "react";
import { ProgressiveBlur } from "../../kit/ProgressiveBlur";
import { bottomNavVariants } from "./BottomNav.styles";
import type {
  BottomNavItem,
  BottomNavProps,
  BottomNavQuickAction,
} from "./BottomNav.types";

export function BottomNav({
  items,
  centerAction,
  "aria-label": ariaLabel = "Bottom navigation",
  className,
  isActionsOpen,
  onActionsOpenChange,
}: BottomNavProps) {
  const mid = Math.ceil(items.length / 2);
  const leading = items.slice(0, mid);
  const trailing = items.slice(mid);
  const actions = centerAction?.actions ?? [];
  const hasActionsMenu = actions.length > 0;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const actionsOpen = isActionsOpen ?? uncontrolledOpen;
  const setActionsOpen = (open: boolean) => {
    if (isActionsOpen === undefined) {
      setUncontrolledOpen(open);
    }
    onActionsOpenChange?.(open);
  };

  const slots = bottomNavVariants({ isActionsOpen: actionsOpen });

  const renderCenterIcon = (icon: ReactNode) => (
    <span aria-hidden className={slots.centerActionIcon()}>
      {icon}
    </span>
  );

  const renderItem = (item: BottomNavItem) => {
    const itemSlots = bottomNavVariants({ isActive: Boolean(item.isActive) });

    return (
      <div key={item.key} className={itemSlots.item()}>
        {item.href ? (
          <Link
            aria-current={item.isActive ? "page" : undefined}
            aria-label={item.label}
            className={slots.itemButton()}
            href={item.href}
            onPress={item.onPress}
          >
            {item.icon}
          </Link>
        ) : (
          <Button
            aria-current={item.isActive ? "page" : undefined}
            aria-label={item.label}
            className={slots.itemButton()}
            isIconOnly
            onPress={item.onPress}
            size="lg"
            variant="ghost"
          >
            {item.icon}
          </Button>
        )}
        <Typography
          align="center"
          className={slots.itemLabel()}
          truncate
          type="body-xs"
          weight="medium"
        >
          {item.label}
        </Typography>
      </div>
    );
  };

  const renderQuickAction = (action: BottomNavQuickAction) => {
    const handlePress: BottomNavQuickAction["onPress"] = (e) => {
      setActionsOpen(false);
      action.onPress?.(e);
    };

    return (
      <div key={action.key} className={slots.menuItem()}>
        {action.href ? (
          <Link
            aria-label={action.label}
            className={slots.menuItemButton()}
            href={action.href}
            onPress={handlePress}
          >
            {action.icon}
          </Link>
        ) : (
          <Button
            aria-label={action.label}
            className={slots.menuItemButton()}
            isIconOnly
            onPress={handlePress}
            size="lg"
            variant="secondary"
          >
            {action.icon}
          </Button>
        )}
        <Typography
          align="center"
          className={slots.menuItemLabel()}
          truncate
          type="body-xs"
          weight="medium"
        >
          {action.label}
        </Typography>
      </div>
    );
  };

  let centerNode: ReactNode = null;
  if (centerAction) {
    centerNode = (
      <div className={slots.centerSlot()}>
        {hasActionsMenu ? (
          <Popover isOpen={actionsOpen} onOpenChange={setActionsOpen}>
            <Button
              aria-expanded={actionsOpen}
              aria-label={centerAction.label}
              className={slots.centerAction()}
              isIconOnly={Boolean(centerAction.icon)}
              size="lg"
              variant="primary"
            >
              {centerAction.icon ? (
                renderCenterIcon(centerAction.icon)
              ) : (
                <span className={slots.centerActionLabel()}>
                  {centerAction.label}
                </span>
              )}
            </Button>
            <Popover.Content
              className={slots.menu()}
              offset={18}
              placement="top"
            >
              <Popover.Dialog className={slots.menuDialog()}>
                <Popover.Arrow className={slots.menuArrow()} />
                <Popover.Heading className={slots.menuHeading()}>
                  {centerAction.actionsLabel ?? centerAction.label}
                </Popover.Heading>
                <div className={slots.menuGrid()}>
                  {actions.map(renderQuickAction)}
                </div>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        ) : (
          <Button
            aria-label={centerAction.label}
            className={slots.centerAction()}
            isIconOnly={Boolean(centerAction.icon)}
            onPress={centerAction.onPress}
            size="lg"
            variant="primary"
          >
            {centerAction.icon ? (
              renderCenterIcon(centerAction.icon)
            ) : (
              <span className={slots.centerActionLabel()}>
                {centerAction.label}
              </span>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {hasActionsMenu && actionsOpen ? (
        <div
          aria-hidden
          className={slots.backdrop()}
          onClick={() => setActionsOpen(false)}
        />
      ) : null}
      <nav aria-label={ariaLabel} className={slots.root({ className })}>
        <ProgressiveBlur
          blurIntensity={0.85}
          blurLayers={12}
          className={slots.blur()}
          direction="bottom"
        />
        {leading.map(renderItem)}
        {centerNode}
        {trailing.map(renderItem)}
      </nav>
    </>
  );
}

/** Alias matching the product name for this navigation shell. */
export const BottomNavigation = BottomNav;
