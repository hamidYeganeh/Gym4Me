export type ReleaseNotesInput = {
  title?: string;
  features?: string[];
};

export type NormalizedReleaseNotes = {
  title: string;
  features: string[];
};

/** Returns null when title/features are missing so the field can be omitted or unset. */
export function normalizeReleaseNotes(
  input?: ReleaseNotesInput | null,
): NormalizedReleaseNotes | null {
  if (!input) return null;
  const title = (input.title ?? '').trim().slice(0, 120);
  const features = (input.features ?? [])
    .map((item) => item.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 8);
  if (!title || features.length === 0) return null;
  return { title, features };
}
