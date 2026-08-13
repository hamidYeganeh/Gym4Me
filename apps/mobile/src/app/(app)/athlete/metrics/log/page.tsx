import type { Metadata } from "next";
import { Suspense } from "react";
import { AthleteSelfTrackingGate } from "@/modules/athlete/lib/AthleteSelfTrackingGate";

export const metadata: Metadata = { title: "ثبت فعالیت و سلامت" };

export default function AthleteSelfTrackingPage() {
  return (
    <Suspense>
      <AthleteSelfTrackingGate />
    </Suspense>
  );
}

