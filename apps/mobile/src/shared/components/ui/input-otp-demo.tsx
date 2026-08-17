"use client";

import { useState } from "react";
import { InputOTP } from "@repo/ui/kit/InputOTP";

export type InputOTPDemoLabels = {
  label: string;
  filled: string;
  error: string;
};

export function InputOTPDemo({ labels }: { labels: InputOTPDemoLabels }) {
  const [value, setValue] = useState("");
  const [filledValue, setFilledValue] = useState("1234");
  const [errorValue, setErrorValue] = useState("1234");

  return (
    <div className="flex w-full flex-col items-center gap-6" dir="ltr">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted" dir="rtl">
          {labels.label}
        </p>
        <InputOTP
          length={4}
          size="lg"
          value={value}
          onChange={setValue}
          aria-label={labels.label}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted" dir="rtl">
          {labels.filled}
        </p>
        <InputOTP
          length={4}
          size="lg"
          value={filledValue}
          onChange={setFilledValue}
          aria-label={`${labels.label} — ${labels.filled}`}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted" dir="rtl">
          {labels.error}
        </p>
        <InputOTP
          length={4}
          size="lg"
          value={errorValue}
          onChange={setErrorValue}
          isInvalid
          aria-label={`${labels.label} — ${labels.error}`}
        />
      </div>
    </div>
  );
}
