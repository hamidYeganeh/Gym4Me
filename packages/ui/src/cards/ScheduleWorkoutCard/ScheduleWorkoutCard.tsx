"use client";

import { Button, Dropdown, Label, Typography } from "@heroui/react";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { DotThreeHorizontal } from "@repo/icons/DotThreeHorizontal";
import { Fire1 } from "@repo/icons/Fire1";
import { Trash2 } from "@repo/icons/Trash2";
import { WaterDrop } from "@repo/icons/WaterDrop";
import { spring } from "@repo/theme";
import { animate, motion, useMotionValue, type PanInfo } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MediaImage } from "../../common/MediaImage";
import { scheduleWorkoutCardVariants } from "./ScheduleWorkoutCard.styles";
import type { ScheduleWorkoutCardProps } from "./ScheduleWorkoutCard.types";

const ACTION_WIDTH = 72;
const OPEN_THRESHOLD = 0.35;
const FLING_VELOCITY = 500;

export function ScheduleWorkoutCard({
  title,
  duration,
  category,
  image,
  imageAlt = "",
  intensity,
  intensityLabel,
  trailing = "chevron",
  onPress,
  onMenuPress,
  menuLabel = "More",
  onDelete,
  deleteLabel = "Delete",
  isOpen: isOpenProp,
  onOpenChange,
  "aria-label": ariaLabel,
  className,
}: ScheduleWorkoutCardProps) {
  const slots = scheduleWorkoutCardVariants({ intensity });
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

  const IntensityIcon =
    intensity === "normal" ? WaterDrop : intensity != null ? Fire1 : null;

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
            isIconOnly
            onPress={handleDelete}
            size="lg"
            variant="danger"
          >
            <Trash2 size={22} />
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
        <div aria-hidden={!imageAlt} className={slots.thumb()}>
          {image != null ? (
            <MediaImage
              alt={imageAlt}
              className={slots.thumbImage()}
              image={image}
              sizes="56px"
            />
          ) : null}
        </div>

        <div className={slots.body()}>
          <Typography className={slots.title()} weight="bold">
            {title}
          </Typography>
          <Typography className={slots.meta()} type="body-sm">
            {duration}
            <span aria-hidden> • </span>
            {category}
          </Typography>
          {intensity != null && intensityLabel != null ? (
            <span className={slots.intensity()}>
              {IntensityIcon ? (
                <IntensityIcon
                  aria-hidden
                  className={slots.intensityIcon()}
                  size={14}
                />
              ) : null}
              {intensityLabel}
            </span>
          ) : null}
        </div>

        <div
          className={slots.trailing()}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {trailing === "menu" ? (
            onDelete != null ? (
              <Dropdown>
                <Button
                  aria-label={menuLabel}
                  isIconOnly
                  size="lg"
                  variant="ghost"
                >
                  <DotThreeHorizontal size={20} />
                </Button>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu
                    onAction={(key) => {
                      if (key === "delete") {
                        handleDelete();
                        return;
                      }
                      onMenuPress?.();
                    }}
                  >
                    <Dropdown.Item
                      id="delete"
                      textValue={deleteLabel}
                      variant="danger"
                    >
                      <Trash2 className="size-4 shrink-0 text-danger" />
                      <Label>{deleteLabel}</Label>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            ) : (
              <Button
                aria-label={menuLabel}
                isIconOnly
                onPress={onMenuPress}
                size="lg"
                variant="ghost"
              >
                <DotThreeHorizontal size={20} />
              </Button>
            )
          ) : (
            <ChevronRight aria-hidden className={slots.chevron()} size={16} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
