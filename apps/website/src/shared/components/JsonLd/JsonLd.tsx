type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Server-safe JSON-LD script for SEO entity pages. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}
