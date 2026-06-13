/* =============================================================================
   ALWAYS-ON entry. Dependency-free (no GSAP) so it runs on every path, including
   reduced-motion. It wires controls + light enhancements, then GATES the heavy
   bundles behind capability checks:
     - motion (GSAP / ScrollTrigger / CustomEase / Lenis) -> only if motion is OK
     - WebGL islands (OGL)                                -> only if motion is OK,
       capable GPU, enough memory, after first paint.
   This guarantees GSAP never even downloads on the reduced-motion path.
   ========================================================================== */
import { EASE } from "./motion/ease";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(pointer: fine)").matches;

/* --- Theme toggle: radial View-Transition wipe from the button -------- */
function initTheme() {
  const root = document.documentElement;
  const toggles = document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]");

  const syncPressed = () => {
    const isDark = root.dataset.theme === "dark";
    toggles.forEach((b) => b.setAttribute("aria-pressed", String(isDark)));
  };
  syncPressed();

  const apply = (next: "light" | "dark") => {
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    syncPressed();
  };

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";

      // No View Transition support / reduced motion -> instant swap.
      if (!("startViewTransition" in document) || prefersReducedMotion()) {
        apply(next);
        return;
      }

      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      root.classList.add("theme-vt");
      const transition = (document as Document & {
        startViewTransition: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
      }).startViewTransition(() => apply(next));

      transition.ready.then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${r}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 480,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
      transition.finished.finally(() => root.classList.remove("theme-vt"));
    });
  });
}

/* --- Persist locale choice (root '/' uses it to route) ---------------- */
function persistLocale() {
  const lang = document.documentElement.lang;
  if (lang === "ar" || lang === "en") {
    try {
      localStorage.setItem("locale", lang);
    } catch {}
  }
}

/* --- Scroll progress Stroke (light; works under reduced motion too) --- */
function initScrollProgress() {
  const bar = document.querySelector<HTMLElement>(".scroll-progress__bar");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${p})`;
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

/* --- Preloader: counter 000->100 synced to load, wipe up (cap 1.1s) --- */
function initPreloader() {
  const root = document.documentElement;
  if (root.dataset.preload !== "show") return;
  try {
    sessionStorage.setItem("yasir:seen", "1");
  } catch {}

  const el = document.querySelector<HTMLElement>("[data-preloader]");
  const counter = document.querySelector<HTMLElement>("[data-preloader-counter]");
  const stroke = document.querySelector<HTMLElement>("[data-preloader-stroke]");
  if (!el || !counter || !stroke) return;

  const CAP = 1100; // wipe just before the 1.2s CSS bail
  let loaded = 0;
  const bump = (v: number) => (loaded = Math.max(loaded, v));
  if (document.readyState === "complete") bump(1);
  window.addEventListener("load", () => bump(1));
  document.fonts?.ready.then(() => bump(0.85));

  let shown = 0;
  let done = false;
  const start = performance.now();

  const finish = () => {
    if (done) return;
    done = true;
    counter.textContent = "100";
    stroke.style.transform = "scaleX(1)";
    el.classList.add("is-done");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  };

  const tick = (now: number) => {
    const t = now - start;
    const target = Math.min(1, Math.max(loaded, t / CAP));
    shown += (target - shown) * 0.18;
    const pct = Math.min(100, Math.round(shown * 100));
    counter.textContent = String(pct).padStart(3, "0");
    stroke.style.transform = `scaleX(${shown.toFixed(3)})`;
    if (t >= CAP || pct >= 100) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* --- Status terminal: type the command, reveal rows, announce once ---- */
function initTerminal() {
  const term = document.querySelector<HTMLElement>("[data-terminal]");
  if (!term) return;

  const live = term.querySelector<HTMLElement>("[data-terminal-live]");
  const notMeasured =
    term.querySelector<HTMLElement>("[data-not-measured]")?.textContent?.trim() ?? "";
  const rows = Array.from(term.querySelectorAll<HTMLElement>("[data-key]"));

  const announce = () => {
    if (!live) return;
    live.textContent = rows
      .map((r) => {
        const label = r.querySelector<HTMLElement>(".terminal__label")?.textContent?.trim();
        const measured = r.dataset.measured === "true";
        const val = r.querySelector<HTMLElement>("[data-value]")?.textContent?.trim();
        return `${label}: ${measured ? val : notMeasured}`;
      })
      .join(". ");
  };

  if (prefersReducedMotion()) {
    announce();
    return;
  }

  // Enter the typed phase: hide rows immediately (no blink), type the command,
  // then reveal rows one by one.
  rows.forEach((r) => (r.style.opacity = "0"));

  const cmdEl = term.querySelector<HTMLElement>("[data-type-cmd]");
  const cmd = cmdEl?.textContent ?? "";
  if (cmdEl) cmdEl.textContent = "";

  let i = 0;
  const typeSpeed = 26;
  const typeCmd = () => {
    if (!cmdEl) return revealRows();
    if (i <= cmd.length) {
      cmdEl.textContent = cmd.slice(0, i);
      i += 1;
      window.setTimeout(typeCmd, typeSpeed);
    } else {
      revealRows();
    }
  };

  const revealRows = () => {
    rows.forEach((row, idx) => {
      const anim = row.animate(
        [
          { opacity: 0, transform: "translateY(5px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 320, delay: 90 * idx, easing: EASE, fill: "backwards" },
      );
      anim.onfinish = () => {
        row.style.opacity = "1";
        row.style.transform = "";
      };
      // Pass-dot springs in only if this row actually passed.
      if (row.dataset.pass === "true") {
        const dot = row.querySelector<HTMLElement>("[data-pass-dot]");
        dot?.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], {
          duration: 420,
          delay: 90 * idx + 180,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          fill: "backwards",
        });
      }
    });
    window.setTimeout(announce, 90 * rows.length + 360);
  };

  // Begin once the hero is on screen (it is, above the fold) but defer a frame.
  requestAnimationFrame(() => window.setTimeout(typeCmd, 260));
}

/* --- Boot ------------------------------------------------------------- */
function boot() {
  initTheme();
  persistLocale();
  initScrollProgress();
  initPreloader();
  initTerminal();

  if (!prefersReducedMotion()) {
    // Motion bundle (GSAP/Lenis) — dynamic import keeps it off the RM path.
    import("./motion")
      .then((m) => m.initMotion({ finePointer: finePointer() }))
      .catch(() => {});

    // WebGL islands — after first paint, capability-gated inside the module.
    const startWebGL = () => import("./webgl").then((m) => m.initWebGL()).catch(() => {});
    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void) => void;
    }).requestIdleCallback;
    if (typeof ric === "function") {
      ric(startWebGL);
    } else {
      window.addEventListener("load", () => window.setTimeout(startWebGL, 200), { once: true });
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
