import type { Metadata } from "next";
import { AthleteDataGrantsGate } from "@/modules/athlete/lib/AthleteDataGrantsGate";

export const metadata: Metadata = { title: "اشتراک‌گذاری داده با مربی" };

export default function AthleteDataGrantsPage() {
  return <AthleteDataGrantsGate />;
}
