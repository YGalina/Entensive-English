"use client";

// Каркас приложения по макету «Веб-приложение · Рабочий стол»: на десктопе —
// сайдбар навигации слева (230px, белый, тонкая линия), на узких экранах —
// нижняя навигация. Один источник пунктов с BottomNav (5 разделов).

import Link from "next/link";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { Home, Library, Layers, People, Smile } from "./Icons";
import { usePrefs, useUILang } from "@ie/core/prefs";

const items = [
  { href: "/", ru: "Сегодня", en: "Today", Icon: Home },
  { href: "/library", ru: "Библиотека", en: "Library", Icon: Library },
  { href: "/vocab", ru: "Мой словарь", en: "My vocabulary", Icon: Layers },
  { href: "/people", ru: "Сообщество", en: "Community", Icon: People },
  { href: "/profile", ru: "Профиль", en: "Profile", Icon: Smile },
];

function SideNav() {
  const path = usePathname();
  const ui = useUILang();
  const prefs = usePrefs();

  return (
    <nav className="sticky top-0 hidden h-dvh w-[230px] flex-none flex-col gap-1.5 border-r border-line bg-surface px-5 py-6 lg:flex">
      {/* Лого-lockup: амбер-плитка «ie» + имя (айдентика §10) */}
      <Link href="/" className="flex items-center gap-2.5 px-2 pb-5">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-amber font-english text-[15px] font-semibold italic text-[#22201B]">
          ie
        </span>
        <span className="font-heading text-[15px] font-bold tracking-tight text-ink">
          Intensive English
        </span>
      </Link>

      {items.map(({ href, ru, en, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 font-heading text-sm transition-colors ${
              active
                ? "bg-brand-soft/70 font-semibold text-brand-d"
                : "font-medium text-muted hover:bg-bg hover:text-ink"
            }`}
          >
            <Icon className="h-5 w-5" />
            {ui === "en" ? en : ru}
          </Link>
        );
      })}

      <div className="flex-1" />

      {/* Профиль внизу сайдбара — как в макете */}
      <Link href="/profile" className="flex items-center gap-2.5 border-t border-line px-2.5 pt-3.5">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-soft font-heading text-[13px] font-bold text-brand-ink">
          Г
        </span>
        <span>
          <span className="block font-heading text-[13px] font-semibold text-ink">Галина</span>
          <span className="block text-[11px] text-muted">
            {(prefs?.level ?? "b1").toUpperCase()}
          </span>
        </span>
      </Link>
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
