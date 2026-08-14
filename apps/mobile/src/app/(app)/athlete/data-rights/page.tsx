import type { Metadata } from "next";
import { AthleteDataRightsGate } from "@/modules/athlete/lib/AthleteDataRightsGate";

export const metadata: Metadata = { title: "حقوق داده" };

export default function AthleteDataRightsPage() {
  return <AthleteDataRightsGate />;
}
