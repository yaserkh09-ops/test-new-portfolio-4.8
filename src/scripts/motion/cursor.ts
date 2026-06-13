/* =============================================================================
   Custom cursor: 6px ink dot + trailing 28px ring that FLATTENS into a short
   green Stroke over interactive elements. Rules honoured:
   - pointer:fine only (caller already checked); native cursor is NEVER hidden
     for keyboard/touch.
   - rAF pauses when the tab is hidden.
   - All transforms are physical px (cursor lives in screen space, not flow), so
     RTL needs no special-casing here.
   ========================================================================== */
export function initCursor() {
  const layer = document.querySelector<HTMLElement>(".cursor");
  const dot = document.querySelector<HTMLElement>(".cursor__dot");
  const ring = document.querySelector<HTMLElement>(".cursor__ring");
  if (!layer || !dot || !ring) return;

  // Hide the native cursor only now that we know it's a fine pointer + motion OK.
  layer.hidden = false;
  document.documentElement.classList.add("has-custom-cursor");

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let visible = false;
  let over = false;
  let raf = 0;

  const interactiveSel = "a, button, [data-magnetic], input, select, textarea, [tabindex]:not([tabindex='-1'])";

  const onMove = (e: PointerEvent) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      layer.style.opacity = "1";
    }
    const el = e.target as Element | null;
    over = !!el?.closest(interactiveSel);
    ring.dataset.over = String(over);
  };

  const onLeave = () => {
    visible = false;
    layer.style.opacity = "0";
  };

  const render = () => {
    // Dot tracks tightly; ring lags (springy trail).
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    ring.style.transform = over
      ? `translate(${rx}px, ${ry}px) scaleX(1.1)`
      : `translate(${rx}px, ${ry}px)`;
    raf = requestAnimationFrame(render);
  };

  const start = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
  // Drop the custom cursor entirely if a touch event shows up.
  window.addEventListener(
    "touchstart",
    () => {
      stop();
      layer.hidden = true;
      document.documentElement.classList.remove("has-custom-cursor");
    },
    { once: true, passive: true },
  );

  start();
}
