"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import {
  Text,
  Play,
  Pause,
  Check,
  External,
  Book,
  Prev,
  Next,
  Repeat,
  Gauge,
} from "@/components/Icons";
import {
  gutenbergChunkToStory,
  type GutenbergChunk,
  type GutenbergResponse,
} from "@ie/core/data/gutenberg";
import { storiesByLevel, wordCount, type Story } from "@ie/core/data/reading";
import { LIBRARY, type Book as BookType } from "@ie/core/data/library";
import { usePrefs, useUILang } from "@ie/core/prefs";
import { useActivityTimer } from "@ie/core/timelog";
import { recordWpm } from "@ie/core/wpm";

const LEVELS = ["a1", "a2", "b1", "b2", "c1"] as const;
const GENRE: Record<string, string> = {
  fable: "басня",
  fantasy: "фэнтези",
  humor: "юмор",
  classic: "классика",
  growth: "саморазвитие",
};

const UI = {
  ru: {
    title: "Чтение",
    intro: "Короткие рассказы по уровням и полка книг. Читай массивом — замеряем скорость.",
    stories: "Рассказы",
    books: "Книги",
    words: "слов",
    empty: "Для этого уровня рассказы скоро добавим (наполняем библиотеку public-domain текстов).",
    available: "Можно читать",
    availableNote: "Public domain — загружаем и режем на фрагменты для скорочтения.",
    protected: "Под защитой авторских прав",
    protectedNote: "Не зашиваем текст. Ссылка на источник; позже — загрузка своей копии.",
    loadError: "Не удалось загрузить текст Gutenberg. Проверь интернет и попробуй ещё раз.",
    openSource: "Открыть источник",
    loading: "Загружаю...",
    refresh: "Обновить фрагменты",
    load: "Загрузить фрагменты",
    protectedBody: "Текст не встраиваем: книга защищена, поэтому пока оставляем только источник.",
    fragment: "Фрагмент",
    paragraphs: "абз.",
  },
  en: {
    title: "Reading",
    intro: "Short stories by level and a book shelf. Read in flow — we measure speed.",
    stories: "Stories",
    books: "Books",
    words: "words",
    empty: "Stories for this level are coming soon as we expand the public-domain library.",
    available: "Ready to read",
    availableNote: "Public domain texts: we load and split them into speed-reading fragments.",
    protected: "Copyright protected",
    protectedNote: "We do not embed the text. Open the source; later you will be able to upload your own copy.",
    loadError: "Could not load the Gutenberg text. Check your connection and try again.",
    openSource: "Open source",
    loading: "Loading...",
    refresh: "Refresh fragments",
    load: "Load fragments",
    protectedBody: "This text is protected, so for now we keep only the source link.",
    fragment: "Fragment",
    paragraphs: "paras",
  },
} as const;

