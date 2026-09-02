"use client";

import { useEffect } from "react";
import { getBusinessPanelUrl } from "@/shared/lib/env";

export function BusinessPanelRedirect() {
  const businessPanelUrl = getBusinessPanelUrl();

  useEffect(() => {
    window.location.replace(businessPanelUrl);
  }, [businessPanelUrl]);

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 text-center">
      <div className="grid max-w-sm gap-3">
        <h1 className="text-xl font-bold">مدیریت باشگاه منتقل شد</h1>
        <p className="text-sm text-muted">
          دسترسی‌های مالک باشگاه اکنون در پنل مستقل کسب‌وکار قرار دارند.
        </p>
        <a
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
          href={businessPanelUrl}
        >
          ورود به پنل کسب‌وکار
        </a>
      </div>
    </main>
  );
}
