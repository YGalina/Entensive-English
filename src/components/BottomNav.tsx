"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Text, Play, Smile, Sound, Chat, Keyboard } from "./Icons";
import { useUILang } from "@/lib/prefs";

const items = [
  { href: "/", ru: "Сегодня", en: "Today", Icon: Home },
  { href: "/vocab", ru: "Словарь", en: "Words", Icon: Layers },
  { href: "/pronunciation", ru: "Звуки", en: "Sounds", Icon: Sound },
  { href: "/typing", ru: "Набор", en: "Typing", Icon: Keyboard },
  { href: "/grammar", ru: "Времена", en: "Tenses", Icon: Chat },
  { href: "/reading", ru: "Чтение", en: "Reading", Icon: Text },
  { href: "/video", ru: "Видео", en: "Video", Icon: Play },
  { href: "/profile", ru: "Профиль", en: "Profile", Icon: Smile },
];

export default function BottomNav() {
  const path = usePathname();
  const ui = useUILang();
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-surface/90 backdrop-blur">
      <ul className="mx-auto flex max-w-[480px] items-stretch justify-between px-2">
        {items.map(({ href, ru, en, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          const label = ui === "en" ? en : ru;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-soft py-2 text-[11px] font-semibold transition-colors ${
                  active ? "text-brand" : "text-muted hover:text-ink"
                }`}
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
