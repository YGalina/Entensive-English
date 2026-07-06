// Лёгкие inline-иконки (Lucide-стиль), без внешних зависимостей.
// По дизайн-системе: иконки — SVG, не эмодзи.

type P = { className?: string };
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Home = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

export const Layers = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
    <path d="M3 13l9 5 9-5" />
    <path d="M3 18l9 5 9-5" />
  </svg>
);

export const Text = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M5 4h14" />
    <path d="M12 4v16" />
    <path d="M8 20h8" />
  </svg>
);

export const Keyboard = (p: P) => (
  <svg {...base} className={p.className}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" />
  </svg>
);

export const Chat = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
    <path d="M8.5 11h7" />
    <path d="M8.5 14h4.5" />
  </svg>
);

export const Play = (p: P) => (
  <svg {...base} className={p.className} fill="currentColor" stroke="none">
    <path d="M7 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

export const Smile = (p: P) => (
  <svg {...base} className={p.className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5a4 4 0 0 0 7 0" />
    <path d="M9 9.5h.01M15 9.5h.01" />
  </svg>
);

export const Sound = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
  </svg>
);

export const Pause = (p: P) => (
  <svg {...base} className={p.className} fill="currentColor" stroke="none">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export const Check = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const Warning = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M12 3 2.5 20h19L12 3Z" />
    <path d="M12 10v4M12 17.5h.01" />
  </svg>
);

export const Spark = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);

export const Flame = (p: P) => (
  <svg {...base} className={p.className} fill="currentColor" stroke="none">
    <path d="M12 2c1.5 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .4-1.8 1-2.5-.2 1.5.8 2.5 1.5 2.5.8 0 1.2-.7 1-1.5C11 6 12 3.5 12 2Z" />
    <path d="M12 22a6 6 0 0 0 6-6c0-2.2-1-3.8-2.2-5.2.2 3-1.8 4.2-3.8 4.2-1.6 0-2.6-1-2.6-2.4 0-.7.2-1.2.5-1.8C8.4 12 7 13.6 7 16a6 6 0 0 0 5 6Z" opacity="0" />
  </svg>
);

export const Sun = (p: P) => (
  <svg {...base} className={p.className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
);

export const Moon = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const X = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Prev = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const Next = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const Repeat = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M17 3l3 3-3 3" />
    <path d="M4 11V9a3 3 0 0 1 3-3h13" />
    <path d="M7 21l-3-3 3-3" />
    <path d="M20 13v2a3 3 0 0 1-3 3H4" />
  </svg>
);

export const Gauge = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M12 14a2 2 0 1 0-2-2" />
    <path d="M5.5 18a8 8 0 1 1 13 0" />
  </svg>
);

export const Book = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M5 4a2 2 0 0 1 2-2h11v18H7a2 2 0 0 0-2 2V4Z" />
    <path d="M5 18.5A2 2 0 0 1 7 20h11" />
  </svg>
);

export const External = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
  </svg>
);
