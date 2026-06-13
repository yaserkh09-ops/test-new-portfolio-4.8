/* =============================================================================
   i18n registry. Two natively-authored locale trees (not translations of each
   other). The English and Arabic content live in sibling modules; this file
   only wires locale metadata (dir, paths, the "other" locale for the switcher).
   ========================================================================== */
import { en } from "./en";
import { ar } from "./ar";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

/** A Lighthouse-style terminal row. Value is filled from /metrics.json. */
export interface TerminalRow {
  /** Key into metrics.json. */
  key: "performance" | "accessibility" | "lcp";
  /** Latin mono label — identical in both trees. */
  label: string;
  /** Pass threshold. */
  target: number;
  /** How `value` is compared to `target` for the pass-dot. */
  compare: "gte" | "lte";
  /** Display unit suffix (e.g. "ms"); "" for unitless scores. */
  unit: string;
}

export interface WorkCard {
  /** Client name — stays LATIN in both trees. */
  client: string;
  sector: string;
  year: string;
  body: string;
}

export interface SystemStep {
  /** "01"…"04" */
  n: string;
  /** Latin mono word — stays LATIN in both trees (Discover…Handoff). */
  label: string;
  body: string;
}

export interface ProofMetric {
  /** Count-up target. */
  num: number;
  /** Decimal places to render while counting. */
  decimals: number;
  /** Rendered after the number (":1", "px", "%"). */
  suffix: string;
  /** Final string shown server-side / under reduced motion (SEO + no-JS). */
  display: string;
  label: string;
}

export interface Content {
  meta: { title: string; description: string };
  nav: { work: string; process: string; contact: string; localeSwitch: string };
  hero: {
    eyebrow: string;
    h1Lines: string[];
    sub: string;
    cta: string;
    ctaNote: string;
  };
  terminal: {
    title: string;
    cmd: string;
    notMeasured: string;
    metricsNote: string;
    rows: TerminalRow[];
  };
  ticker: string[];
  work: { heading: string; line: string; cardCta: string; cards: WorkCard[] };
  system: { heading: string; steps: SystemStep[] };
  proof: { line: string; metrics: ProofMetric[] };
  cta: {
    label: string;
    heading: string;
    line: string;
    button: string;
    emailLabel: string;
  };
  footer: { a11yNote: string; credit: string; rights: string };
  /** Contact target. TODO: replace placeholder with the studio's real inbox. */
  email: { address: string; subject: string };
}

export interface LocaleMeta {
  code: Locale;
  dir: Dir;
  /** <html lang>. */
  htmlLang: string;
  /** Root path of the tree. */
  path: string;
  content: Content;
  /** The OTHER locale — drives the switcher (label is in the other language). */
  other: { code: Locale; path: string };
}

export const content: Record<Locale, Content> = { en, ar };

export const locales: Record<Locale, LocaleMeta> = {
  en: {
    code: "en",
    dir: "ltr",
    htmlLang: "en",
    path: "/en/",
    content: en,
    other: { code: "ar", path: "/ar/" },
  },
  ar: {
    code: "ar",
    dir: "rtl",
    htmlLang: "ar",
    path: "/ar/",
    content: ar,
    other: { code: "en", path: "/en/" },
  },
};

/** Brand wordmarks. EN context shows only YASIR_; AR context only ياســر.
 *  AR mark carries two kashida (U+0640) between seen and reh. */
export const wordmark: Record<Locale, string> = {
  en: "YASIR_",
  ar: "ياســر",
};

export const ALL_LOCALES: Locale[] = ["en", "ar"];
