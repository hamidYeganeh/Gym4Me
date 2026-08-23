"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OwnerHolidaysScreen } from "../screens/OwnerHolidaysScreen";
import type { OwnerHolidayForm } from "../screens/OwnerHolidaysScreen/OwnerHolidaysScreen.types";
import { OWNER_HOLIDAYS, type OwnerHolidaysData } from "./owner-holidays-data";

export function OwnerHolidaysGate() {
  const [data, setData] = useState<OwnerHolidaysData>(
    DEMO_MODE ? OWNER_HOLIDAYS : { holidays: [], programs: [] },
  );
  const [form, setForm] = useState<OwnerHolidayForm>({
    title: "",
    jalaliDate: "",
  });
  const [pending, setPending] = useState(false);

  const handleAdd = () => {
    setPending(true);
    setTimeout(() => {
      setData((previous) => ({
        ...previous,
        holidays: [
          {
            id: `h-${Date.now()}`,
            title: form.title.trim(),
            jalaliDateLabel: form.jalaliDate.trim(),
            isOfficial: false,
          },
          ...previous.holidays,
        ],
      }));
      setForm({ title: "", jalaliDate: "" });
      setPending(false);
    }, 400);
  };

  return (
    <OwnerHolidaysScreen
      data={data}
      form={form}
      onAddHoliday={DEMO_MODE ? handleAdd : undefined}
      onFormChange={(patch) =>
        setForm((previous) => ({ ...previous, ...patch }))
      }
      pending={pending}
    />
  );
}
