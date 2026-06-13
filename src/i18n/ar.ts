import type { Content } from "./index";

/* Arabic locale tree — authored natively as sibling copy (never a translation
   of the English). Right-aligned ragged setting and Western digits are handled
   in CSS; client names, mono labels and the eyebrow stay Latin by design. */
export const ar: Content = {
  meta: {
    title: "ياسر — استوديو مستقل للتصميم والويب",
    description:
      "مواقع وأنظمة هوية بالعربية والإنجليزية للمؤسسات في السعودية — تُبنى على معايير قابلة للتحقق، وتُكتب لتُقنع، وتُسلَّم بسرعة.",
  },
  nav: {
    work: "الأعمال",
    process: "المنهجية",
    contact: "تواصل",
    localeSwitch: "English",
  },
  hero: {
    // The eyebrow stays in English in both trees (verbatim from brief).
    eyebrow: "Independent web design & development partner",
    h1Lines: ["أنظمة تصميم.", "سريعة، مُيسّرة الوصول،", "يمكن الاعتماد عليها."],
    sub: "أبني مواقع وأنظمة هوية بالعربية والإنجليزية للمؤسسات في السعودية — كل لغة تُكتب لقارئها، وكل ادعاء يُقاس.",
    cta: "ابدأ مشروعًا",
    ctaNote: "أردّ بالعربية أو الإنجليزية",
  },
  terminal: {
    title: "yasir@studio — lighthouse",
    cmd: "lighthouse --preset=mobile ./",
    notMeasured: "لم تُقَس بعد",
    metricsNote: "تُنشر بعد قياسها — لا تُدّعى قبله.",
    rows: [
      { key: "performance", label: "Performance", target: 95, compare: "gte", unit: "" },
      { key: "accessibility", label: "Accessibility", target: 100, compare: "gte", unit: "" },
      { key: "lcp", label: "LCP", target: 2500, compare: "lte", unit: "ms" },
    ],
  },
  ticker: [
    "لغتان، كل منهما تُكتب من الصفر",
    "أنظمة هوية تُدار بحوكمة واضحة",
    "Lighthouse 100 · WCAG 2.1 AA",
    "المنصة المناسبة لكل عميل",
    "فريقكم يدير الموقع بعد التسليم",
  ],
  work: {
    heading: "أعمال مختارة.",
    line: "النتيجة قبل التسليم — كل مشروع يوثّق ما الذي تغيّر.",
    cardCta: "اطّلع على المشروع",
    cards: [
      {
        client: "Najd Hands",
        sector: "قطاع غير ربحي",
        year: "2025",
        body: "موقع جمعية خيرية أُعيد بناؤه باللغتين — كلٌّ منهما كُتبت من الصفر لقارئها.",
      },
      {
        client: "SIPHA",
        sector: "قطاع صحي",
        year: "2025",
        body: "نظام هوية وموقع لمورّد دوائي — موثّق، محكوم، وجاهز للتسليم.",
      },
      {
        client: "Four Colors",
        sector: "طباعة وإنتاج",
        year: "2026",
        body: "كتالوج مطبعة انتقل إلى الويب — سريع على الهواتف التي يستخدمها عملاؤها فعلًا.",
      },
      {
        client: "Anjal Schools",
        sector: "تعليم",
        year: "2026",
        body: "موقع مدرسي يهتدي فيه أولياء الأمور بسهولة — لغتان وبنية واحدة.",
      },
    ],
  },
  system: {
    heading: "منهجية واحدة، أربع بوابات.",
    // Mono labels stay Latin (01 Discover … 04 Handoff).
    steps: [
      {
        n: "01",
        label: "Discover",
        body: "أبدأ بالإصغاء: أهدافكم وجمهوركم وقيودكم تُكتب ويُتّفق عليها قبل أي تصميم.",
      },
      {
        n: "02",
        label: "Design",
        body: "نظام لا شاشات: ألوان وخطوط ومكوّنات تحكم كل صفحة تأتي لاحقًا.",
      },
      {
        n: "03",
        label: "Engineer",
        body: "بناء بالأرقام — Lighthouse وWCAG 2.1 AA ومؤشرات الويب الأساسية — تُقاس مع كل إصدار.",
      },
      {
        n: "04",
        label: "Handoff",
        body: "توثيق وتدريب حتى يدير فريقكم الموقع من دوني.",
      },
    ],
  },
  proof: {
    line: "الأرقام ادعاءات — وهذه مُقاسة.",
    metrics: [
      {
        num: 17.48,
        decimals: 2,
        suffix: ":1",
        display: "17.48:1",
        label: "نسبة تباين العناوين، محسوبة وفق WCAG 2.1",
      },
      {
        num: 44,
        decimals: 0,
        suffix: "px",
        display: "44px",
        label: "أصغر هدف تفاعلي في هذا الموقع",
      },
      {
        num: 100,
        decimals: 0,
        suffix: "%",
        display: "100%",
        label: "النص كله HTML حي — قابل للتحديد والفهرسة",
      },
    ],
  },
  cta: {
    label: "03 — Contact",
    heading: "أخبرني ما الذي يجب أن يعمل.",
    line: "ردّ واحد خلال يوم في الغالب — بالعربية أو الإنجليزية، كما تفضّل.",
    button: "ابدأ مشروعًا",
    emailLabel: "أو راسلني مباشرة:",
  },
  footer: {
    a11yNote: "الحركة تحترم إعدادات نظامك.",
    credit: "Designed by YASIR_ · تصميم ياسر",
    rights: "© 2026 — كل الأعمال معروضة بإذن أصحابها.",
  },
  email: {
    address: "hello@yasir.studio",
    subject: "ابدأ مشروعًا",
  },
};
