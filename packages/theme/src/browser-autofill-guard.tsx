"use client";

import { useEffect } from "react";
import {
  disableBrowserAutofill,
  isAutofillTextControl,
} from "./disable-browser-autofill";

/**
 * Forces autocomplete/suggestions off on every form control, including
 * fields mounted later (modals, client islands) and values React resets.
 */
export function BrowserAutofillGuard() {
  useEffect(() => {
    disableBrowserAutofill(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const target = mutation.target;
          if (target instanceof HTMLFormElement) {
            disableBrowserAutofill(target);
          } else if (isAutofillTextControl(target)) {
            disableBrowserAutofill(target);
          }
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            disableBrowserAutofill(node);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["autocomplete"],
    });

    const onFocusIn = (event: FocusEvent) => {
      if (isAutofillTextControl(event.target)) {
        disableBrowserAutofill(event.target);
      }
    };

    document.addEventListener("focusin", onFocusIn);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return null;
}
