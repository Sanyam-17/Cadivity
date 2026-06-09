/**
 * Injects JSON-LD structured data into the page <head>.
 * This is a Server Component — no "use client" needed.
 *
 * @example
 * <JsonLd data={{
 *   "@context": "https://schema.org",
 *   "@type": "Course",
 *   name: "My Course"
 * }} />
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
