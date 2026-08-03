"use client";

import { useEffect } from "react";
import { MarketingFeaturesSection } from "../../sections/MarketingFeaturesSection";
import { MarketingFooterSection } from "../../sections/MarketingFooterSection";
import { MarketingHeaderSection } from "../../sections/MarketingHeaderSection";
import { MarketingHeroSection } from "../../sections/MarketingHeroSection";
import { MarketingPerksSection } from "../../sections/MarketingPerksSection";
import { MarketingShowcaseSection } from "../../sections/MarketingShowcaseSection";
import { MarketingToolsSection } from "../../sections/MarketingToolsSection";

const VENDOR_SCRIPT = "/assets/scripts/vendors.js";
const APP_SCRIPT = "/assets/scripts/app.js";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-loco-script="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(src)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.locoScript = src;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(src)), {
      once: true,
    });
    document.body.appendChild(script);
  });
}

export function HomeScreen() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("is-loading");
    html.setAttribute("data-header-theme", "blue");
    html.setAttribute("lang", "fa");
    html.setAttribute("dir", "rtl");
    document.body.setAttribute("data-module-load", "");

    let cancelled = false;

    void (async () => {
      try {
        await loadScript(VENDOR_SCRIPT);
        await loadScript(APP_SCRIPT);
        if (cancelled) return;
        const win = window as Window & { __locoAppInit?: boolean };
        if (!win.__locoAppInit) {
          win.__locoAppInit = true;
          if (document.readyState === "complete") {
            window.dispatchEvent(new Event("load"));
          }
        }
      } catch {
        // Scripts are optional for static markup; leave content visible.
      }
    })();

    return () => {
      cancelled = true;
      html.classList.remove("is-loading", "is-loaded", "is-ready");
      html.removeAttribute("data-header-theme");
      document.body.removeAttribute("data-module-load");
    };
  }, []);

  return (
    <>
      {/* Preloader */}
      <div className="c-preloader" />

      <div data-load-container="">
        <div data-module-scroll="main">
          <MarketingHeaderSection />
          <main>
            <MarketingHeroSection />
            <MarketingPerksSection />
            <MarketingToolsSection />
            <MarketingFeaturesSection />
            <MarketingShowcaseSection />
            <MarketingFooterSection />
          </main>
        </div>
      </div>
    </>
  );
}
