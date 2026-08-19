import type { ReactNode } from "react";

/** Guest auth flows — allow document scroll when the soft keyboard shrinks the viewport. */
export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh overscroll-y-contain">{children}</div>;
}
