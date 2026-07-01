import Link from "next/link";
import { today } from "@/data/packs";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingGate from "@/components/OnboardingGate";
import DayPanel from "@/components/DayPanel";
import { Flame, Play, Spark, Check } from "@/components/Icons";

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

const cycle = [
  { n: "01", t: "Готовность", d: "настрой, снятие барьера" },
  { n: "02", t: "Киносеанс", d: "массивный ввод всей пачки" },
  { n: "03", t: "Активизация", d: "те же слова в речи" },
  { n: "04", t: "Узнавание", d: "спокойный темп, 2–3 прохода" },
];

export default function Today() {
  const { goalWords, hours, streak, packs } = today;
  const filled = packs.filter((p) => p.words.length > 0);
  const total = filled.reduce((s, p) => s + p.words.length, 0);

  return (
    <OnboardingGate>
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Сегодня
            </p>
            <h1 data-testid="home-greeting" className="font-heading text-2xl font-extrabold text-ink">
              Добрый день, Галина
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-sm font-bold text-accent-d shadow-card">
              <Flame className="h-4 w-4" />
              <span className="tnum">{streak}</span>
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Цель дня — метод мыслит сотнями слов, не десятками */}
        <section className="relative overflow-hidden rounded-card bg-brand p-6 text-white shadow-float">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-sm text-white/85">
            Цель дня · интенсив {hours} ч
          </p>
          <p className="mt-1 font-heading text-[44px] font-extrabold leading-none tnum">
            {goalWords} слов
          </p>
          <p className="mt-2 text-sm text-white/90">
            {packs.length} {plural(packs.length, "пачка", "пачки", "пачек")} ·{" "}
            {packs.length} видео · сверхнасыщенное поле
          </p>
          <Link
            href="/session/health"
            data-testid="home-start-session"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
          >
            <Play className="h-5 w-5" />
            Начать сеанс
          </Link>
        </section>

        {/* Программа по дням + почасовка */}
        <DayPanel />

        {/* Пачки дня = блоки метода */}
        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold text-ink">Пачки дня</h2>
            <span className="text-xs text-muted">
              <span className="tnum">{total}</span> слов готово
            </span>
          </div>
          <ul className="space-y-2.5">
            {packs.map((p, i) => {
              const ready = p.words.length > 0;
              return (
                <li key={p.id}>
                  <Link
                    href={ready ? `/session/${p.id}` : "#"}
                    aria-disabled={!ready}
                    className={`flex items-center gap-3 rounded-soft border border-line bg-surface p-3 transition-colors ${
                      ready ? "hover:border-brand/40" : "pointer-events-none opacity-55"
                    }`}
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft font-heading text-sm font-extrabold text-brand-d">
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        Пачка «{p.title}»
                      </span>
                      <span className="block text-xs text-muted">
                        {ready
                          ? `${p.words.length} слов · видео + чтение`
                          : "скоро · готовим контекст"}
                      </span>
                    </span>
                    {ready ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-ok" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-line" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Цикл метода — почему это не карточки по одной */}
        <section className="mt-7 rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <Spark className="h-4 w-4 text-brand" />
            <h2 className="font-heading text-base font-bold text-ink">
              Сеанс, а не карточки
            </h2>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-muted">
            Каждая пачка — это блок: 50–150 слов, жёстко связанных с видео и
            текстом. Перегрузка массивом → активизация в контексте → узнавание.
          </p>
          <ol className="grid grid-cols-2 gap-2.5">
            {cycle.map((c) => (
              <li key={c.n} className="rounded-xl bg-bg p-3">
                <span className="font-heading text-xs font-extrabold text-brand">
                  {c.n}
                </span>
                <span className="mt-0.5 block font-heading text-sm font-bold text-ink">
                  {c.t}
                </span>
                <span className="block text-xs leading-snug text-muted">
                  {c.d}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ok">
            <Check className="h-4 w-4" />
            Без штрафов за ошибки. Темп — твой.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
    </OnboardingGate>
  );
}
