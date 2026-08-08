import type { ReactNode } from "react";
import { RequireAuth } from "@/shared/components/RequireAuth";

/** Authenticated product shell (athlete / coach / owner / discovery). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
