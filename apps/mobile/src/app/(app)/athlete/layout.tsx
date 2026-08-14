import type { ReactNode } from "react";
import { RoleAppNavigation } from "@/shared/components/RoleAppNavigation";

export default function AthleteLayout({ children }: { children: ReactNode }) {
  return <RoleAppNavigation role="athlete">{children}</RoleAppNavigation>;
}
