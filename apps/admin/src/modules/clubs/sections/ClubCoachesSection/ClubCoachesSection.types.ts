import type { Club } from "@repo/api";

export type ClubCoachesSectionProps = {
  clubId: string;
  coaches: Club["coaches"];
  onChanged: () => void;
};
