"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import OnboardingGate from "@/components/OnboardingGate";
import { useUILang, usePrefs } from "@ie/core/prefs";
import { STORIES, storiesByLevel, wordCount, type Story } from "@ie/core/data/reading";
import { booksForReader, type GutenbergBook } from "@ie/core/data/gutenberg";
import { SHADOWING, CATEGORY_LABEL, type ShadowScript } from "@ie/core/data/shadowing";
import { addMyBook, addMyVideo, parseGutenbergId, parseYoutubeId } from "@ie/core/mylibrary";

// «Библиотека» на web — 1:1 по макету «Веб-приложение · БИБЛИОТЕКА»: шапка с
// импортом своей ссылки, фильтр-чипы, СЕТКА карточек материалов с обложками
// по типу (видео · подкаст/звук · текст). Каждая карточка ведёт в свой навык.
// Цвета — через токены: сетка одинаково живёт в светлой и тёмной теме.

type Kind = "all" | "video" | "text" | "book";

const UI = {
  ru: {
    kicker: (n: number) => `Библиотека · ${n} материалов B1–C1`,
    title: "Контент, который тебе по силам",
    importTitle: "Вставь свою ссылку",
    importNote: "YouTube или статью — соберём сессию",
    importAdd: "Добавить",
    importPh: "https://youtu.be/… или ссылка на книгу",
    importErr: "Не распознала ссылку. Нужен YouTube или Project Gutenberg.",
    importOkVideo: "Видео добавлено — открываю shadowing",
    importOkBook: "Книга добавлена — открываю читалку",
    chips: { all: "Всё", video: "Видео", text: "Тексты", book: "Книги" } as Record<Kind, string>,
    minRead: (m: number) => `${m} мин чтения`,
    words: (n: number) => `${n} слов · перевод по тапу`,
    videoMeta: (c: string) => `видео · shadowing · ${c}`,
    bookMeta: "книга · читать главами",
    ownTitle: "Своё видео",
    ownNote: "из ссылки за минуту",
    metaText: "текст",
  },
  en: {
    kicker: (n: number) => `Library · ${n} materials B1–C1`,
    title: "Content that is within your reach",
    importTitle: "Paste your link",
    importNote: "YouTube or an article — we'll build a session",
    importAdd: "Add",
    importPh: "https://youtu.be/… or a book link",
    importErr: "Couldn't recognise the link. YouTube or Project Gutenberg needed.",
    importOkVideo: "Video added — opening shadowing",
    importOkBook: "Book added — opening the reader",
    chips: { all: "All", video: "Video", text: "Texts", book: "Books" } as Record<Kind, string>,
    minRead: (m: number) => `${m} min read`,
    words: (n: number) => `${n} words · tap to translate`,
    videoMeta: (c: string) => `video · shadowing · ${c}`,
    bookMeta: "book · read by chapters",
    ownTitle: "Your video",
    ownNote: "from a link in a minute",
    metaText: "text",
  },
} as const;

