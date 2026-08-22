/** Arabic / Persian / Urdu ranges — letters must stay in one node to join. */
const JOINING_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function morphingTextParts(value: string): string[] {
  if (JOINING_SCRIPT.test(value)) {
    return value.split(/(\s+)/).filter((part) => part.length > 0);
  }

  return value.split("");
}

export function morphingTextDisplay(part: string): string {
  return part === " " ? "\u00A0" : part;
}
