"use client";

import { useState } from "react";
import { FractionalPicker } from "@repo/ui/kit/FractionalPicker";

export function FractionalPickerDemo({
  label = "انتخابگر خط‌کش",
}: {
  label?: string;
}) {
  const [value, setValue] = useState(24);

  return (
    <div className="flex w-full max-w-full flex-col items-center gap-3">
      <FractionalPicker
        value={value}
        onChange={setValue}
        min={0}
        max={30}
        defaultValue={10}
        aria-label={label}
        className="w-full"
      />
      <p className="text-sm tabular-nums text-muted">{value}</p>
    </div>
  );
}
