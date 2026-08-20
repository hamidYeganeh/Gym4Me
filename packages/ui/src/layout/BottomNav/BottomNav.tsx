"use client";

import { Button } from "@heroui/react/button";
import { Link } from "@heroui/react/link";
import { Popover } from "@heroui/react/popover";
import { Typography } from "@heroui/react/typography";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ProgressiveBlur } from "../../kit/ProgressiveBlur";
import { bottomNavVariants } from "./BottomNav.styles";
import type {
  BottomNavHoldMenuOption,
  BottomNavItem,
  BottomNavProps,
  BottomNavQuickAction,
} from "./BottomNav.types";

const HOLD_MENU_DELAY_MS = 500;

export function BottomNav({
  items,
  centerAction,
  "aria-label": ariaLabel = "Bottom navigation",
  className,
  portal = true,
  isActionsOpen,
  onActionsOpenChange,
}: BottomNavProps) {
  const mid = Math.ceil(items.length / 2);
  const leading = items.slice(0, mid);
  const trailing = items.slice(mid);
  const actions = centerAction?.ed ?? [];
  const hasActionsMenu = actions.length > 0;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [holdMenuKey, setHoldMenuKey] = useState<string | null>(null);
  /** Portal out of transform/overflow ancestors (e.g. page transitions) so `fixed` sticks to the viewport. */
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const longPressTriggeredRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!portal) {
      setPortalTarget(null);
      return;
    }
    setPortalTarget(document.body);
  }, [portal]);
  const actionsOpen = isActionsOpen ?? uncontrolledOpen;
  const holdMenuOpen = holdMenuKey !== null;
  const overlayOpen = (hasActionsMenu && actionsOpen) || holdMenuOpen;
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

  const closeOverlay = () => {
    setActionsOpen(false);
    setHoldMenuKey(null);
  };

  const renderMenuAction = (
    action: BottomNavQuickAction,
    onClose: () => void,
  ) => {
    const handlePress: BottomNavQuickAction["onPress"] = (event) => {
      onClose();
      action.onPress?.(event);
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

  const renderHoldMenuAction = (
    option: BottomNavHoldMenuOption,
    onClose: () => void,
  ) => {
    const handlePress: BottomNavHoldMenuOption["onPress"] = (event) => {
      onClose();
      option.onPress?.(event);
    };

    return (
      <Button
        key={option.key}
        aria-label={option.label}
        className={slots.holdMenuItem()}
        onPress={handlePress}
        variant="secondary"
      >
        <span aria-hidden className={slots.holdMenuItemIcon()}>
          {option.icon}
        </span>
        <Typography
          className={slots.holdMenuItemLabel()}
          truncate
          type="body-sm"
          weight="medium"
        >
          {option.label}
        </Typography>
      </Button>
    );
  };

  const renderItem = (item: BottomNavItem) => {
    const itemSlots = bottomNavVariants({ isActive: Boolean(item.isActive) });
    const holdOptions = item.holdMenu?.options ?? [];
    const hasHoldMenu = holdOptions.length > 0;
    const isHoldOpen = holdMenuKey === item.key;

    const clearLongPress = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleLongPressStart = () => {
      if (!hasHoldMenu) return;
      longPressTriggeredRef.current = false;
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setActionsOpen(false);
        setHoldMenuKey(item.key);
      }, HOLD_MENU_DELAY_MS);
    };

    const longPressHandlers = hasHoldMenu
      ? {
          onPointerDown: (event: ReactPointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            handleLongPressStart();
          },
          onPointerUp: clearLongPress,
          onPointerLeave: clearLongPress,
          onPointerCancel: clearLongPress,
        }
      : {};

    const consumeLongPress = () => {
      if (!longPressTriggeredRef.current) return false;
      longPressTriggeredRef.current = false;
      return true;
    };

    const handleItemPress: BottomNavItem["onPress"] = (event) => {
      if (consumeLongPress()) return;
      item.onPress?.(event);
    };

    const triggerNode = item.href ? (
      <Link
        aria-current={item.isActive ? "page" : undefined}
        aria-label={item.label}
        className={slots.itemButton()}
        href={item.href}
        onPress={handleItemPress}
        {...longPressHandlers}
      >
        {item.icon}
      </Link>
    ) : (
      <Button
        aria-current={item.isActive ? "page" : undefined}
        aria-label={item.label}
        className={slots.itemButton()}
        isIconOnly
        onPress={handleItemPress}
        size="lg"
        variant="ghost"
        {...longPressHandlers}
      >
        {item.icon}
      </Button>
    );

    const itemNode = hasHoldMenu ? (
      <Popover
        isOpen={isHoldOpen}
        onOpenChange={(open) => {
          if (!open) setHoldMenuKey(null);
        }}
      >
        {triggerNode}
        <Popover.Content className={slots.holdMenu()} offset={18} placement="top">
          <Popover.Dialog className={slots.holdMenuDialog()}>
            <Popover.Arrow className={slots.menuArrow()} />
            <Popover.Heading className={slots.menuHeading()}>
              {item.holdMenu?.label ?? item.label}
            </Popover.Heading>
            <div className={slots.holdMenuList()}>
              {holdOptions.map((option) =>
                renderHoldMenuAction(option, () => setHoldMenuKey(null)),
              )}
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    ) : (
      triggerNode
    );

    return (
      <div key={item.key} className={itemSlots.item()}>
        {itemNode}
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

  const renderQuickAction = (action: BottomNavQuickAction) =>
    renderMenuAction(action, closeOverlay);

  let centerNode: ReactNode = null;
  if (centerAction) {
    centerNode = (
      <div className={slots.centerSlot()}>
        {hasActionsMenu ? (
          <Popover
            isOpen={actionsOpen}
            onOpenChange={(open) => {
              if (open) setHoldMenuKey(null);
              setActionsOpen(open);
            }}
          >
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

  const node = (
    <>
      {overlayOpen ? (
        <div
          aria-hidden
          className={slots.backdrop()}
          data-keyboard-hide=""
          onClick={closeOverlay}
        />
      ) : null}
      <nav
        aria-label={ariaLabel}
        className={slots.root({ className })}
        data-keyboard-hide=""
      >
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

  if (!portalTarget) return node;
  return createPortal(node, portalTarget);
}

/** Alias matching the product name for this navigation shell. */
export const BottomNavigation = BottomNav;
