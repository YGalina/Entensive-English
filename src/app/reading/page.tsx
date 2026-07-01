"use client";

import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Text, Play, Check, External, Book, Prev } from "@/components/Icons";
import {
  gutenbergChunkToStory,
  type GutenbergChunk,
  type GutenbergResponse,
} from "@/data/gutenberg";
import { storiesByLevel, wordCount, type Story } from "@/data/reading";
import { LIBRARY, type Book as BookType } from "@/data/library";
import { usePrefs } from "@/lib/prefs";
import { useActivityTimer } from "@/lib/timelog";

const LEVELS = ["a1", "a2", "b1", "b2", "c1"] as const;
const GENRE: Record<string, string> = {
  fable: "басня",
  fantasy: "фэнтези",
  humor: "юмор",
  classic: "классика",
  growth: "саморазвитие",
};

export default function Reading() {
  const prefs = usePrefs();
  const [tab, setTab] = useState<"stories" | "books">("stories");
  const initLevel = (LEVELS as readonly string[]).includes(prefs?.level ?? "")
    ? (prefs!.level as (typeof LEVELS)[number])
    : "b1";
  const [level, setLevel] = useState<(typeof LEVELS)[number]>(initLevel);
  const [story, setStory] = useState<Story | null>(null);

  if (story) {
    return <Reader story={story} onBack={() => setStory(null)} />;
  }

  const list = storiesByLevel(level);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        <h1 data-testid="reading-title" className="font-heading text-2xl font-extrabold text-ink">Чтение</h1>
        <p className="mt-1 mb-4 text-sm text-muted">
          Короткие рассказы по уровням и полка книг. Читай массивом — замеряем скорость.
        </p>

        {/* Вкладки */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 shadow-card">
          <Seg on={tab === "stories"} onClick={() => setTab("stories")}>
            Рассказы
          </Seg>
          <Seg on={tab === "books"} onClick={() => setTab("books")}>
            Книги
          </Seg>
        </div>

        {tab === "stories" ? (
          <>
            {/* Уровни */}
            <div className="mb-4 flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-bold uppercase transition-colors ${
                    level === l
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-surface text-ink"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {list.length === 0 ? (
              <Empty note="Для этого уровня рассказы скоро добавим (наполняем библиотеку public-domain текстов)." />
            ) : (
              <ul className="space-y-2.5">
                {list.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setStory(s)}
                      className="flex w-full items-center gap-3 rounded-soft border border-line bg-surface p-3.5 text-left transition-colors hover:border-brand/40"
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <Text className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-heading text-sm font-bold text-ink">
                          {s.title}
                        </span>
                        <span className="block text-xs text-muted">
                          {s.author} · {wordCount(s)} слов · {GENRE[s.genre]}
                        </span>
                      </span>
                      <Play className="h-4 w-4 text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <BooksView onOpen={setStory} />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function BooksView({ onOpen }: { onOpen: (story: Story) => void }) {
  const [chunksByBook, setChunksByBook] = useState<Record<string, GutenbergChunk[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pd = LIBRARY.filter((b) => b.kind === "pd");
  const prot = LIBRARY.filter((b) => b.kind === "protected");

  async function loadBook(book: BookType) {
    if (book.kind !== "pd") return;
    setLoadingId(book.id);
    setError(null);

    try {
      const res = await fetch(`/api/gutenberg/${book.id}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as GutenbergResponse;
      setChunksByBook((prev) => ({ ...prev, [book.id]: data.chunks }));
    } catch {
      setError("Не удалось загрузить текст Gutenberg. Проверь интернет и попробуй ещё раз.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-soft border border-warn/25 bg-warn-soft px-3.5 py-3 text-sm text-warn">
          {error}
        </p>
      )}
      <Group
        title="Можно читать"
        note="Public domain — загружаем и режем на фрагменты для скорочтения."
        books={pd}
        chunksByBook={chunksByBook}
        loadingId={loadingId}
        onLoad={loadBook}
        onOpen={(chunk) => onOpen(gutenbergChunkToStory(chunk))}
      />
      <Group
        title="Под защитой авторских прав"
        note="Не зашиваем текст. Ссылка на источник; позже — загрузка своей копии."
        books={prot}
        chunksByBook={{}}
        loadingId={loadingId}
        onLoad={loadBook}
        onOpen={(chunk) => onOpen(gutenbergChunkToStory(chunk))}
      />
    </div>
  );
}

function Group({
  title,
  note,
  books,
  chunksByBook,
  loadingId,
  onLoad,
  onOpen,
}: {
  title: string;
  note: string;
  books: BookType[];
  chunksByBook: Record<string, GutenbergChunk[]>;
  loadingId: string | null;
  onLoad: (book: BookType) => void;
  onOpen: (chunk: GutenbergChunk) => void;
}) {
  return (
    <section>
      <h2 className="font-heading text-base font-bold text-ink">{title}</h2>
      <p className="mb-3 text-xs text-muted">{note}</p>
      <ul className="space-y-2.5">
        {books.map((b) => (
          <li key={b.id}>
            <div className="rounded-soft border border-line bg-surface p-3.5 transition-colors hover:border-brand/40">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Book className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-sm font-bold text-ink">{b.title}</span>
                  <span className="block text-xs text-muted">
                    {b.author} · {GENRE[b.genre]} · {b.level.toUpperCase()}
                  </span>
                </span>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Открыть источник: ${b.title}`}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-bg hover:text-brand"
                >
                  <External className="h-4 w-4" />
                </a>
              </div>

              {b.kind === "pd" ? (
                <button
                  onClick={() => onLoad(b)}
                  disabled={loadingId === b.id}
                  className="mt-3 w-full rounded-xl bg-brand px-3 py-2.5 font-heading text-sm font-extrabold text-white transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                  {loadingId === b.id
                    ? "Загружаю..."
                    : chunksByBook[b.id]?.length
                      ? "Обновить фрагменты"
                      : "Загрузить фрагменты"}
                </button>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  Текст не встраиваем: книга защищена, поэтому пока оставляем только источник.
                </p>
              )}

              {chunksByBook[b.id]?.length ? (
                <ul className="mt-3 space-y-2 border-t border-line pt-3">
                  {chunksByBook[b.id].map((chunk) => (
                    <li key={chunk.id}>
                      <button
                        onClick={() => onOpen(chunk)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2.5 text-left transition-colors hover:bg-brand-soft"
                      >
                        <span>
                          <span className="block font-heading text-sm font-bold text-ink">
                            Фрагмент {chunk.index}
                          </span>
                          <span className="block text-xs text-muted">
                            {chunk.wordCount} слов · {chunk.paras.length} абз.
                          </span>
                        </span>
                        <Play className="h-4 w-4 flex-shrink-0 text-brand" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Seg({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl py-2.5 font-heading text-sm font-bold transition-colors ${
        on ? "bg-brand text-white" : "text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ note }: { note: string }) {
  return (
    <div className="mt-2 flex flex-col items-center rounded-card border border-line bg-surface p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Text className="h-6 w-6" />
      </span>
      <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-muted">{note}</p>
    </div>
  );
}

/* ---------- Ридер одного рассказа (таймер + замер скорости) ---------- */
type Stage = "intro" | "reading" | "done";

function Reader({ story, onBack }: { story: Story; onBack: () => void }) {
  const words = wordCount(story);
  const hasTranslation = story.paras.some((p) => p.ru);
  const [stage, setStage] = useState<Stage>("intro");
  const [showTr, setShowTr] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  useActivityTimer(stage === "reading" ? "reading" : null);

  useEffect(() => {
    if (stage !== "reading") return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [stage]);

  const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60
  ).padStart(2, "0")}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pt-6 pb-6">
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-muted"
        >
          <Prev className="h-4 w-4" /> к списку
        </button>

        {stage === "intro" && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Text className="h-7 w-7" />
              </span>
              <h1 className="mt-4 font-heading text-2xl font-extrabold text-ink">{story.title}</h1>
              <p className="mt-1 text-sm text-muted">{story.author}</p>
              <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-muted">
                Читай весь текст одним массивом, не застревая на словах. Засечём время и
                покажем скорость. {hasTranslation ? "Перевод — рядом, если нужен." : "Этот текст из Gutenberg идёт без перевода."}
              </p>
              <div className="mt-4 rounded-soft bg-surface px-4 py-2 text-xs text-muted shadow-card">
                {words} слов · уровень {story.level.toUpperCase()}
              </div>
              {story.excerpt && story.fullUrl && (
                <a
                  href={story.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand"
                >
                  <External className="h-4 w-4" /> Это фрагмент — читать полностью
                </a>
              )}
            </div>
            <button
              onClick={() => {
                setElapsed(0);
                setStage("reading");
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
            >
              <Play className="h-5 w-5" /> Начать
            </button>
          </div>
        )}

        {stage === "reading" && (
          <div className="flex flex-1 flex-col">
            <article className="flex-1 space-y-4">
              {story.paras.map((p, i) => (
                <div key={i}>
                  <p className="text-[17px] leading-[1.7] text-ink">{p.en}</p>
                  {showTr && p.ru && <p className="mt-1 text-sm leading-relaxed text-muted">{p.ru}</p>}
                </div>
              ))}
            </article>
            <div className="sticky bottom-2 mt-5 flex items-center gap-2 rounded-2xl border border-line bg-surface/95 p-2 shadow-float backdrop-blur">
              <span className="tnum px-2 font-heading text-lg font-extrabold text-ink">{mmss}</span>
              <button
                onClick={() => setShowTr((v) => !v)}
                disabled={!hasTranslation}
                className={`rounded-xl px-3 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                  showTr && hasTranslation ? "bg-brand text-white" : "bg-bg text-ink"
                }`}
              >
                {hasTranslation ? "Перевод" : "EN only"}
              </button>
              <button
                onClick={() => setStage("done")}
                className="ml-auto flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 font-heading text-sm font-extrabold text-white"
              >
                <Check className="h-4 w-4" /> Готов
              </button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm text-muted">Твоя скорость</p>
              <p className="tnum font-heading text-[56px] font-extrabold leading-none text-brand">
                {wpm}
              </p>
              <p className="text-sm font-semibold text-muted">слов в минуту</p>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <Stat n={String(words)} label="слов" />
                <Stat n={mmss} label="время" />
              </div>
              <p className="mt-5 max-w-[300px] text-xs leading-relaxed text-muted">
                Средний носитель читает ~200–250 слов/мин. Скорость растёт от текста к
                тексту — это и есть тренировка.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setShowTr(false);
                  setStage("intro");
                }}
                className="rounded-2xl border border-line bg-surface px-5 py-4 font-heading text-sm font-bold text-ink"
              >
                Ещё раз
              </button>
              <button
                onClick={onBack}
                className="rounded-2xl bg-accent px-5 py-4 font-heading text-sm font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
              >
                К списку
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <p className="tnum font-heading text-2xl font-extrabold text-ink">{n}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
