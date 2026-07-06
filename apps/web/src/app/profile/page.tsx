"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import { Sun, Sound, Play, Check } from "@/components/Icons";
import { usePrefs, updatePrefs } from "@ie/core/prefs";
import { listEnglishVoices, speakEnglish } from "@ie/media/speech";
import { fetchMe, logout, pushToCloud, pullFromCloud, type MeUser } from "@/lib/cloud";
import { useSrsStats } from "@ie/core/srs";
import { useTimeStats } from "@ie/core/timelog";
import {
  NATIVE_LANGUAGES,
  GOALS,
  LEVELS,
  INTERESTS,
  TOPICS,
  type LangCode,
} from "@ie/core/data/catalog";

// Локализация интерфейса профиля. Выбор English переключает профиль на английский.
const STR = {
  ru: {
    profile: "Профиль", words: "слов", learned: "усвоено", due: "к повтору",
    nativeLang: "Родной язык для переводов",
    nativeNote: "Перевод слов и примеров будет на этом языке. Это не меняет язык профиля.",
    uiLang: "Язык интерфейса",
    uiNote: "Меню и инструкции приложения будут на этом языке. Переводы слов остаются на родном языке.",
    setup: "Твоя настройка", goal: "Цель", level: "Уровень", topics: "Темы", none: "—",
    time: "Время практики", timeTotal: "всего", timeToday: "сегодня",
    appearance: "Оформление", appearanceNote: "Тёмная тема бережёт глаза в долгих сессиях.",
    themeHint: "Переключатель темы — вверху справа.",
    pace: "Темп занятий",
    paceNote: "Медленный темп даёт больше времени на слово и паузы между фразами. В сеансе темп можно менять.",
    paceNormal: "Обычный", paceSlow: "Медленный",
    sound: "Звук", soundNote: "Не слышно английского в сеансе? Нажми — должно прозвучать «sound test».",
    soundTest: "Проверить звук",
    account: "Аккаунт и облако",
    accountNote: "Вход по волшебной ссылке привяжет прогресс к почте — продолжай с любого устройства.",
    login: "Войти по волшебной ссылке",
    loggedAs: "Ты вошла как",
    cloudSave: "Сохранить в облако",
    cloudLoad: "Забрать из облака",
    cloudSaved: "Прогресс в облаке ✓",
    cloudLoaded: "Прогресс загружен — обновляю…",
    cloudFail: "Не получилось. Попробуй ещё раз.",
    logout: "Выйти",
    plan: "Тариф",
    planFree: "Free · бета",
    planPro: "Интенсив",
    pricing: "Тарифы →",
    voice: "Голос диктора",
    voiceNote: "Нажми ▶ и послушай каждый. Выбери самый живой — им будет озвучен весь английский.",
    voiceCurrent: "выбран",
    voiceEmpty: "Английских голосов не найдено.",
    voiceAdvice: "Совет: лучшие голоса ставятся в macOS: Системные настройки → Универсальный доступ → Устная речь → Системный голос → Управление голосами → English (например, Samantha, Ava или Zoe (Premium)). После установки перезапусти браузер.",
    soundOk: (n: number) => `Найдено английских голосов: ${n}. Если тишина — проверь громкость и вывод звука.`,
    soundNone: "Английских голосов в системе нет. Добавь: Системные настройки → Универсальный доступ → Устная речь → Управление голосами (напр. Samantha).",
    redo: "Пройти онбординг заново", reset: "Сбросить прогресс повторов",
  },
  en: {
    profile: "Profile", words: "words", learned: "learned", due: "to review",
    nativeLang: "Native language for translations",
    nativeNote: "Word and example translations use this language. It does not change the profile language.",
    uiLang: "Interface language",
    uiNote: "Menus and app instructions use this language. Word translations stay in your native language.",
    setup: "Your setup", goal: "Goal", level: "Level", topics: "Topics", none: "—",
    time: "Practice time", timeTotal: "total", timeToday: "today",
    appearance: "Appearance", appearanceNote: "Dark theme is easier on the eyes in long sessions.",
    themeHint: "Theme toggle is in the top right.",
    pace: "Session pace",
    paceNote: "Slow pace gives more time per word and longer pauses between phrases. You can change it during a session.",
    paceNormal: "Normal", paceSlow: "Slow",
    sound: "Sound", soundNote: "No English audio in a session? Tap — you should hear “sound test”.",
    soundTest: "Test sound",
    account: "Account & cloud",
    accountNote: "Magic-link sign-in binds progress to your email — continue from any device.",
    login: "Sign in with a magic link",
    loggedAs: "Signed in as",
    cloudSave: "Save to cloud",
    cloudLoad: "Load from cloud",
    cloudSaved: "Progress is in the cloud ✓",
    cloudLoaded: "Progress loaded — refreshing…",
    cloudFail: "Something went wrong. Try again.",
    logout: "Sign out",
    plan: "Plan",
    planFree: "Free · beta",
    planPro: "Intensive",
    pricing: "Pricing →",
    voice: "Narrator voice",
    voiceNote: "Tap ▶ to hear each one. Pick the most alive — it will speak all English.",
    voiceCurrent: "selected",
    voiceEmpty: "No English voices found.",
    voiceAdvice: "Tip: the best voices install in macOS: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → English (e.g., Samantha, Ava, or Zoe (Premium)). Restart the browser afterwards.",
    soundOk: (n: number) => `English voices found: ${n}. If silent, check volume and audio output.`,
    soundNone: "No English voices in the system. Add one: System Settings → Accessibility → Spoken Content → Manage Voices (e.g. Samantha).",
    redo: "Redo onboarding", reset: "Reset review progress",
  },
} as const;

