"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Check, Spark, Prev } from "@/components/Icons";
import { useUILang } from "@ie/core/prefs";

// Тарифы по 06_monetization: Free даёт почувствовать метод целиком; платим за
// полноту интенсива и персонализацию. Цены — стартовые гипотезы из документа.
// Оплата включается ключами Stripe (см. docs/PAYMENTS.md); до этого — бета.

const UI = {
  ru: {
    title: "Тарифы",
    back: "Назад",
    beta: "Сейчас идёт бета — всё открыто бесплатно. Оплата появится позже; цены ниже — то, к чему готовимся.",
    free: "Free",
    freePrice: "0 ₽",
    freeList: [
      "полный демо-цикл метода: пачка целиком",
      "постановка звука и правила чтения",
      "набор, времена, вечерний круг",
      "план дня и горизонт прогресса",
    ],
    core: "Интенсив",
    corePeriodM: "690 ₽ / мес",
    corePeriodY: "3 990 ₽ / год",
    coreBadge: "год выгоднее · ≈4 месяца бесплатно",
    coreList: [
      "все массивы без ограничений (мега-поток)",
      "облачный прогресс на всех устройствах",
      "полная библиотека и все паки тем",
      "приоритетные новые модули",
    ],
    coreCtaM: "Оформить месяц",
    coreCtaY: "Оформить год",
    pro: "Интенсив PRO + гарантия",
    proPrice: "от 19 900 ₽ за программу",
    proList: [
      "персональная программа до 6 месяцев",
      "гарантия результата по данным приложения",
      "сопровождение и разборы",
    ],
    proCta: "Оставить заявку",
    notConfigured: "Оплата ещё не подключена — бета бесплатна. Мы напишем, когда включим.",
    needLogin: "Сначала войди по волшебной ссылке — тариф привяжется к почте.",
    login: "Войти",
  },
  en: {
    title: "Pricing",
    back: "Back",
    beta: "Beta is on — everything is free for now. Payments come later; prices below are what we're preparing.",
    free: "Free",
    freePrice: "$0",
    freeList: [
      "full method demo cycle: a whole pack",
      "sound production and reading rules",
      "typing, tenses, evening circle",
      "day plan and progress horizon",
    ],
    core: "Intensive",
    corePeriodM: "$12 / mo",
    corePeriodY: "$89 / yr",
    coreBadge: "yearly wins · ≈4 months free",
    coreList: [
      "all word flows unlimited (mega-flow)",
      "cloud progress on all devices",
      "full library and all topic packs",
      "priority access to new modules",
    ],
    coreCtaM: "Subscribe monthly",
    coreCtaY: "Subscribe yearly",
    pro: "Intensive PRO + guarantee",
    proPrice: "from $290 per program",
    proList: [
      "personal program up to 6 months",
      "result guarantee backed by app data",
      "guidance and reviews",
    ],
    proCta: "Request",
    notConfigured: "Payments are not connected yet — the beta is free. We'll email you when they're on.",
    needLogin: "Sign in with a magic link first — the plan binds to your email.",
    login: "Sign in",
  },
} as const;

export default function Pricing() {
  const ui = useUILang();
  const t = UI[ui];
  const [msg, setMsg] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  async function checkout(period: "month" | "year") {
    setMsg(null);
    setNeedLogin(false);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      if (res.status === 401) {
        setNeedLogin(true);
        return;
      }
      const json = (await res.json()) as { url?: string };
      if (res.ok && json.url) {
        window.location.href = json.url;
      } else {
        setMsg(t.notConfigured);
      }
    } catch {
      setMsg(t.notConfigured);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        <Link
          href="/profile"
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted"
        >
          <Prev className="h-4 w-4" /> {t.back}
        </Link>
        <h1 data-testid="pricing-title" className="font-heading text-2xl font-extrabold text-ink">
          {t.title}
        </h1>
        <p className="mt-2 rounded-soft bg-brand-soft px-3 py-2.5 text-xs leading-relaxed text-brand-ink">
          {t.beta}
        </p>

        {msg && (
          <p data-testid="pricing-msg" className="mt-3 rounded-soft bg-warn-soft px-3 py-2.5 text-xs text-warn">
            {msg}
          </p>
        )}
        {needLogin && (
          <p className="mt-3 rounded-soft bg-warn-soft px-3 py-2.5 text-xs text-warn">
            {t.needLogin}{" "}
            <Link href="/login" className="font-bold underline">
              {t.login}
            </Link>
          </p>
        )}

        {/* Free */}
        <section className="mt-5 rounded-card border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold text-ink">{t.free}</h2>
            <span className="tnum font-heading text-lg font-extrabold text-ink">
              {t.freePrice}
            </span>
          </div>
          <PlanList items={t.freeList} />
        </section>

        {/* Интенсив — рекомендованный */}
        <section className="relative mt-4 overflow-hidden rounded-card border-2 border-brand bg-surface p-4">
          <div className="stripe-breton-red absolute inset-x-0 top-0 h-1.5" />
          <div className="mt-1 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold text-ink">{t.core}</h2>
            <span className="text-right">
              <span className="tnum block font-heading text-lg font-extrabold text-ink">
                {t.corePeriodY}
              </span>
              <span className="tnum block text-xs text-muted">{t.corePeriodM}</span>
            </span>
          </div>
          <p className="mt-1 inline-block rounded-full bg-sun px-2.5 py-0.5 text-[11px] font-bold text-[#3b2c07]">
            {t.coreBadge}
          </p>
          <PlanList items={t.coreList} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => checkout("year")}
              data-testid="checkout-year"
              className="rounded-2xl bg-accent px-4 py-3.5 font-heading text-sm font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
            >
              {t.coreCtaY}
            </button>
            <button
              onClick={() => checkout("month")}
              className="rounded-2xl border border-line bg-surface px-4 py-3.5 font-heading text-sm font-bold text-ink"
            >
              {t.coreCtaM}
            </button>
          </div>
        </section>

        {/* PRO */}
        <section className="mt-4 rounded-card border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-lg font-bold text-ink">{t.pro}</h2>
            <span className="tnum text-right font-heading text-sm font-extrabold text-ink">
              {t.proPrice}
            </span>
          </div>
          <PlanList items={t.proList} />
          <a
            href="mailto:galya.chooru@gmail.com?subject=Intensive%20English%20PRO"
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-brand px-4 py-3.5 font-heading text-sm font-bold text-white"
          >
            {t.proCta}
          </a>
        </section>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
          <Spark className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
          {ui === "ru"
            ? "Метод не гейтится по числу слов в день — это против сверхнасыщенного ввода. Платим за полноту, персонализацию и облако."
            : "The method is never gated by words per day — that would kill massive input. You pay for depth, personalization and cloud."}
        </p>
      </main>
      <BottomNav />
    </div>
  );
}

function PlanList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-ink">
          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-ok" />
          {x}
        </li>
      ))}
    </ul>
  );
}
