export const TEMPLATE_VERSION = "2.0";

type TemplateFetchOptions = RequestInit & {
  locale?: string;
  expectedFormat?: "json" | "text" | "markdown";
};

/**
 * Adds non-sensitive product context to future browser requests.
 * The destination API must explicitly allow custom headers through CORS.
 */
export function templateFetch(input: RequestInfo | URL, options: TemplateFetchOptions = {}) {
  const { locale = "es-PE", expectedFormat = "json", headers, ...init } = options;
  const enrichedHeaders = new Headers(headers);

  if (!enrichedHeaders.has("Accept")) {
    enrichedHeaders.set(
      "Accept",
      expectedFormat === "markdown"
        ? "text/markdown, text/plain;q=0.9"
        : `application/${expectedFormat}`,
    );
  }

  enrichedHeaders.set("X-Client-Locale", locale);
  enrichedHeaders.set("X-Client-Type", "web-template");
  enrichedHeaders.set("X-Template-Version", TEMPLATE_VERSION);

  return fetch(input, { ...init, headers: enrichedHeaders });
}
