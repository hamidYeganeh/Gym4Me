"use client";

import { SwipeButton } from "@repo/ui/kit/SwipeButton";
import type { SwipeButtonColor } from "@repo/ui/kit/SwipeButton";

export type SwipeButtonDemoLabels = {
  finish: string;
  confirm: string;
  continue: string;
  save: string;
  delete: string;
};

const VARIANTS: { color: SwipeButtonColor; key: keyof SwipeButtonDemoLabels }[] =
  [
    { color: "warning", key: "finish" },
    { color: "orange", key: "confirm" },
    { color: "accent", key: "continue" },
    { color: "success", key: "save" },
    { color: "danger", key: "delete" },
  ];

export function SwipeButtonDemo({ labels }: { labels: SwipeButtonDemoLabels }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {VARIANTS.map((item) => (
        <SwipeButton
          key={item.color}
          color={item.color}
          label={labels[item.key]}
          stayCompleted={false}
          className="w-full"
        />
      ))}
    </div>
  );
}
