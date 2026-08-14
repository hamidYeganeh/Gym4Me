import type { ReactNode } from "react";
import { RoleAppNavigation } from "@/shared/components/RoleAppNavigation";

export default function CoachLayout({ children }: { children: ReactNode }) {
  return <RoleAppNavigation role="coach">{children}</RoleAppNavigation>;
}
