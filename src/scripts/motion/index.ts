/* =============================================================================
   MOTION bundle — dynamically imported ONLY when motion is allowed (so GSAP +
   Lenis never download on the reduced-motion path). Everything direction-aware:
   x-values read the document dir and flip sign.
   ========================================================================== */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";
import { initCursor } from "./cursor";

interface MotionOpts {
  finePointer: boolean;
}

export function initMotion({ finePointer }: MotionOpts) {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // The one easing, everywhere.
  CustomEase.create("brand", "0.22, 1, 0.36, 1");
  gsap.defaults({ ease: "brand", duration: 0.7 });

  const rtl = document.documentElement.dir === "rtl";

  // --- Lenis smooth scroll, driven by the GSAP ticker ------------------
  const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  heroReveal();
  workReveal(rtl);
  systemScene();
  proofCounters();
  contactStroke();
  if (finePointer) {
    initCursor();
    initMagnetic();
  }

  // Recalc trigger positions once late assets (fonts) settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

/* --- Hero: per-line baseline clip reveal + subtle scroll parallax ----- */
function heroReveal() {
  const lines = gsap.utils.toArray<HTMLElement>("[data-line]");
  if (lines.length) {
    // Wait out the preloader on first visit so the reveal isn't hidden by it.
    const delay = document.documentElement.dataset.preload === "show" ? 0.95 : 0.12;
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, { yPercent: 0, duration: 0.95, stagger: 0.06, delay });

    // Per-line parallax vs scroll (capped at 24px).
    lines.forEach((line, i) => {
      gsap.to(line, {
        y: -((i + 1) * 8),
        ease: "none",
        scrollTrigger: {
          trigger: "[data-hero]",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  gsap.from(["[data-hero] .hero__eyebrow", "[data-hero-sub]", "[data-hero] .hero__cta"], {
    autoAlpha: 0,
    y: 16,
    duration: 0.8,
    stagger: 0.08,
    delay: (document.documentElement.dataset.preload === "show" ? 0.95 : 0.12) + 0.25,
  });
}

/* --- Work cards: inset clip reveal along the grid + 1.04 -> 1.0 ------- */
function workReveal(rtl: boolean) {
  const fromClip = rtl ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
  gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
    const media = card.querySelector<HTMLElement>("[data-card-media]");
    const placeholder = card.querySelector<HTMLElement>(".card__placeholder");
    const info = card.querySelector<HTMLElement>(".card__info");
    const st = { trigger: card, start: "top 78%", once: true } as const;

    if (media) gsap.fromTo(media, { clipPath: fromClip }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, scrollTrigger: st });
    if (placeholder) gsap.fromTo(placeholder, { scale: 1.04 }, { scale: 1.0, duration: 1.0, scrollTrigger: st });
    if (info) gsap.from(info, { autoAlpha: 0, y: 18, duration: 0.8, scrollTrigger: st });
  });
}

/* --- The System: the page's single pinned scene ---------------------- */
function systemScene() {
  const scene = document.querySelector<HTMLElement>("[data-system-scene]");
  if (!scene) return;
  const ticks = Array.from(scene.querySelectorAll<HTMLElement>("[data-tick]"));
  const bodies = Array.from(scene.querySelectorAll<HTMLElement>("[data-body]"));
  const fill = scene.querySelector<HTMLElement>("[data-system-fill]");
  if (ticks.length === 0) return;

  // Only pin on wider screens (the mobile layout is an unpinned list).
  if (window.matchMedia("(max-width: 60rem)").matches) return;

  scene.dataset.enhanced = "true";
  const setActive = (idx: number) => {
    ticks.forEach((t, i) => (t.dataset.active = String(i === idx)));
    bodies.forEach((b, i) => (b.dataset.active = String(i === idx)));
  };
  setActive(0);

  const steps = ticks.length;
  ScrollTrigger.create({
    trigger: scene,
    start: "center center",
    end: "+=150%",
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      if (fill) gsap.set(fill, { scaleX: p }); // origin inline-start => direction-aware
      setActive(Math.min(steps - 1, Math.floor(p * steps * 0.999)));
    },
  });
}

/* --- Proof: count up on first viewport entry ------------------------- */
function proofCounters() {
  gsap.utils.toArray<HTMLElement>("[data-metric]").forEach((metric) => {
    const numEl = metric.querySelector<HTMLElement>("[data-count-num]");
    if (!numEl) return;
    const target = parseFloat(numEl.dataset.num ?? "0");
    const decimals = parseInt(numEl.dataset.decimals ?? "0", 10);

    // Reset to 0 only if it's still below the fold (avoid a flash if in view).
    if (metric.getBoundingClientRect().top > window.innerHeight) {
      numEl.textContent = (0).toFixed(decimals);
    }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: metric,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: "brand",
          onUpdate: () => (numEl.textContent = obj.v.toFixed(decimals)),
        }),
    });
  });
}

/* --- Contact: the wordmark's Stroke draws in on scroll entry ---------- */
function contactStroke() {
  const stroke = document.querySelector<HTMLElement>("[data-wordmark-stroke]");
  if (!stroke) return;
  gsap.fromTo(
    stroke,
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: 0.9,
      scrollTrigger: { trigger: "[data-contact-mark]", start: "top 82%", once: true },
    },
  );
}

/* --- Magnetic primary buttons (<=6px, pointer:fine) ------------------ */
function initMagnetic() {
  gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "brand" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "brand" });
    const pull = 6;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      xTo(Math.max(-1, Math.min(1, dx)) * pull);
      yTo(Math.max(-1, Math.min(1, dy)) * pull);
    });
    el.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}