export default function Reading() {
  const prefs = usePrefs();
  const ui = useUILang();
  const t = UI[ui];
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
        <h1 data-testid="reading-title" className="font-heading text-2xl font-extrabold text-ink">{t.title}</h1>
        <p className="mt-1 mb-4 text-sm text-muted">
          {t.intro}
        </p>

        {/* Вкладки */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 shadow-card">
          <Seg on={tab === "stories"} onClick={() => setTab("stories")}>
            {t.stories}
          </Seg>
          <Seg on={tab === "books"} onClick={() => setTab("books")}>
            {t.books}
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
              <Empty note={t.empty} />
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
                          {s.author} · {wordCount(s)} {t.words} · {GENRE[s.genre]}
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
  const ui = useUILang();
  const t = UI[ui];
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
      setError(t.loadError);
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
        title={t.available}
        note={t.availableNote}
        books={pd}
        chunksByBook={chunksByBook}
        loadingId={loadingId}
        onLoad={loadBook}
        onOpen={(chunk) => onOpen(gutenbergChunkToStory(chunk))}
      />
      <Group
        title={t.protected}
        note={t.protectedNote}
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
  const ui = useUILang();
  const t = UI[ui];
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
                  aria-label={`${t.openSource}: ${b.title}`}
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
                    ? t.loading
                    : chunksByBook[b.id]?.length
                      ? t.refresh
                      : t.load}
                </button>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {t.protectedBody}
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
                            {t.fragment} {chunk.index}
                          </span>
                          <span className="block text-xs text-muted">
                            {chunk.wordCount} {t.words} · {chunk.paras.length} {t.paragraphs}
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

/* ---------- Ридер одного рассказа: автопоток + замер скорости ---------- */
type Stage = "intro" | "reading" | "done";
type ReaderMode = "chunks" | "rsvp" | "pacer";

type ReadingChunk = {
  id: string;
  text: string;
  wordCount: number;
  paraIndex: number;
};

const MODE_META: Record<ReaderMode, { title: string; note: string }> = {
  chunks: {
    title: "Чанки",
    note: "Смотри группами слов, а не по одному слову.",
  },
  rsvp: {
    title: "RSVP",
    note: "Текст сам идёт в центре, взгляд не бегает по строкам.",
  },
  pacer: {
    title: "Пейсер",
    note: "Линия ведёт темп по полотну текста и снижает возвраты.",
  },
};

const SPEEDS = [180, 240, 320, 420];
const CHUNK_SIZES = [3, 4, 5, 6];

function Reader({ story, onBack }: { story: Story; onBack: () => void }) {
  const words = wordCount(story);
  const hasTranslation = story.paras.some((p) => p.ru);
  const [stage, setStage] = useState<Stage>("intro");
  const [mode, setMode] = useState<ReaderMode>("chunks");
  const [targetWpm, setTargetWpm] = useState(240);
  const [chunkSize, setChunkSize] = useState(4);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [showTr, setShowTr] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const chunks = useMemo(() => makeReadingChunks(story, chunkSize), [story, chunkSize]);
  const currentChunk = chunks[Math.min(chunkIndex, Math.max(chunks.length - 1, 0))];
  const currentRu =
    currentChunk && typeof currentChunk.paraIndex === "number"
      ? story.paras[currentChunk.paraIndex]?.ru
      : undefined;
  const targetSeconds = Math.max(8, Math.ceil((words / targetWpm) * 60));
  const progress =
    mode === "pacer"
      ? Math.min(1, elapsed / targetSeconds)
      : chunks.length > 0
        ? Math.min(1, (chunkIndex + 1) / chunks.length)
        : 0;

  useActivityTimer(stage === "reading" && running ? "reading" : null);

  useEffect(() => {
    if (stage !== "reading" || !running) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [stage, running]);

  useEffect(() => {
    if (stage !== "reading" || !running || mode === "pacer" || !currentChunk) return;
    const baseDelay = (currentChunk.wordCount / targetWpm) * 60 * 1000;
    const delay = Math.max(mode === "rsvp" ? 520 : 850, baseDelay + (mode === "rsvp" ? 120 : 260));
    const id = setTimeout(() => {
      setChunkIndex((i) => {
        if (i >= chunks.length - 1) {
          setRunning(false);
          setStage("done");
          return i;
        }
        return i + 1;
      });
    }, delay);
    return () => clearTimeout(id);
  }, [chunks.length, currentChunk, mode, running, stage, targetWpm]);

  useEffect(() => {
    if (stage !== "reading" || !running || mode !== "pacer") return;
    const remainingMs = Math.max(0, (targetSeconds - elapsed) * 1000);
    const id = setTimeout(() => {
      setRunning(false);
      setStage("done");
    }, remainingMs);
    return () => clearTimeout(id);
  }, [elapsed, mode, running, stage, targetSeconds]);

  const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60
  ).padStart(2, "0")}`;

  // История скорости: замер уходит в ie_wpm один раз при завершении текста.
  useEffect(() => {
    if (stage === "done") recordWpm(wpm, words, elapsed);
  }, [stage, wpm, words, elapsed]);

  function start() {
    setElapsed(0);
    setChunkIndex(0);
    setRunning(true);
    setShowTr(false);
    setStage("reading");
  }

  function restart() {
    setElapsed(0);
    setChunkIndex(0);
    setRunning(true);
    setStage("reading");
  }

  function finish() {
    setRunning(false);
    setStage("done");
  }

  function step(delta: number) {
    if (!chunks.length) return;
    setChunkIndex((i) => Math.min(chunks.length - 1, Math.max(0, i + delta)));
  }

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
                Текст пойдёт автоматически: без кнопки на каждую фразу. Твоя задача —
                держать взгляд и не возвращаться назад. {hasTranslation ? "Перевод можно включить как опору." : "Этот текст из Gutenberg идёт без перевода."}
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

            <section className="mb-3 space-y-3">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-muted">
                  Режим
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(MODE_META) as ReaderMode[]).map((m) => (
                    <Choice key={m} active={mode === m} onClick={() => setMode(m)}>
                      {MODE_META[m].title}
                    </Choice>
                  ))}
                </div>
                <p className="mt-2 min-h-8 text-xs leading-relaxed text-muted">
                  {MODE_META[mode].note}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-muted">
                  Скорость
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SPEEDS.map((speed) => (
                    <Choice
                      key={speed}
                      active={targetWpm === speed}
                      onClick={() => setTargetWpm(speed)}
                    >
                      {speed}
                    </Choice>
                  ))}
                </div>
              </div>

              {mode !== "pacer" && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-muted">
                    Слов в группе
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {CHUNK_SIZES.map((size) => (
                      <Choice
                        key={size}
                        active={chunkSize === size}
                        onClick={() => setChunkSize(size)}
                      >
                        {size}
                      </Choice>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <button
              onClick={start}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
            >
              <Play className="h-5 w-5" /> Старт: {MODE_META[mode].title}
            </button>
          </div>
        )}

        {stage === "reading" && (
          <div className="flex flex-1 flex-col">
            <div className="mb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-extrabold text-ink">
                    {story.title}
                  </p>
                  <p className="text-xs text-muted">
                    {MODE_META[mode].title} · {targetWpm} слов/мин
                  </p>
                </div>
                <span className="tnum rounded-xl bg-surface px-3 py-2 font-heading text-base font-extrabold text-ink shadow-card">
                  {mmss}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>

            {mode === "pacer" ? (
              <article className="relative min-h-[430px] flex-1 overflow-hidden rounded-card border border-line bg-surface px-5 py-6 shadow-card">
                <div
                  className="pointer-events-none absolute left-0 right-0 h-16 border-y border-brand/35 bg-brand-soft/45 transition-all duration-700"
                  style={{ top: `${Math.max(3, Math.min(86, progress * 92))}%` }}
                />
                <div className="relative space-y-4">
                  {story.paras.map((p, i) => (
                    <div key={i}>
                      <p className="text-[18px] leading-[1.72] text-ink">{p.en}</p>
                      {showTr && p.ru && (
                        <p className="mt-2 text-sm leading-relaxed text-muted">{p.ru}</p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ) : (
              <section className="flex min-h-[430px] flex-1 flex-col justify-center rounded-card border border-line bg-surface px-5 py-7 text-center shadow-card">
                <p
                  className={`mx-auto max-w-[360px] font-heading font-extrabold leading-tight text-ink ${
                    mode === "rsvp" ? "text-[34px]" : "text-[30px]"
                  }`}
                >
                  {currentChunk?.text ?? ""}
                </p>
                {showTr && currentRu && (
                  <p className="mx-auto mt-6 max-w-[360px] border-t border-line pt-4 text-sm leading-relaxed text-muted">
                    {currentRu}
                  </p>
                )}
                <p className="tnum mt-7 text-xs font-bold uppercase tracking-[0.08em] text-muted">
                  {Math.min(chunkIndex + 1, chunks.length)} / {chunks.length}
                </p>
              </section>
            )}

            <div className="sticky bottom-2 mt-5 rounded-2xl border border-line bg-surface/95 p-2 shadow-float backdrop-blur">
              <div className="grid grid-cols-[44px_1fr_44px_44px] gap-2">
                <button
                  onClick={() => step(-1)}
                  disabled={mode === "pacer" || chunkIndex === 0}
                  aria-label="Назад"
                  className="flex h-11 items-center justify-center rounded-xl bg-bg text-ink transition-colors disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Prev className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setRunning((v) => !v)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 font-heading text-sm font-extrabold text-white"
                >
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Пауза" : "Дальше"}
                </button>
                <button
                  onClick={() => step(1)}
                  disabled={mode === "pacer" || chunkIndex >= chunks.length - 1}
                  aria-label="Вперёд"
                  className="flex h-11 items-center justify-center rounded-xl bg-bg text-ink transition-colors disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Next className="h-5 w-5" />
                </button>
                <button
                  onClick={restart}
                  aria-label="Повторить"
                  className="flex h-11 items-center justify-center rounded-xl bg-bg text-ink transition-colors hover:text-brand"
                >
                  <Repeat className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setShowTr((v) => !v)}
                disabled={!hasTranslation}
                className={`h-10 rounded-xl px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                  showTr && hasTranslation ? "bg-brand text-white" : "bg-bg text-ink"
                }`}
              >
                {hasTranslation ? "Перевод" : "EN only"}
              </button>
              <button
                onClick={finish}
                className="ml-auto flex h-10 items-center gap-1.5 rounded-xl bg-bg px-4 font-heading text-sm font-extrabold text-ink"
              >
                <Check className="h-4 w-4" /> Готов
              </button>
              </div>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Gauge className="h-6 w-6" />
              </span>
              <p className="text-sm text-muted">Твоя скорость в режиме {MODE_META[mode].title}</p>
              <p className="tnum font-heading text-[56px] font-extrabold leading-none text-brand">
                {wpm}
              </p>
              <p className="text-sm font-semibold text-muted">слов в минуту</p>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <Stat n={String(words)} label="слов" />
                <Stat n={mmss} label="время" />
              </div>
              <p className="mt-5 max-w-[300px] text-xs leading-relaxed text-muted">
                Не просто замер: тренируем устойчивый темп, широкий взгляд и чтение группами.
                Следующий проход можно делать чуть быстрее.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setShowTr(false);
                  restart();
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

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-11 rounded-xl border px-2 text-center font-heading text-sm font-extrabold transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-ink hover:border-brand/45"
      }`}
    >
      {children}
    </button>
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

function makeReadingChunks(story: Story, chunkSize: number): ReadingChunk[] {
  const result: ReadingChunk[] = [];
  story.paras.forEach((para, paraIndex) => {
    const parts = para.en.match(/\S+/g) ?? [];
    for (let i = 0; i < parts.length; i += chunkSize) {
      const slice = parts.slice(i, i + chunkSize);
      result.push({
        id: `${story.id}-${paraIndex}-${i}`,
        text: slice.join(" "),
        wordCount: slice.length,
        paraIndex,
      });
    }
  });
  return result;
}
