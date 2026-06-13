import { defineConfig } from "astro/config";

// Derive the canonical site origin from the deploy environment.
// Netlify exposes the production URL as `process.env.URL`; fall back to a
// placeholder for local builds so canonical/hreflang/OG tags still resolve.
const SITE = process.env.URL || "https://yasir.studio";

// https://astro.build
export default defineConfig({
  site: SITE,
  output: "static",
  // We author two locale trees by hand (/en, /ar) for full control over the
  // natively-written copy, so Astro's i18n router stays out of the way.
  trailingSlash: "always",
  build: {
    inlineStylesheets: "auto",
    assets: "_astro",
  },
});
