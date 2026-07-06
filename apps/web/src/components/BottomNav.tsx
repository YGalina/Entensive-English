"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Text, Play, Smile, Sound, Chat, Keyboard } from "./Icons";
import { useUILang } from "@/lib/prefs";

// tone — сигнальный цвет навыка («Марина»): активный таб красится в свой флаг.
const items = [
  { href: "/", ru: "Сегодня", en: "Today", Icon: Home, tone: "--brand" },
  { href: "/vocab", ru: "Словарь", en: "Words", Icon: Layers, tone: "--sk-words" },
  { href: "/pronunciation", ru: "Звуки", en: "Sounds", Icon: Sound, tone: "--sk-sounds" },
  { href: "/typing", ru: "Набор", en: "Typing", Icon: Keyboard, tone: "--sk-typing" },
  { href: "/grammar", ru: "Времена", en: "Tenses", Icon: Chat, tone: "--sk-grammar" },
  { href: "/reading", ru: "Чтение", en: "Reading", Icon: Text, tone: "--sk-reading" },
  { href: "/video", ru: "Видео", en: "Video", Icon: Play, tone: "--sk-video" },
  { href: "/profile", ru: "Профиль", en: "Profile", Icon: Smile, tone: "--brand" },
];

export default function BottomNav() {
  const path = usePathname();
  const ui = useUILang();
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-surface/90 backdrop-blur">
      <ul className="mx-auto flex max-w-[480px] items-stretch justify-between px-2">
        {items.map(({ href, ru, en, Icon, tone }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          const label = ui === "en" ? en : ru;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-soft py-2 text-[11px] font-semibold transition-colors ${
                  active ? "" : "text-muted hover:text-ink"
                }`}
                style={active ? { color: `var(${tone})` } : undefined}
              >
                <Icon className="h-[22px] w-[22px]" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
