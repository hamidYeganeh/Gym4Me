"use client";

import { AdaptiveSlider } from "@repo/ui/kit/AdaptiveSlider";

export type AdaptiveSliderDemoLabels = {
  label: string;
  unit: string;
};

export function AdaptiveSliderDemo({
  labels,
}: {
  labels: AdaptiveSliderDemoLabels;
}) {
  return (
    <div className="flex w-full max-w-sm items-center justify-center rounded-[36px] bg-surface p-6 shadow-2xl shadow-foreground/5 sm:p-12">
      <AdaptiveSlider
        min={100}
        max={800}
        step={50}
        defaultValue={300}
        label={labels.label}
        unit={labels.unit}
        aria-label={labels.label}
      />
    </div>
  );
}
