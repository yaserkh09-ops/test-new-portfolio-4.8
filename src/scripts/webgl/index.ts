/* =============================================================================
   WebGL gate. Imported after first paint (and only when motion is allowed).
   Rejects: no WebGL, low memory (deviceMemory < 4), and software renderers
   (SwiftShader / llvmpipe / Microsoft Basic) via WEBGL_debug_renderer_info — in
   all those cases the static SVG dot-grid / band simply remains.
   ========================================================================== */
export function initWebGL() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem < 4) return;

  // Capability probe.
  const probe = document.createElement("canvas");
  const gl =
    probe.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
    probe.getContext("experimental-webgl") as WebGLRenderingContext | null;
  if (!gl) return;

  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = dbg
    ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "").toLowerCase()
    : "";
  const software = /swiftshader|llvmpipe|software|basic render|microsoft basic/.test(renderer);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  if (software) return;

  const heroCanvas = document.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
  const footerCanvas = document.querySelector<HTMLCanvasElement>("[data-footer-canvas]");

  if (heroCanvas) {
    import("./hero").then((m) => m.initHeroField(heroCanvas)).catch(() => {});
  }
  if (footerCanvas) {
    import("./footer").then((m) => m.initFooterBand(footerCanvas)).catch(() => {});
  }
}
