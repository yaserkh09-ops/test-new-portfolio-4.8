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
    inlineStylesheets: "never",
    assets: "_astro",
  },
  vite: {
    build: {
      // Keep the WebGL/motion islands as their own chunks so we can report
      // and reason about per-island bundle sizes.
      cssMinify: "lightningcss",
    },
  },
});
