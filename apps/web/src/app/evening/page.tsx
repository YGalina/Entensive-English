"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDayPlan } from "@ie/core/dayplan";
import { addArtifact, listArtifacts } from "@ie/core/output";
import { todaysTouchedCards } from "@ie/core/srs";
import { storage } from "@ie/core/storage";
import { useUILang } from "@ie/core/prefs";

// «Вечерний круг» на web — 1:1 по макету «Focus-режим · Вечерний круг»:
// единственный тёмный экран «свет лампы» (#211D16, латунь, тишина), две
// колонки — слева состояние и страж, справа одна фраза о дне по-английски
// с чипами из сегодняшних слов. Палитра фиксированная, от темы не зависит.

const N = {
  bg: "#211D16",
  surface: "#2E2A22",
  chip: "#3a352b",
  chipInk: "#e8e1cf",
  line: "#3a352b",
  ink: "#F5EFE2",
  muted: "#9C937D",
  soft: "#c9c0ab",
  faint: "#7c745f",
  brass: "#E8B36A",
  brassInk: "#2a2214",
};

type Mood = "calm" | "proud" | "tired" | "blocked";
type GuardianId = "devalue" | "fear" | "mock" | "perfect";

const GUARDIANS: { id: GuardianId; from: string; to: string; eye: string }[] = [
  { id: "devalue", from: "#93A7C9", to: "#7C93B8", eye: "#26303f" },
  { id: "fear", from: "#F2B45E", to: "#E8934D", eye: "#3a2c14" },
  { id: "mock", from: "#EC93B4", to: "#E07AA0", eye: "#4a2233" },
  { id: "perfect", from: "#AE9BE2", to: "#9B84D9", eye: "#33265a" },
];

const UI = {
  ru: {
    kicker: (time: string) => `Вечерний круг · ${time}`,
    exit: "Выйти из фокуса",
    title: "Тихо закроем\nсегодняшний день",
    facts: (min: number, words: number, spoke: boolean) =>
      [
        `${min} ${min % 10 === 1 && min % 100 !== 11 ? "минута" : min % 10 >= 2 && min % 10 <= 4 && (min % 100 < 10 || min % 100 >= 20) ? "минуты" : "минут"} практики`,
        `${words} ${words % 10 === 1 && words % 100 !== 11 ? "слово" : words % 10 >= 2 && words % 10 <= 4 && (words % 100 < 10 || words % 100 >= 20) ? "слова" : "слов"} в работе`,
        ...(spoke ? ["голос звучал — вслух"] : []),
      ].join(" · ") + ".",
    howLabel: "Как ты сейчас",
    moods: { calm: "Спокойна", proud: "Собой довольна", tired: "Устала", blocked: "Тяжело было" } as Record<Mood, string>,
    guardianNames: {
      devalue: "обесценивание",
      fear: "запугивание",
      mock: "высмеивание",
      perfect: "перфекционизм",
    } as Record<GuardianId, string>,
    guardianAsk: "Тапни того, кто приходил сегодня. Не спорим — замечаем.",
    guardianPassed: (name: string) =>
      `Сегодня приходило ${name} — и ты всё равно здесь, закрываешь день. Это считается.`,
    statusLabel: "Одна фраза о дне · по-английски",
    placeholder: "Today was long, but…",
    chipsNote: "Подсказки — из сегодняшних слов. Запись видна только тебе.",
    close: "Закрыть день",
    skipClose: "Закрыть день без записи",
    entryN: (n: number) => `${n}-я запись · все — только твои`,
    doneTitle: "День закрыт",
    doneNote: "Завтра продолжим с твоего места. Пауза — часть пути.",
    yourStatus: "Твоя запись",
    toToday: "На сегодня",
  },
  en: {
    kicker: (time: string) => `Evening circle · ${time}`,
    exit: "Leave focus",
    title: "Let's quietly close\nthis day",
    facts: (min: number, words: number, spoke: boolean) =>
      [
        `${min} minute${min === 1 ? "" : "s"} of practice`,
        `${words} word${words === 1 ? "" : "s"} in progress`,
        ...(spoke ? ["your voice was heard — out loud"] : []),
      ].join(" · ") + ".",
    howLabel: "How you are",
    moods: { calm: "Calm", proud: "Proud of myself", tired: "Tired", blocked: "It was hard" } as Record<Mood, string>,
    guardianNames: {
      devalue: "devaluation",
      fear: "intimidation",
      mock: "ridicule",
      perfect: "perfectionism",
    } as Record<GuardianId, string>,
    guardianAsk: "Tap the one who came today. We don't argue — we notice.",
    guardianPassed: (name: string) =>
      `${name[0].toUpperCase()}${name.slice(1)} came today — and you are still here, closing the day. It counts.`,
    statusLabel: "One phrase about the day · in English",
    placeholder: "Today was long, but…",
    chipsNote: "Hints come from today's words. Visible only to you.",
    close: "Close the day",
    skipClose: "Close the day without a record",
    entryN: (n: number) => `entry #${n} · all of them are yours only`,
    doneTitle: "The day is closed",
    doneNote: "Tomorrow we continue from your place. A pause is part of the path.",
    yourStatus: "Your record",
    toToday: "To Today",
  },
} as const;

