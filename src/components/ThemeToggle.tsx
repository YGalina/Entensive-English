"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "./Icons";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export default function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribe,
    isDark,
    () => false // на сервере тема ещё неизвестна
  );

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Светлая тема" : "Тёмная тема"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:text-ink"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
