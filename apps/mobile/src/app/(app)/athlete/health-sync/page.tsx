import type { Metadata } from "next";
import { AthleteHealthSyncGateDynamic } from "@/modules/athlete/lib/AthleteHealthSyncGateDynamic";

export const metadata: Metadata = { title: "همگام‌سازی سلامت" };

export default function AthleteHealthSyncPage() {
  return <AthleteHealthSyncGateDynamic />;
}
