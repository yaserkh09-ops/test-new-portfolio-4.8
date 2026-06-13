import type { Content } from "./index";

/* English locale tree — authored natively (the Arabic tree is a sibling, not a
   translation). Copy is used verbatim. Mono labels and client names stay Latin. */
export const en: Content = {
  meta: {
    title: "YASIR_ — Independent design & web studio",
    description:
      "Bilingual Arabic/English websites and brand systems for Saudi organizations — engineered to verifiable standards, written to convert, delivered fast.",
  },
  nav: {
    work: "Work",
    process: "Process",
    contact: "Contact",
    localeSwitch: "العربية",
  },
  hero: {
    eyebrow: "Independent web design & development partner",
    h1Lines: ["Design systems.", "Fast, accessible,", "reliable."],
    sub: "I build Arabic/English websites and brand systems for Saudi organizations — each language written natively, every claim measured.",
    cta: "Start a project",
    ctaNote: "Replies in English or Arabic",
  },
  terminal: {
    title: "yasir@studio — lighthouse",
    cmd: "lighthouse --preset=mobile ./",
    notMeasured: "not yet measured",
    metricsNote: "Published when measured — never claimed.",
    rows: [
      { key: "performance", label: "Performance", target: 95, compare: "gte", unit: "" },
      { key: "accessibility", label: "Accessibility", target: 100, compare: "gte", unit: "" },
      { key: "lcp", label: "LCP", target: 2500, compare: "lte", unit: "ms" },
    ],
  },
  ticker: [
    "Two languages, each written natively",
    "Brand systems with governance",
    "Lighthouse 100 · WCAG 2.1 AA · technical SEO",
    "The right platform, per client",
    "Your team runs it after handoff",
  ],
  work: {
    heading: "Selected work.",
    line: "Outcomes over deliverables — each case records what changed.",
    cardCta: "View case",
    cards: [
      {
        client: "Najd Hands",
        sector: "Nonprofit",
        year: "2025",
        body: "A charity site rebuilt in both languages — each written from scratch for its reader.",
      },
      {
        client: "SIPHA",
        sector: "Healthcare",
        year: "2025",
        body: "Brand system and site for a pharma supplier — governed, documented, handed off.",
      },
      {
        client: "Four Colors",
        sector: "Print production",
        year: "2026",
        body: "A print house’s catalogue moved online — fast on the phones its clients actually use.",
      },
      {
        client: "Anjal Schools",
        sector: "Education",
        year: "2026",
        body: "A school site parents can navigate — two languages, one structure.",
      },
    ],
  },
  system: {
    heading: "One process, four gates.",
    steps: [
      {
        n: "01",
        label: "Discover",
        body: "Your goals, your users, your constraints — written down and agreed before anything is drawn.",
      },
      {
        n: "02",
        label: "Design",
        body: "A system, not screens: tokens, type and components that govern every page that follows.",
      },
      {
        n: "03",
        label: "Engineer",
        body: "Built to numbers — Lighthouse, WCAG 2.1 AA, Core Web Vitals — measured on every release.",
      },
      {
        n: "04",
        label: "Handoff",
        body: "Documentation and training until your team runs it without me.",
      },
    ],
  },
  proof: {
    line: "Numbers are claims. These are measured.",
    metrics: [
      {
        num: 17.48,
        decimals: 2,
        suffix: ":1",
        display: "17.48:1",
        label: "Headline contrast ratio, computed per WCAG 2.1",
      },
      {
        num: 44,
        decimals: 0,
        suffix: "px",
        display: "44px",
        label: "Smallest interactive target on this site",
      },
      {
        num: 100,
        decimals: 0,
        suffix: "%",
        display: "100%",
        label: "Text shipped as live HTML — selectable, indexable",
      },
    ],
  },
  cta: {
    label: "03 — Contact",
    heading: "Tell me what needs to work.",
    line: "One reply, usually within a day — in English or Arabic, whichever you prefer.",
    button: "Start a project",
    emailLabel: "Or write directly:",
  },
  footer: {
    a11yNote: "Motion respects your system preferences.",
    credit: "Designed by YASIR_ · تصميم ياسر",
    rights: "© 2026 — All work shown with permission.",
  },
  email: {
    address: "hello@yasir.studio",
    subject: "Start a project",
  },
};