export default function Profile() {
  const prefs = usePrefs();
  const stats = useSrsStats();
  const time = useTimeStats();
  const router = useRouter();

  const en = prefs?.uiLang === "en";
  const t = STR[en ? "en" : "ru"];
  const goalObj = GOALS.find((g) => g.id === prefs?.goal);
  const levelObj = LEVELS.find((l) => l.id === prefs?.level);
  const goal = goalObj ? (en ? goalObj.titleEn : goalObj.title) : t.none;
  const level = levelObj ? (en ? levelObj.titleEn : levelObj.title) : t.none;
  const topicTitles = (prefs?.topics ?? [])
    .map((id) => {
      // Интересы-смыслы (новая классификация) + фолбэк на легаси-ярлыки TOPICS
      // для профилей, настроенных до разделения осей.
      const x = INTERESTS.find((x) => x.id === id) ?? TOPICS.find((x) => x.id === id);
      return x ? (en ? x.titleEn : x.title) : null;
    })
    .filter(Boolean)
    .join(", ");

  function resetOnboarding() {
    try {
      localStorage.removeItem("ie_prefs");
    } catch {}
    router.push("/onboarding");
  }

  function resetProgress() {
    try {
      localStorage.removeItem("ie_srs");
    } catch {}
    // перерисовка произойдёт через store; мягко обновим
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 data-testid="profile-title" className="font-heading text-2xl font-extrabold text-ink">{t.profile}</h1>
          <ThemeToggle />
        </div>

        {/* Прогресс */}
        <div className="grid grid-cols-3 gap-2.5">
          <Mini n={stats.total} label={t.words} />
          <Mini n={stats.learned} label={t.learned} />
          <Mini n={stats.dueToday} label={t.due} />
        </div>

        {/* Аккаунт и облако */}
        <Card title={t.account} note={t.accountNote}>
          <AccountCard t={t} />
        </Card>

        {/* Родной язык для переводов */}
        <Card title={t.nativeLang} note={t.nativeNote}>
          <div className="grid grid-cols-2 gap-2">
            {NATIVE_LANGUAGES.map((l) => {
              const on = prefs?.nativeLang === l.code;
              return (
                <button
                  key={l.code}
                  dir={l.dir}
                  onClick={() => updatePrefs({ nativeLang: l.code as LangCode })}
                  className={`flex items-center gap-2 rounded-soft border p-2.5 text-left transition-colors ${
                    on ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/40"
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="font-heading text-sm font-bold text-ink">{l.native}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Язык профиля */}
        <Card title={t.uiLang} note={t.uiNote}>
          <div className="grid grid-cols-2 gap-2">
            <ProfileLangButton
              active={prefs?.uiLang !== "en"}
              title="Русский"
              onClick={() => updatePrefs({ uiLang: "ru" })}
            />
            <ProfileLangButton
              active={prefs?.uiLang === "en"}
              title="English"
              onClick={() => updatePrefs({ uiLang: "en" })}
            />
          </div>
        </Card>

        {/* Время практики */}
        <Card title={t.time}>
          <Row label={t.timeTotal} value={fmtHM(time.totalSec, en)} />
          <Row label={t.timeToday} value={fmtHM(time.todaySec, en)} />
        </Card>

        {/* Сводка настроек */}
        <Card title={t.setup}>
          <Row label={t.goal} value={goal} />
          <Row label={t.level} value={level} />
          <Row label={t.topics} value={topicTitles || t.none} />
        </Card>

        {/* Темп занятий */}
        <Card title={t.pace} note={t.paceNote}>
          <div className="grid grid-cols-2 gap-2">
            {(["normal", "slow"] as const).map((p) => {
              const on = (prefs?.pace ?? "normal") === p;
              return (
                <button
                  key={p}
                  onClick={() => updatePrefs({ pace: p })}
                  className={`rounded-soft border p-2.5 text-center font-heading text-sm font-bold transition-colors ${
                    on
                      ? "border-brand bg-brand-soft text-brand-d"
                      : "border-line bg-surface text-ink hover:border-brand/40"
                  }`}
                >
                  {p === "normal" ? t.paceNormal : t.paceSlow}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Проверка звука */}
        {/* Голос диктора */}
        <Card title={t.voice} note={t.voiceNote}>
          <VoicePicker
            current={prefs?.voiceName}
            empty={t.voiceEmpty}
            advice={t.voiceAdvice}
            currentLabel={t.voiceCurrent}
          />
        </Card>

        <Card title={t.sound} note={t.soundNote}>
          <SoundTest
            label={t.soundTest}
            onResult={(n) => (n > 0 ? t.soundOk(n) : t.soundNone)}
          />
        </Card>

        {/* Тема оформления */}
        <Card title={t.appearance} note={t.appearanceNote}>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sun className="h-4 w-4" /> {t.themeHint}
          </div>
        </Card>

        {/* Действия */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={resetOnboarding}
            className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 font-heading text-sm font-bold text-ink"
          >
            {t.redo}
          </button>
          <button
            onClick={resetProgress}
            className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 font-heading text-sm font-bold text-muted"
          >
            {t.reset}
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function fmtHM(sec: number, en: boolean): string {
  const m = Math.floor(sec / 60);
  if (m < 1) return "—";
  const h = Math.floor(m / 60);
  const [hu, mu] = en ? ["h", "m"] : ["ч", "м"];
  return h > 0 ? `${h} ${hu} ${m % 60} ${mu}` : `${m} ${mu}`;
}

function Mini({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-card bg-surface p-3.5 text-center shadow-card">
      <p className="tnum font-heading text-xl font-extrabold text-brand">{n}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

// Диагностика озвучки: проговаривает тест и показывает число англ. голосов ОС.
// Аккаунт: вход по волшебной ссылке + ручной облачный синк прогресса (v1).
function AccountCard({ t }: { t: (typeof STR)["ru"] | (typeof STR)["en"] }) {
  const [user, setUser] = useState<MeUser>(null);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((u) => {
      setUser(u);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <div className="h-12" />;

  if (!user) {
    return (
      <a
        href="/login"
        data-testid="account-login"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3.5 font-heading text-sm font-bold text-white"
      >
        {t.login}
      </a>
    );
  }

  async function save() {
    setMsg((await pushToCloud()) ? t.cloudSaved : t.cloudFail);
  }
  async function load() {
    if (await pullFromCloud()) {
      setMsg(t.cloudLoaded);
      setTimeout(() => window.location.reload(), 600);
    } else {
      setMsg(t.cloudFail);
    }
  }
  async function out() {
    await logout();
    setUser(null);
    setMsg(null);
  }

  return (
    <div>
      <p className="text-sm text-muted">
        {t.loggedAs} <b className="text-ink">{user.email}</b>
      </p>
      <p className="mt-1 flex items-center justify-between text-sm">
        <span className="text-muted">
          {t.plan}:{" "}
          <b className="text-ink">{user.plan === "pro" ? t.planPro : t.planFree}</b>
        </span>
        <a href="/pricing" className="text-xs font-bold text-brand underline-offset-2 hover:underline">
          {t.pricing}
        </a>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={save}
          data-testid="cloud-save"
          className="rounded-2xl bg-brand px-4 py-3 font-heading text-sm font-bold text-white"
        >
          {t.cloudSave}
        </button>
        <button
          onClick={load}
          data-testid="cloud-load"
          className="rounded-2xl border border-line bg-surface px-4 py-3 font-heading text-sm font-bold text-ink"
        >
          {t.cloudLoad}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs font-semibold text-muted">{msg}</p>}
      <button onClick={out} className="mt-2 w-full py-2 text-center text-xs font-semibold text-muted">
        {t.logout}
      </button>
    </div>
  );
}

// Выбор голоса озвучки: прослушай каждый английский голос системы и выбери.
// Выбранное имя хранится в prefs.voiceName и используется всей озвучкой.
function VoicePicker({
  current,
  empty,
  advice,
  currentLabel,
}: {
  current?: string;
  empty: string;
  advice: string;
  currentLabel: string;
}) {
  const [voices, setVoices] = useState<{ name: string; lang: string }[]>([]);

  useEffect(() => {
    const load = () =>
      setVoices(listEnglishVoices().map((v) => ({ name: v.name, lang: v.lang })));
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
  }, []);

  if (voices.length === 0) {
    return (
      <div>
        <p className="text-sm font-semibold text-warn">{empty}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{advice}</p>
      </div>
    );
  }

  return (
    <div>
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {voices.map((v) => {
          const on = current === v.name;
          return (
            <li key={v.name} className="flex items-center gap-2">
              <button
                onClick={() =>
                  speakEnglish("Hello! I will be your English voice.", {
                    interrupt: true,
                    voiceName: v.name,
                  })
                }
                aria-label={`Прослушать ${v.name}`}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-d"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  updatePrefs({ voiceName: v.name });
                  speakEnglish("Great choice! Let us learn together.", {
                    interrupt: true,
                    voiceName: v.name,
                  });
                }}
                className={`flex min-h-9 flex-1 items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-left transition-colors ${
                  on ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/40"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {v.name}
                  </span>
                  <span className="block text-[11px] text-muted">{v.lang}</span>
                </span>
                {on && (
                  <span className="flex flex-shrink-0 items-center gap-1 text-xs font-bold text-brand-d">
                    <Check className="h-4 w-4" /> {currentLabel}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-muted">{advice}</p>
    </div>
  );
}

function SoundTest({
  label,
  onResult,
}: {
  label: string;
  onResult: (n: number) => string;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div>
      <button
        onClick={() => {
          const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
          const voices = synth ? synth.getVoices() : [];
          const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
          setMsg(onResult(en.length));

          // Отправляем диагностику на сервер, чтобы увидеть реальное окружение.
          const diag: Record<string, unknown> = {
            ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
            totalVoices: voices.length,
            enVoices: en.map((v) => `${v.name} / ${v.lang}${v.default ? " *" : ""}`),
            state: synth
              ? { speaking: synth.speaking, pending: synth.pending, paused: synth.paused }
              : null,
          };
          const post = (extra: Record<string, unknown>) => {
            try {
              fetch("/api/soundlog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...diag, ...extra }),
              });
            } catch {}
          };
          try {
            const u = new SpeechSynthesisUtterance("Sound test. One, two, three.");
            u.lang = "en-US";
            if (en[0]) u.voice = en[0];
            u.onstart = () => post({ event: "start" });
            u.onend = () => post({ event: "end" });
            u.onerror = (e) => post({ event: "error", error: (e as SpeechSynthesisErrorEvent).error });
            synth?.resume();
            synth?.cancel();
            synth?.speak(u);
            post({ event: "speak-called" });
          } catch (e) {
            post({ event: "throw", error: String(e) });
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3.5 font-heading text-sm font-bold text-white"
      >
        <Sound className="h-4 w-4" /> {label}
      </button>
      {msg && <p className="mt-2 text-xs leading-relaxed text-muted">{msg}</p>}
    </div>
  );
}

function ProfileLangButton({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-2 rounded-soft border p-2.5 text-left transition-colors ${
        active ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/40"
      }`}
    >
      <span className="font-heading text-sm font-bold text-ink">{title}</span>
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
          active ? "border-brand bg-brand text-white" : "border-line"
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-current" />}
      </span>
    </button>
  );
}

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-card border border-line bg-surface p-4">
      <h2 className="font-heading text-base font-bold text-ink">{title}</h2>
      {note && <p className="mt-0.5 mb-3 text-xs text-muted">{note}</p>}
      {!note && <div className="mb-3" />}
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
