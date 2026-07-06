"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Spark, Check, ArrowRight, Prev } from "@/components/Icons";
import { useUILang } from "@/lib/prefs";

// Вход по волшебной ссылке: никаких паролей. Email → письмо → одна кнопка.
// Для РФ это разрешённый способ входа (собственная email-авторизация, 199-ФЗ).

const UI = {
  ru: {
    title: "Вход без пароля",
    note: "Укажи почту — пришлём волшебную ссылку. Никаких паролей: нажала в письме — вошла.",
    placeholder: "твоя@почта.ру",
    send: "Прислать ссылку",
    sending: "Отправляю…",
    sentTitle: "Письмо улетело",
    sentNote: (email: string) =>
      `Проверь ${email} — там кнопка «Войти». Ссылка живёт 15 минут.`,
    devNote:
      "Почтовый сервис ещё не подключён (dev-режим), поэтому вот твоя ссылка прямо здесь:",
    devEnter: "Войти по ссылке",
    expired: "Ссылка устарела или уже использована. Запроси новую.",
    badEmail: "Похоже, в адресе опечатка.",
    back: "На главную",
    why: "Прогресс привяжется к почте: сможешь продолжать с телефона и компьютера.",
  },
  en: {
    title: "Passwordless sign-in",
    note: "Enter your email — we'll send a magic link. No passwords: tap the button in the email and you're in.",
    placeholder: "you@mail.com",
    send: "Send the link",
    sending: "Sending…",
    sentTitle: "Email sent",
    sentNote: (email: string) => `Check ${email} — the “Sign in” button is inside. The link lives 15 minutes.`,
    devNote: "Mail service is not connected yet (dev mode), so here is your link right here:",
    devEnter: "Sign in via link",
    expired: "The link expired or was already used. Request a new one.",
    badEmail: "Looks like a typo in the address.",
    back: "Home",
    why: "Progress binds to your email: continue from phone and computer.",
  },
} as const;

function LoginInner() {
  const ui = useUILang();
  const t = UI[ui];
  const params = useSearchParams();
  const expired = params.get("error") === "expired";

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; devLink?: string };
      if (!res.ok || !json.ok) {
        setError(t.badEmail);
      } else {
        setSent(true);
        setDevLink(json.devLink ?? null);
      }
    } catch {
      setError(t.badEmail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pt-7 pb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-muted"
        >
          <Prev className="h-4 w-4" /> {t.back}
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center">
          {!sent ? (
            <div className="w-full">
              <div className="mb-5 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Spark className="h-7 w-7" />
                </span>
                <h1
                  data-testid="login-title"
                  className="mt-4 font-heading text-2xl font-extrabold text-ink"
                >
                  {t.title}
                </h1>
                <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-muted">
                  {t.note}
                </p>
              </div>

              {expired && (
                <p className="mb-3 rounded-soft bg-warn-soft px-3 py-2.5 text-xs text-warn">
                  {t.expired}
                </p>
              )}

              <form onSubmit={submit} className="space-y-2.5">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  data-testid="login-email"
                  className="w-full rounded-2xl border border-line bg-surface px-4 py-4 text-base text-ink outline-none focus:border-brand"
                />
                {error && <p className="text-xs font-semibold text-warn">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  data-testid="login-submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] disabled:opacity-60"
                >
                  {busy ? t.sending : t.send}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
              <p className="mt-4 text-center text-xs leading-relaxed text-muted">{t.why}</p>
            </div>
          ) : (
            <div className="w-full text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok/15 text-ok">
                <Check className="h-7 w-7" />
              </span>
              <h1 className="mt-4 font-heading text-2xl font-extrabold text-ink">
                {t.sentTitle}
              </h1>
              <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-muted">
                {t.sentNote(email)}
              </p>
              {devLink && (
                <div className="mt-5 rounded-card border border-line bg-surface p-4 text-left">
                  <p className="text-xs leading-relaxed text-muted">{t.devNote}</p>
                  <a
                    href={devLink}
                    data-testid="login-devlink"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3.5 font-heading text-sm font-extrabold text-white"
                  >
                    {t.devEnter}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
