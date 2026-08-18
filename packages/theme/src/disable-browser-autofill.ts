const SKIP_INPUT_TYPES = new Set([
  "hidden",
  "checkbox",
  "radio",
  "file",
  "submit",
  "button",
  "reset",
  "image",
  "range",
  "color",
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
]);

/** Spread onto native / HeroUI inputs to opt out of browser autofill. */
export const browserAutofillOffProps = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "none",
  spellCheck: false,
  "data-1p-ignore": true,
  "data-lpignore": "true",
  "data-form-type": "other",
} as const;

function isTextControl(
  node: EventTarget | Node | null,
): node is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) {
    return true;
  }
  if (!(node instanceof HTMLInputElement)) return false;
  return !SKIP_INPUT_TYPES.has(node.type);
}

function applyControl(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
) {
  if (el.getAttribute("autocomplete") !== "off") {
    el.setAttribute("autocomplete", "off");
  }
  if (!(el instanceof HTMLSelectElement)) {
    el.setAttribute("autocorrect", "off");
    el.setAttribute("autocapitalize", "none");
    el.setAttribute("spellcheck", "false");
  }
  el.setAttribute("data-1p-ignore", "true");
  el.setAttribute("data-lpignore", "true");
  el.setAttribute("data-form-type", "other");
}

function applyForm(form: HTMLFormElement) {
  if (form.getAttribute("autocomplete") !== "off") {
    form.setAttribute("autocomplete", "off");
  }
}

export function disableBrowserAutofill(root: ParentNode | Element) {
  if (root instanceof HTMLFormElement) applyForm(root);
  if (isTextControl(root)) applyControl(root);

  root.querySelectorAll("form, input, textarea, select").forEach((node) => {
    if (node instanceof HTMLFormElement) applyForm(node);
    else if (isTextControl(node)) applyControl(node);
  });
}

export function isAutofillTextControl(
  node: EventTarget | Node | null,
): node is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return isTextControl(node);
}
