"use client";

import { useState } from "react";
import { WeightSlider } from "@repo/ui/kit/WeightSlider";

export function WeightSliderDemo({ label = "وزن" }: { label?: string }) {
  const [weight, setWeight] = useState(24);

  return (
    <div className="flex w-full max-w-full flex-col items-center justify-center gap-3">
      <WeightSlider
        value={weight}
        min={0}
        max={200}
        onChange={setWeight}
        label={label}
        aria-label={label}
        className="w-full"
      />
      <p className="text-sm tabular-nums text-muted">{weight}</p>
    </div>
  );
}
