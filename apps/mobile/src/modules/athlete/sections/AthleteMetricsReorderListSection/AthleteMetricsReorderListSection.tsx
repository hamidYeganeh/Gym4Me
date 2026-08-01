"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { Leaf } from "@repo/icons/Leaf";
import { Lung } from "@repo/icons/Lung";
import { SleepZzz } from "@repo/icons/SleepZzz";
import { WaterDrop } from "@repo/icons/WaterDrop";
import { WaterGlassMedium } from "@repo/icons/WaterGlassMedium";
import { WeightScale } from "@repo/icons/WeightScale";
import { MetricReorderItem } from "@repo/ui/cards/MetricReorderItem";
import type { CSSProperties, ReactNode } from "react";
import type {
  ReorderableMetric,
  ReorderableMetricId,
} from "../../lib/metrics-reorder-data";
import { athleteMetricsReorderListSectionStyles as styles } from "./AthleteMetricsReorderListSection.styles";
import type {
  AthleteMetricsReorderLabels,
  AthleteMetricsReorderListSectionProps,
} from "./AthleteMetricsReorderListSection.types";

function metricPresentation(
  id: ReorderableMetricId,
  labels: AthleteMetricsReorderLabels,
): { title: string; icon: ReactNode } {
  switch (id) {
    case "weight":
      return { title: labels.weight, icon: <WeightScale size={24} /> };
    case "blood-pressure":
      return { title: labels.bloodPressure, icon: <WaterDrop size={24} /> };
    case "heart-rate":
      return { title: labels.heartRate, icon: <HeartEcg size={24} /> };
    case "sleep":
      return { title: labels.sleep, icon: <SleepZzz size={24} /> };
    case "nutrition":
      return { title: labels.nutrition, icon: <Leaf size={24} /> };
    case "hydration":
      return { title: labels.hydration, icon: <WaterGlassMedium size={24} /> };
    case "respiration":
      return { title: labels.respiration, icon: <Lung size={24} /> };
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

function SortableMetricRow({
  metric,
  labels,
  onRemove,
}: {
  metric: ReorderableMetric;
  labels: AthleteMetricsReorderLabels;
  onRemove: (id: ReorderableMetricId) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const presentation = metricPresentation(metric.id, labels);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } satisfies CSSProperties;

  return (
    <div
      className={
        isDragging
          ? `${styles.item} ${styles.itemDragging}`
          : styles.item
      }
      ref={setNodeRef}
      style={style}
    >
      <MetricReorderItem
        data-dragging={isDragging || undefined}
        dragHandleProps={{ ...attributes, ...listeners }}
        dragLabel={labels.dragLabel}
        icon={presentation.icon}
        onRemove={() => onRemove(metric.id)}
        removeLabel={labels.removeLabel}
        title={presentation.title}
      />
    </div>
  );
}

export function AthleteMetricsReorderListSection({
  metrics,
  labels,
  onReorder,
  onRemove,
}: AthleteMetricsReorderListSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = metrics.findIndex((item) => item.id === active.id);
    const newIndex = metrics.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(metrics, oldIndex, newIndex));
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={metrics.map((metric) => metric.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.root}>
          {metrics.map((metric) => (
            <SortableMetricRow
              key={metric.id}
              labels={labels}
              metric={metric}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
