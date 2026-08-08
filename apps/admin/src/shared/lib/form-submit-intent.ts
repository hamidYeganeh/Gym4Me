export type FormSubmitIntent = "save" | "saveAndCreateNew";

export function resolveFormSubmitIntent(event?: unknown): FormSubmitIntent {
  const nativeEvent =
    event && typeof event === "object" && "nativeEvent" in event
      ? (event as { nativeEvent?: unknown }).nativeEvent
      : undefined;
  const submitter =
    nativeEvent &&
    typeof nativeEvent === "object" &&
    "submitter" in nativeEvent
      ? (nativeEvent as { submitter?: EventTarget | null }).submitter
      : null;

  if (
    submitter instanceof HTMLButtonElement &&
    submitter.value === "saveAndCreateNew"
  ) {
    return "saveAndCreateNew";
  }
  return "save";
}