export default function LibraryPage() {
  const router = useRouter();
  const ui = useUILang();
  const t = UI[ui];
  const prefs = usePrefs();

  const [kind, setKind] = useState<Kind>("all");
  const [importOpen, setImportOpen] = useState(false);
  const [link, setLink] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // Показываем ВЕСЬ каталог, отсортированный под уровень ученицы (не обрезаем):
  // «сколько здесь моего» видно, библиотека выглядит настоящей.
  const stories = useMemo(() => {
    const byLevel = storiesByLevel(prefs?.level ?? "b1");
    const seen = new Set(byLevel.map((s) => s.id));
    return [...byLevel, ...STORIES.filter((s) => !seen.has(s.id))];
  }, [prefs?.level]);
  const books = useMemo(
    () => booksForReader(prefs?.topics ?? [], prefs?.level),
    [prefs?.topics, prefs?.level]
  );
  const videos = SHADOWING;
  const total = videos.length + stories.length + books.length;

  function addLink() {
    const v = link.trim();
    const yt = parseYoutubeId(v);
    if (yt) {
      addMyVideo(yt, "My video");
      setMsg(t.importOkVideo);
      setTimeout(() => router.push("/video"), 700);
      return;
    }
    const gb = parseGutenbergId(v);
    if (gb) {
      addMyBook(gb, "My book");
      setMsg(t.importOkBook);
      setTimeout(() => router.push("/reading"), 700);
      return;
    }
    setMsg(t.importErr);
  }

  const showVideo = kind === "all" || kind === "video";
  const showText = kind === "all" || kind === "text";
  const showBook = kind === "all" || kind === "book";

  return (
    <OnboardingGate>
      <AppShell>
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 pb-10 pt-7 lg:px-10">
          {/* Шапка: заголовок + импорт своей ссылки справа */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-heading text-[13px] font-semibold text-muted/80">{t.kicker(total)}</p>
              <h1
                data-testid="library-title"
                className="mt-1 font-heading text-[26px] font-extrabold tracking-[-0.025em] text-ink lg:text-[30px]"
              >
                {t.title}
              </h1>
            </div>

            <div className="rounded-[14px] border-2 border-dashed border-line bg-surface p-2.5 shadow-card">
              {!importOpen ? (
                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center gap-3 pl-2"
                >
                  <span className="text-left">
                    <span className="block font-heading text-xs font-semibold text-ink">{t.importTitle}</span>
                    <span className="block text-[10.5px] text-muted">{t.importNote}</span>
                  </span>
                  <span className="rounded-[10px] bg-brand px-4 py-2.5 font-heading text-[12.5px] font-bold text-white">
                    {t.importAdd}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      setMsg(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && addLink()}
                    placeholder={t.importPh}
                    className="w-[240px] rounded-[10px] bg-bg px-3 py-2.5 font-body text-[13px] text-ink outline-none"
                  />
                  <button
                    onClick={addLink}
                    className="rounded-[10px] bg-brand px-4 py-2.5 font-heading text-[12.5px] font-bold text-white"
                  >
                    {t.importAdd}
                  </button>
                </div>
              )}
              {msg && <p className="mt-1.5 px-1 text-[11px] font-medium text-brand-d">{msg}</p>}
            </div>
          </div>

          {/* Фильтр-чипы */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(t.chips) as Kind[]).map((k) => {
              const on = kind === k;
              return (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-full px-4 py-2 font-heading text-[12.5px] transition-colors ${
                    on
                      ? "bg-ink font-semibold text-bg"
                      : "bg-surface font-medium text-muted shadow-card hover:text-ink"
                  }`}
                >
                  {t.chips[k]}
                </button>
              );
            })}
          </div>

          {/* Сетка карточек */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {showVideo &&
              videos.map((v) => (
                <VideoCard key={v.id} script={v} meta={t.videoMeta(CATEGORY_LABEL[v.category])} onOpen={() => router.push("/video")} />
              ))}
            {showText &&
              stories.map((s) => {
                const w = wordCount(s);
                return (
                  <TextCard
                    key={s.id}
                    title={s.title}
                    level={s.level}
                    tag={t.metaText}
                    meta={t.words(w)}
                    onOpen={() => router.push("/reading")}
                  />
                );
              })}
            {showBook &&
              books.map((b) => (
                <TextCard
                  key={b.bookId}
                  title={b.title}
                  level={b.level}
                  tag="book"
                  meta={t.bookMeta}
                  sub={b.author}
                  onOpen={() => router.push("/reading")}
                />
              ))}

            {/* Импорт-плитка в конце сетки */}
            <button
              onClick={() => setImportOpen(true)}
              className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-bg transition-colors hover:border-brand/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft font-heading text-[22px] font-bold text-brand-ink">
                +
              </span>
              <span className="font-heading text-[13px] font-semibold text-ink">{t.ownTitle}</span>
              <span className="text-[11px] text-muted">{t.ownNote}</span>
            </button>
          </div>
        </main>
      </AppShell>
    </OnboardingGate>
  );
}

/* ---------- Карточка видео (обложка-градиент петроль + play) ---------- */
function VideoCard({ script, meta, onOpen }: { script: ShadowScript; meta: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="overflow-hidden rounded-2xl bg-surface text-left shadow-card transition-transform active:scale-[0.99]"
    >
      <div
        className="relative flex h-28 items-center justify-center"
        style={{ background: "linear-gradient(150deg,#3a4d63,#22323f)" }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
          <span
            className="ml-1"
            style={{ width: 0, height: 0, borderLeft: "12px solid #22323f", borderTop: "8px solid transparent", borderBottom: "8px solid transparent" }}
          />
        </span>
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/50 px-2 py-1 font-heading text-[10px] font-semibold text-white">
          {script.lines.length} фраз
        </span>
      </div>
      <div className="p-4">
        <p className="font-heading text-sm font-semibold leading-snug text-ink">{script.title}</p>
        <p className="mt-1 text-[11.5px] text-muted">{meta}</p>
      </div>
    </button>
  );
}

/* ---------- Карточка текста/книги (обложка «Aa» на полосатом фоне) ---------- */
function TextCard({
  title,
  level,
  tag,
  meta,
  sub,
  onOpen,
}: {
  title: string;
  level: string;
  tag: string;
  meta: string;
  sub?: string;
  onOpen: () => void;
}) {
  const isBook = tag === "book";
  return (
    <button
      onClick={onOpen}
      className="overflow-hidden rounded-2xl bg-surface text-left shadow-card transition-transform active:scale-[0.99]"
    >
      <div
        className="relative flex h-28 items-center justify-center"
        style={{
          background: isBook
            ? "linear-gradient(150deg,#4a6a52,#2f4a38)"
            : "repeating-linear-gradient(135deg,#eadfca,#eadfca 10px,#e2d5bb 10px,#e2d5bb 20px)",
        }}
      >
        <span
          className="font-english text-[22px]"
          style={{ color: isBook ? "rgba(255,255,255,.92)" : "#8a7d60" }}
        >
          Aa
        </span>
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/40 px-2 py-1 font-heading text-[10px] font-semibold text-white">
          {level.toUpperCase()}
        </span>
      </div>
      <div className="p-4">
        <p className="font-heading text-sm font-semibold leading-snug text-ink">{title}</p>
        <p className="mt-1 text-[11.5px] text-muted">{sub ?? meta}</p>
      </div>
    </button>
  );
}
