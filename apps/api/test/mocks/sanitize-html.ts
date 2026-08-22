type Transform = (
  tagName: string,
  attributes: Record<string, string>,
) => { tagName: string; attribs: Record<string, string> };

type SanitizeHtmlTestDouble = {
  (dirty: string): string;
  simpleTransform(
    tagName: string,
    attributes: Record<string, string>,
  ): Transform;
};

/**
 * The API integration suite only boots the Nest graph and never persists rich
 * text. Runtime/smoke tests still exercise the real sanitizer; this CommonJS-
 * friendly double prevents Jest 30 from trying to require htmlparser2's ESM
 * bundle while constructing AppModule.
 */
const sanitizeHtml = ((dirty: string) => dirty) as SanitizeHtmlTestDouble;

sanitizeHtml.simpleTransform =
  (tagName, attributes) => (_sourceTagName, sourceAttributes) => ({
    tagName,
    attribs: { ...sourceAttributes, ...attributes },
  });

export default sanitizeHtml;
