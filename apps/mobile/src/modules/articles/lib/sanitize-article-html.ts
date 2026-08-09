import DOMPurify from "isomorphic-dompurify";

/** Client-side defense in depth; API also sanitizes on write. */
export function sanitizeArticleHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
}
