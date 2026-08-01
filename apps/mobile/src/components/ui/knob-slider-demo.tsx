"use client";

import { useState } from "react";
import { KnobSlider } from "./knob-slider";

export function KnobSliderDemo({
  label = "تنظیم عددی",
  size = 280,
}: {
  label?: string;
  size?: number;
}) {
  const [value, setValue] = useState(24);

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center gap-4 rounded-[36px] p-6 sm:p-8"
      style={{
        backgroundColor: "var(--surface)",
        color: "var(--surface-foreground)",
        boxShadow: "var(--surface-shadow)",
      }}
    >
      <KnobSlider
        value={value}
        onChange={setValue}
        min={0}
        max={99}
        size={size}
        aria-label={label}
      />
      <p className="text-sm tabular-nums" style={{ color: "var(--muted)" }}>
        {value}
      </p>
    </div>
  );
}
