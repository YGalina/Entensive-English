"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Text, Play, Smile, Sound } from "./Icons";

const items = [
  { href: "/", label: "Сегодня", Icon: Home },
  { href: "/vocab", label: "Словарь", Icon: Layers },
  { href: "/pronunciation", label: "Звуки", Icon: Sound },
  { href: "/reading", label: "Чтение", Icon: Text },
  { href: "/video", label: "Видео", Icon: Play },
  { href: "/profile", label: "Профиль", Icon: Smile },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-surface/90 backdrop-blur">
      <ul className="mx-auto flex max-w-[480px] items-stretch justify-between px-2">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
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
