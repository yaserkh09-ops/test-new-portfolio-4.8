#!/usr/bin/env node
/* =============================================================================
   WCAG 2.1 contrast verifier.  `npm run contrast`

   Proves the claims the design makes about itself:
   1. The published headline ratio (17.48:1, ink on paper) is real.
   2. Body / secondary / accent text clear their WCAG AA thresholds in BOTH modes.
   3. THE GLASS RULE: text on glass must be full ink/paper. Over the worst-case
      particle backdrop (a dark ink point in light mode / a light paper point in
      dark mode showing through the 22-28% transparency), ink/paper PASS 4.5:1
      while every stone tone FAILS — which is exactly why stone is forbidden as
      text-on-glass and only green pass-dots/strokes (non-text) are allowed.

   Exits non-zero if any guaranteed relationship regresses, so CI can gate on it.
   ========================================================================== */

// --- sRGB -> relative luminance (WCAG 2.1) ---------------------------------
function srgbToLin(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function luminance([r, g, b]) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function ratio(fg, bg) {
  const a = luminance(hexToRgb(fg));
  const b = luminance(hexToRgb(bg));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}
/** Alpha-composite `top` (with alpha 0..1) over opaque `bottom`. */
function over(top, bottom, alpha) {
  const t = hexToRgb(top);
  const b = hexToRgb(bottom);
  return (
    "#" +
    t
      .map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)))
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
  );
}

// --- tokens (mirror of src/styles/tokens.css) ------------------------------
const T = {
  light: {
    paper: "#F8F6F1",
    ink: "#111111",
    stone700: "#57534E",
    stone500: "#6C655F",
    green: "#0B7A40",
    error: "#B42318",
    white: "#FFFFFF",
    glassAlpha: 0.78, // paper 78% over transparent
    glassBase: "#F8F6F1",
  },
  dark: {
    surface: "#161513",
    panel: "#211F1B",
    paper: "#F8F6F1",
    stone400: "#A8A29A",
    green: "#3FBF7F",
    error: "#F08C7D",
    glassAlpha: 0.72, // surface 72% over transparent
    glassBase: "#161513",
  },
};

const AA = 4.5; // normal text
const AA_LARGE = 3.0; // large text / UI

let failures = 0;
const fmt = (n) => n.toFixed(2).padStart(6);
function check(label, r, min, mustPass = true) {
  const pass = r >= min;
  const ok = pass === mustPass;
  if (!ok) failures++;
  const verdict = pass ? "PASS" : "fail";
  const flag = ok ? "  " : "!!";
  console.log(`${flag} ${fmt(r)}:1  [need ${min} -> ${verdict}]  ${label}`);
}

console.log("\n=== LIGHT MODE — text on solid backgrounds ===");
const L = T.light;
check("ink on paper  (HEADLINE — published 17.48:1)", ratio(L.ink, L.paper), 7);
check("ink on white card", ratio(L.ink, L.white), AA);
check("stone-700 (text-2) on paper", ratio(L.stone700, L.paper), AA);
check("stone-500 (text-3/caption) on paper", ratio(L.stone500, L.paper), AA);
check("signal-green (links/accent) on paper", ratio(L.green, L.paper), AA);
check("error on paper", ratio(L.error, L.paper), AA);
check("paper on signal-green (button text)", ratio(L.paper, L.green), AA);

console.log("\n=== DARK MODE — text on solid backgrounds ===");
const D = T.dark;
check("paper on surface (body/headline)", ratio(D.paper, D.surface), 7);
check("paper on panel (cards)", ratio(D.paper, D.panel), AA);
check("stone-400 (text-2) on surface", ratio(D.stone400, D.surface), AA);
check("signal-green-d (accent) on surface", ratio(D.green, D.surface), AA);
check("error-d on surface", ratio(D.error, D.surface), AA);
check("surface on signal-green-d (button text)", ratio(D.surface, D.green), AA);

console.log("\n=== THE GLASS RULE — worst-case particle backdrop ===");
console.log("    (glass = mode bg at its alpha, composited over the darkest/");
console.log("     lightest particle that can show through the transparency)\n");

// LIGHT: worst case is an INK particle showing through -> darkest effective glass.
const lGlassWorst = over(L.glassBase, L.ink, L.glassAlpha);
console.log(`    light glass over ink particle = ${lGlassWorst}`);
check("ink text on worst-case light glass  (ALLOWED)", ratio(L.ink, lGlassWorst), AA, true);
check("stone-700 on worst-case light glass (FORBIDDEN -> must fail)", ratio(L.stone700, lGlassWorst), AA, false);
check("stone-500 on worst-case light glass (FORBIDDEN -> must fail)", ratio(L.stone500, lGlassWorst), AA, false);
// Green on glass is NON-TEXT only (pass-dots/strokes) — checked at large/UI 3:1.
check("green pass-dot on light glass (non-text, 3:1 UI)", ratio(L.green, lGlassWorst), AA_LARGE);

// DARK: worst case is a PAPER particle showing through -> lightest effective glass.
const dGlassWorst = over(D.glassBase, D.paper, D.glassAlpha);
console.log(`\n    dark glass over paper particle = ${dGlassWorst}`);
check("paper text on worst-case dark glass  (ALLOWED)", ratio(D.paper, dGlassWorst), AA, true);
check("stone-400 on worst-case dark glass   (FORBIDDEN -> must fail)", ratio(D.stone400, dGlassWorst), AA, false);
check("green-d pass-dot on dark glass (non-text, 3:1 UI)", ratio(D.green, dGlassWorst), AA_LARGE);

console.log(
  `\n${failures === 0 ? "✓ all contrast guarantees hold" : `✗ ${failures} contrast guarantee(s) regressed`}\n`,
);
process.exit(failures === 0 ? 0 : 1);
