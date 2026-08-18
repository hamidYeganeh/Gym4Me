"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { InfoCircle } from "@repo/icons/InfoCircle";
import { Trash2 } from "@repo/icons/Trash2";
import { WeightScale } from "@repo/icons/WeightScale";
import { spring } from "@repo/theme";
import {
  animate,
  motion,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { metricHistoryItemVariants } from "./MetricHistoryItem.styles";
import type { MetricHistoryItemProps } from "./MetricHistoryItem.types";

const ACTION_WIDTH = 72;
const OPEN_THRESHOLD = 0.35;
const FLING_VELOCITY = 500;

export function MetricHistoryItem({
  value,
  time,
  subtitle,
  alert,
  icon,
  onPress,
  onDelete,
  deleteLabel = "Delete",
  isOpen: isOpenProp,
  onOpenChange,
  "aria-label": ariaLabel,
  className,
}: MetricHistoryItemProps) {
  const slots = metricHistoryItemVariants();
  const rootRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [isRtl, setIsRtl] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : uncontrolledOpen;
  const swipeEnabled = onDelete != null;

  const x = useMotionValue(0);
  const openX = isRtl ? ACTION_WIDTH : -ACTION_WIDTH;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const syncDirection = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsRtl(getComputedStyle(root).direction === "rtl");
  }, []);

  useLayoutEffect(() => {
    syncDirection();
  }, [syncDirection]);

  useEffect(() => {
    if (!swipeEnabled) {
      x.set(0);
      return;
    }
    void animate(x, isOpen ? openX : 0, spring.snap);
  }, [isOpen, openX, swipeEnabled, x]);

  const snapTo = useCallback(
    (open: boolean) => {
      setOpen(open);
      void animate(x, open ? openX : 0, spring.snap);
    },
    [openX, setOpen, x],
  );

  const handleDragStart = () => {
    draggedRef.current = false;
  };

  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) > 8) {
      draggedRef.current = true;
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (!swipeEnabled) return;

    const current = x.get();
    const progress = Math.abs(current) / ACTION_WIDTH;
    const velocity = info.velocity.x;
    const flungOpen = isRtl
      ? velocity > FLING_VELOCITY
      : velocity < -FLING_VELOCITY;
    const flungClosed = isRtl
      ? velocity < -FLING_VELOCITY
      : velocity > FLING_VELOCITY;

    if (flungClosed) {
      snapTo(false);
      return;
    }
    if (flungOpen || progress >= OPEN_THRESHOLD) {
      snapTo(true);
      return;
    }
    snapTo(false);
  };

  const handlePress = () => {
    if (draggedRef.current) return;
    if (isOpen) {
      snapTo(false);
      return;
    }
    onPress?.();
  };

  const handleDelete = () => {
    snapTo(false);
    onDelete?.();
  };

  return (
    <div
      className={slots.root({ className })}
      data-open={isOpen || undefined}
      ref={rootRef}
    >
      {swipeEnabled ? (
        <div aria-hidden={!isOpen} className={slots.actions()}>
          <Button
            aria-label={deleteLabel}
            className={slots.deleteButton()}
            isIconOnly
            onPress={handleDelete}
            size="lg"
            variant="danger"
          >
            <Trash2 className={slots.deleteIcon()} size={22} />
          </Button>
        </div>
      ) : null}

      <motion.div
        aria-label={ariaLabel}
        className={slots.panel()}
        drag={swipeEnabled ? "x" : false}
        dragConstraints={
          isRtl
            ? { left: 0, right: ACTION_WIDTH }
            : { left: -ACTION_WIDTH, right: 0 }
        }
        dragElastic={0.12}
        dragMomentum={false}
        onClick={handlePress}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handlePress();
          }
        }}
        role={onPress || swipeEnabled ? "button" : undefined}
        style={{ x }}
        tabIndex={onPress || swipeEnabled ? 0 : undefined}
      >
        <span aria-hidden className={slots.iconWrap()}>
          {icon ?? <WeightScale size={22} />}
        </span>

        <span className={slots.body()}>
          <Typography className={slots.value()} weight="bold">
            {value}
          </Typography>
          {subtitle != null && subtitle !== "" ? (
            <Typography className={slots.subtitle()} type="body-sm">
              {subtitle}
            </Typography>
          ) : null}
          {alert != null && alert !== "" ? (
            <Typography className={slots.alert()} type="body-sm">
              <InfoCircle aria-hidden className={slots.alertIcon()} size={14} />
              {alert}
            </Typography>
          ) : null}
        </span>

        <span className={slots.meta()}>
          <Typography className={slots.time()} type="body-sm">
            {time}
          </Typography>
          <ChevronRight aria-hidden className={slots.chevron()} size={16} />
        </span>
      </motion.div>
    </div>
  );
}
