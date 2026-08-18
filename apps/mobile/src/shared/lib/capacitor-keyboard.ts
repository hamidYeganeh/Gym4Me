const KEYBOARD_OPEN_ATTR = "data-keyboard-open";
const KEYBOARD_HEIGHT_VAR = "--keyboard-height";

type PluginListenerHandle = { remove: () => Promise<void> };

function isEditableTarget(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }

  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    return ![
      "button",
      "checkbox",
      "color",
      "file",
      "hidden",
      "image",
      "radio",
      "range",
      "reset",
      "submit",
    ].includes(type);
  }

  return target.isContentEditable;
}

function setKeyboardOpen(open: boolean, heightPx = 0) {
  const root = document.documentElement;
  if (open) {
    root.setAttribute(KEYBOARD_OPEN_ATTR, "");
    root.style.setProperty(KEYBOARD_HEIGHT_VAR, `${Math.max(0, heightPx)}px`);
    return;
  }

  root.removeAttribute(KEYBOARD_OPEN_ATTR);
  root.style.setProperty(KEYBOARD_HEIGHT_VAR, "0px");
}

function scrollFocusedEditableIntoView() {
  const active = document.activeElement;
  if (!isEditableTarget(active)) {
    return;
  }

  // Wait one frame so native WebView resize / body height settle first.
  requestAnimationFrame(() => {
    active.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  });
}

/**
 * Capacitor Keyboard + visualViewport fallback so focused inputs stay above
 * the soft keyboard (esp. with StatusBar overlaysWebView on Android).
 *
 * Returns a cleanup that removes listeners.
 */
export async function setupCapacitorKeyboard(): Promise<() => void> {
  const { Capacitor } = await import("@capacitor/core");
  const cleanups: Array<() => void> = [];

  if (Capacitor.isNativePlatform()) {
    const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");

    // Native: shrink the WebView so `dvh`/`vh` shells (auth, onboarding) reflow.
    // resizeOnFullScreen is configured in capacitor.config.ts for Android overlay.
    await Promise.all([
      Keyboard.setResizeMode({ mode: KeyboardResize.Native }).catch(
        () => undefined,
      ),
      // Keep WebView scrolling enabled so scrollIntoView can move nested panels.
      Keyboard.setScroll({ isDisabled: false }).catch(() => undefined),
    ]);

    const handles: PluginListenerHandle[] = [];

    handles.push(
      await Keyboard.addListener("keyboardWillShow", (info) => {
        setKeyboardOpen(true, info.keyboardHeight);
      }),
    );
    handles.push(
      await Keyboard.addListener("keyboardDidShow", (info) => {
        setKeyboardOpen(true, info.keyboardHeight);
        scrollFocusedEditableIntoView();
      }),
    );
    handles.push(
      await Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardOpen(false);
      }),
    );
    handles.push(
      await Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardOpen(false);
      }),
    );

    cleanups.push(() => {
      void Promise.all(handles.map((handle) => handle.remove()));
    });
  } else {
    // Browser / PWA: approximate keyboard inset via visualViewport.
    const viewport = window.visualViewport;
    if (viewport) {
      const syncViewport = () => {
        const obscured = Math.max(
          0,
          window.innerHeight - viewport.height - viewport.offsetTop,
        );
        const open = obscured > 80;
        setKeyboardOpen(open, open ? obscured : 0);
        if (open) {
          scrollFocusedEditableIntoView();
        }
      };

      viewport.addEventListener("resize", syncViewport);
      viewport.addEventListener("scroll", syncViewport);
      cleanups.push(() => {
        viewport.removeEventListener("resize", syncViewport);
        viewport.removeEventListener("scroll", syncViewport);
      });
    }
  }

  const onFocusIn = (event: FocusEvent) => {
    if (!isEditableTarget(event.target)) {
      return;
    }
    if (!document.documentElement.hasAttribute(KEYBOARD_OPEN_ATTR)) {
      return;
    }
    scrollFocusedEditableIntoView();
  };

  document.addEventListener("focusin", onFocusIn);
  cleanups.push(() => {
    document.removeEventListener("focusin", onFocusIn);
  });

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
    setKeyboardOpen(false);
  };
}
