import type { APIRoute } from "astro";
import { locales } from "../i18n";

// Static sitemap with hreflang alternates, origin derived from the deploy env.
export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? "https://yasir.studio";
  const alts = Object.values(locales)
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${origin}${l.path}"/>`)
    .join("\n");
  const xdefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en/"/>`;

  const entries = Object.values(locales)
    .map(
      (l) => `  <url>
    <loc>${origin}${l.path}</loc>
${alts}
${xdefault}
  </url>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
