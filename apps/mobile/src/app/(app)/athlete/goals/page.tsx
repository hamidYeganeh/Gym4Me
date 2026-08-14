import type { Metadata } from "next";
import { AthleteGoalsGate } from "@/modules/athlete/lib/AthleteGoalsGate";

export const metadata: Metadata = { title: "اهداف و یادآوری" };

export default function AthleteGoalsPage() {
  return <AthleteGoalsGate />;
}
