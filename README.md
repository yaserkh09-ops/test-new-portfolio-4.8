# YASIR_ — bilingual studio portfolio

An Awwwards-caliber, bilingual (EN/AR) one-page portfolio for an independent web
design & development studio. The identity is **an engineered system that proves
its own claims**: a visible dot grid, monospaced metrics, a single green that
means "test passed," a published WCAG contrast ratio, and one bilingual motif —
the **Stroke** (the Latin underscore `_` and the Arabic kashida `ـ`, both a
horizontal baseline stroke).

## Stack

- **[Astro](https://astro.build)** — static output, two hand-authored locale trees.
- **Vanilla CSS custom properties** — logical properties only (`margin-inline`,
  `inset-block`, …); no utility framework.
- **[GSAP](https://gsap.com)** + ScrollTrigger + CustomEase — scroll motion, the
  single pinned scene, reveals, magnetic buttons.
- **[Lenis](https://lenis.studio)** — smooth scroll (never created on the
  reduced-motion path).
- **[OGL](https://github.com/oframe/ogl)** — the WebGL hero field and footer band,
  dynamically imported after first paint.
- **View Transitions API** — theme toggle (same-document radial wipe) and locale
  switch (cross-document).
- Self-hosted **IBM Plex** WOFF2 subsets (SIL OFL, committed).

No other runtime dependencies. Ask before adding any.

## Develop

```bash
npm install
npm run dev        # localhost dev server
npm run build      # static build -> dist/
npm run preview    # serve dist/
npm run contrast   # WCAG contrast proof (CI-gateable, exits non-zero on regress)
```

Node 22. Deploys to Netlify as a static site (`netlify.toml`).

## Architecture

```
public/
  fonts/            self-hosted IBM Plex subsets + LICENSE-OFL.txt
  metrics.json      live Lighthouse metrics (null until measured — never faked)
  favicon.svg
src/
  i18n/             en.ts / ar.ts (sibling copy) + locale registry
  styles/           tokens.css (design system) · fonts.css · global.css
  layouts/          BaseLayout.astro (head/SEO, pre-paint theme, landmarks)
  components/        Nav, Hero, StatusTerminal, DotGrid, Ticker, Work, System,
                    Proof, Contact, Footer, Preloader, Wordmark
  pages/            /en/, /ar/, / (locale redirect), sitemap.xml, robots.txt
  scripts/
    main.ts         ALWAYS-ON, GSAP-free entry; gates the heavy bundles
    motion/         GSAP/Lenis bundle — dynamic-imported only when motion is OK
    webgl/          OGL islands + capability gate (GPU/memory/software-GL)
scripts/
  contrast.mjs      WCAG verifier
  fallback-metrics.py  recomputes the CLS-0 fallback font overrides
```

### The reduced-motion contract

`prefers-reduced-motion: reduce` gets **full parity**, not a degraded page. The
decision is made pre-paint by an inline script. On that path:

- GSAP/Lenis and the OGL islands **never download** (the motion bundle is a
  dynamic `import()` gated on the media query in `main.ts`).
- The preloader is skipped entirely; the marquee becomes a static wrapped list;
  the pinned System scene becomes an unpinned static list; counters show their
  server-rendered finals; the custom cursor and magnetic effects are off.
- Content is byte-for-byte identical.

### Honest metrics

The hero **status terminal** types out the real values from
`public/metrics.json`, which ships with `null` placeholders rendered as `—` and a
TODO to wire Lighthouse CI. A green pass-dot springs in **only** when a real value
meets its target (perf ≥ 95, a11y = 100, LCP ≤ 2500 ms). Nothing is ever faked —
that is the entire pitch.

### Contrast is proven, not asserted

`npm run contrast` computes WCAG 2.1 ratios for every token pair and the glass
rule. It confirms the published **17.48:1** headline ratio (ink on paper) and that
text-on-glass must be full ink/paper: over the worst-case particle backdrop, stone
tones drop below 4.5:1 while ink/paper stay above it — which is why only ink/paper
text and non-text green (pass-dots/strokes) are allowed on glass. The script exits
non-zero on regression, so it can gate CI.

### Bilingual / RTL

Two natively-authored trees (`/en`, `/ar`) — the Arabic is sibling copy, never a
translation. `<html lang dir>` per tree; every GSAP x-value reads `dir` and flips
sign; the marquee reverses; the System progress Stroke and work-card reveals are
direction-aware. Arabic is right-aligned ragged (never justified), never
letter-spaced, with Western digits. Mono labels and client names stay Latin in
both trees. Wordmarks: EN `YASIR_` (Plex Mono, the `_` is part of the mark), AR
`ياســر` (Plex Sans Arabic Bold, two kashida).

## Per-island bundle sizes (gzipped)

From `npm run build` (chunk hashes vary per build):

| Island | Raw | Gzip | Loads when |
| --- | --- | --- | --- |
| Always-on entry (`main.ts`) | ~5.3 kB | ~2.3 kB | always |
| WebGL gate | ~1.1 kB | ~0.7 kB | after first paint, motion on |
| OGL vendor (shared) | ~44.6 kB | ~13.1 kB | hero/footer init |
| Hero field | ~5.9 kB | ~2.7 kB | hero in view |
| Footer band | ~3.0 kB | ~1.5 kB | footer in view |
| Motion (GSAP+ScrollTrigger+CustomEase+Lenis) | ~143.9 kB | ~55.1 kB | motion on, after paint |

The reduced-motion path ships only the always-on entry (~2.3 kB gz). CSS is small
and inlined where Astro decides it helps.

## Top performance risks + fixes

1. **Motion bundle (~55 kB gz)** dominates the JS budget. It is already deferred
   (dynamic import after first paint, excluded under reduced motion), so it does
   not affect LCP/TBT of the critical path. To shrink further: tree-shake to only
   the GSAP pieces used, or replace ScrollTrigger-light features with IO + WAAPI.
2. **WebGL on mid-tier GPUs.** Mitigated by the DPR≤1.75 cap, the ~40 k point
   cap, offscreen/hidden rAF pausing, and rejecting software renderers + low
   memory. Tune `TARGET_POINTS`/point size if TBT regresses on low-end devices.
3. **Font swap.** Three above-the-fold faces are preloaded per locale and the
   metric-matched fallbacks hold CLS at 0; the non-preloaded weights swap silently.
4. **Self-hosted fonts caching.** `netlify.toml` long-caches `/fonts/*` and
   `/_astro/*` as immutable.

## Wiring real Lighthouse numbers

Add a Lighthouse CI step that runs against the deployed (or previewed) site and
writes `performance`, `accessibility` and `lcp` into `public/metrics.json`, then
commit it. The terminal and pass-dots pick the values up automatically.

> Dev-only `npm audit` notes (esbuild dev server, Astro `define:vars`) do not
> affect the static production output — none of those code paths are used here.

## License

Code: MIT. Fonts: SIL OFL 1.1 (see `public/fonts/LICENSE-OFL.txt`).