export default function EveningPage() {
  const router = useRouter();
  const ui = useUILang();
  const t = UI[ui];
  const plan = useDayPlan();

  const [mood, setMood] = useState<Mood | null>(null);
  const [guardian, setGuardian] = useState<GuardianId | null>(null);
  const [text, setText] = useState("");
  const [closed, setClosed] = useState(false);
  const [savedText, setSavedText] = useState("");

  const touched = useMemo(() => todaysTouchedCards(), []);
  const chips = useMemo(() => touched.slice(0, 3).map((card) => card.en), [touched]);
  const statusCount = useMemo(
    () => listArtifacts().filter((a) => a.type === "status").length,
    []
  );
  const spokeToday = useMemo(
    () => listArtifacts(20).some((a) => a.createdAt >= Date.now() - 18 * 36e5 && !!a.audioRef),
    []
  );

  const time = (() => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  })();

  function insertChip(w: string) {
    setText((v) => (v.trim().length ? `${v.trimEnd()} ${w}` : w));
  }

  function closeDay() {
    const trimmed = text.trim();
    if (mood) {
      // Состояние — на завтра: план сможет подстроиться («устала» → короче).
      storage().setItem(
        "ie_evening_mood",
        JSON.stringify({ day: new Date().toISOString().slice(0, 10), mood })
      );
    }
    if (trimmed) {
      addArtifact({
        type: "status",
        text: trimmed,
        words: chips.filter((w) => trimmed.toLowerCase().includes(w.toLowerCase())),
      });
      setSavedText(trimmed);
    }
    setClosed(true);
  }

  return (
    <div className="min-h-dvh" style={{ background: N.bg }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1180px] flex-col px-5 py-5 lg:px-10">
        {/* Шапка focus: лого-плитка + кикер латунью + выход */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-amber font-english text-[15px] font-semibold italic text-[#22201B]">
              ie
            </span>
            <span
              className="font-heading text-xs font-semibold uppercase tracking-[0.07em]"
              style={{ color: N.brass }}
            >
              {t.kicker(time)}
            </span>
          </div>
          <Link
            href="/"
            className="rounded-xl border px-4 py-2.5 font-heading text-[13px] font-semibold transition-opacity hover:opacity-80"
            style={{ borderColor: N.line, color: N.muted }}
          >
            {t.exit}
          </Link>
        </header>

        {!closed ? (
          <div className="mt-6 grid flex-1 gap-6 pb-10 lg:grid-cols-2">
            {/* Левая колонка: заголовок, факты, состояние, страж */}
            <div className="flex flex-col gap-6">
              <div>
                <h1
                  data-testid="evening-title"
                  className="whitespace-pre-line font-heading text-[30px] font-bold leading-[1.15] tracking-[-0.02em] lg:text-[34px]"
                  style={{ color: N.ink }}
                >
                  {t.title}
                </h1>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: N.muted }}>
                  {t.facts(plan.todayMin, touched.length, spokeToday)}
                </p>
              </div>

              {/* Как ты сейчас */}
              <div className="rounded-[20px] p-6" style={{ background: N.surface }}>
                <p
                  className="font-heading text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: N.brass }}
                >
                  {t.howLabel}
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  {(Object.keys(t.moods) as Mood[]).map((m) => {
                    const on = mood === m;
                    return (
                      <button
                        key={m}
                        data-testid={`evening-mood-${m}`}
                        onClick={() => setMood(on ? null : m)}
                        className="rounded-[20px] px-4 py-2.5 font-heading text-sm font-medium transition-transform active:scale-[0.97]"
                        style={
                          on
                            ? { background: N.brass, color: N.brassInk }
                            : { background: N.chip, color: N.chipInk }
                        }
                      >
                        {t.moods[m]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Страж — появляется, когда «Тяжело было» */}
              {mood === "blocked" && (
                <div className="flex items-center gap-4 rounded-[20px] p-6" style={{ background: N.surface }}>
                  <div className="flex gap-2.5">
                    {GUARDIANS.map((g) => {
                      const on = guardian === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setGuardian(on ? null : g.id)}
                          aria-label={t.guardianNames[g.id]}
                          className="relative flex-none transition-all"
                          style={{ width: on ? 46 : 38, height: on ? 46 : 38, opacity: on ? 1 : 0.45 }}
                        >
                          <span
                            className="absolute inset-0"
                            style={{
                              borderRadius: "44% 56% 52% 48%/54% 46% 54% 46%",
                              background: `linear-gradient(145deg, ${g.from}, ${g.to})`,
                            }}
                          />
                          <span className="absolute h-1 w-1 rounded-full" style={{ left: "30%", top: "42%", background: g.eye }} />
                          <span className="absolute h-1 w-1 rounded-full" style={{ right: "30%", top: "42%", background: g.eye }} />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: N.soft }}>
                    {guardian ? t.guardianPassed(t.guardianNames[guardian]) : t.guardianAsk}
                  </p>
                </div>
              )}
            </div>

            {/* Правая колонка: одна фраза о дне */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-1 flex-col rounded-[20px] p-6" style={{ background: N.surface }}>
                <p
                  className="font-heading text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: N.brass }}
                >
                  {t.statusLabel}
                </p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.placeholder}
                  data-testid="evening-status-text"
                  rows={5}
                  className="mt-3.5 w-full flex-1 resize-none bg-transparent font-english text-[21px] leading-relaxed outline-none placeholder:opacity-40"
                  style={{ color: N.ink }}
                />
                {chips.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chips.map((w) => (
                      <button
                        key={w}
                        onClick={() => insertChip(w)}
                        className="rounded-[18px] px-3.5 py-2 font-english text-sm font-medium transition-transform active:scale-[0.96]"
                        style={{ background: N.chip, color: N.chipInk }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs" style={{ color: N.faint }}>
                  {t.chipsNote}
                </p>
              </div>

              <button
                onClick={closeDay}
                data-testid="evening-close"
                className="rounded-[18px] px-5 py-[18px] text-center font-heading text-base font-bold transition-transform active:scale-[0.98]"
                style={{
                  background: N.brass,
                  color: N.brassInk,
                  boxShadow: "0 14px 30px -12px rgba(232,179,106,.35)",
                }}
              >
                {text.trim() ? t.close : t.skipClose}
              </button>
              {(text.trim().length > 0 || statusCount > 0) && (
                <p className="text-center text-[13px]" style={{ color: N.faint }}>
                  {t.entryN(statusCount + (text.trim() ? 1 : 0))}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* День закрыт: тёплый свет лампы + твоя запись */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-16 text-center">
            <div
              className="h-20 w-20 rounded-full"
              style={{ background: N.brass, boxShadow: `0 0 60px 18px rgba(232,179,106,.35)` }}
            />
            <h1 data-testid="evening-done" className="font-heading text-[28px] font-bold" style={{ color: N.ink }}>
              {t.doneTitle}
            </h1>
            {savedText && (
              <div className="w-full max-w-[520px] rounded-[20px] p-6 text-left" style={{ background: N.surface }}>
                <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: N.brass }}>
                  {t.yourStatus}
                </p>
                <p className="mt-3 font-english text-lg italic leading-relaxed" style={{ color: N.ink }}>
                  “{savedText}”
                </p>
                <p className="mt-3 text-xs" style={{ color: N.faint }}>
                  {t.entryN(statusCount + 1)}
                </p>
              </div>
            )}
            <p className="text-sm" style={{ color: N.muted }}>
              {t.doneNote}
            </p>
            <button
              onClick={() => router.push("/")}
              className="rounded-[16px] border px-8 py-3.5 font-heading text-sm font-bold"
              style={{ borderColor: N.line, color: N.ink }}
            >
              {t.toToday}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
