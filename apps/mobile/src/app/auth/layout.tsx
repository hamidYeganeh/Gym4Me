import type { ReactNode } from "react";

/** Keep guest auth flows in a single viewport — no document scroll. */
export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh max-h-dvh overflow-hidden overscroll-none">
      {children}
    </div>
  );
}
