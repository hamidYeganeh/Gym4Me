import type { ReactNode } from "react";
import { RoleAppNavigation } from "@/shared/components/RoleAppNavigation";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <RoleAppNavigation role="owner">{children}</RoleAppNavigation>;
}
