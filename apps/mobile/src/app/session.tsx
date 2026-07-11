import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { sessionWords, sessionLevelLabel } from "@ie/core/data/levelVocab";
import { knownWordSet, recordNoticed } from "@ie/core/srs";
import { translate, type Word } from "@ie/core/data/packs";
import { AFFIRMATIONS } from "@ie/core/data/affirmations";
import { usePrefs } from "@ie/core/prefs";
import { recordAnswer } from "@ie/core/srs";
import { useActivityTimer } from "@ie/core/timelog";
import { addArtifact } from "@ie/core/output";
import { speakEnglish } from "@ie/media/speech";
import { useVoiceRecorder } from "@ie/media/recorder";
import { useCalmMusic } from "@/lib/calm-music";
import { useT } from "@/lib/i18n";
import { BotanicalFrame } from "@/components/botanical";
import { useMarina } from "@/theme";

// Сессия дня — ОДИН флоу 4 фаз (13_app_logic §3.2, макет 2b/v2):
//   1 настройка (дыхание + классика + установки — снятие барьера)
//   2 поток слов (вал по Петрусинскому: массив, темп вплоть до субцептивного)
//   3 контекст (те же слова в живых фразах, тап = слой перевода)
//   4 сказать своё (вопрос дня + чипы слов + голос/текст → артефакт)
// Говорение — финал сессии, не отдельная кнопка: каждый цикл заканчивается
// активным выводом. attune/bridge — внутренние шаги фазы 1.

type Phase = "attune" | "bridge" | "flow" | "context" | "say" | "done";

/** Номер фазы для индикатора «N/4» в шапке. */
const PHASE_NO: Record<Phase, number> = {
  attune: 1,
  bridge: 1,
  flow: 2,
  context: 3,
  say: 4,
  done: 4,
};

/** Вопрос дня для «сказать своё» — ротация по дате, без сети. */
const SAY_QUESTIONS = [
  { ru: "Что тебя сейчас выматывает — и что ты с этим делаешь?", en: "What is draining you these days — and what are you doing about it?" },
  { ru: "Что ты сделала сегодня намеренно, не по привычке?", en: "What did you do on purpose today, not out of habit?" },
  { ru: "Что тебе хочется поменять в своих буднях?", en: "What would you like to change in your everyday life?" },
  { ru: "Чему ты научилась за последнее время — вне английского?", en: "What have you learned recently — outside English?" },
  { ru: "Какой разговор ты откладываешь — и почему?", en: "What conversation are you putting off — and why?" },
  { ru: "Что сегодня было проще, чем ты ожидала?", en: "What was easier today than you expected?" },
  { ru: "О чём ты думаешь перед сном в последние дни?", en: "What has been on your mind before sleep lately?" },
  { ru: "Какое место в твоём городе тебе дорого — и чем?", en: "What place in your city matters to you — and why?" },
] as const;

const BREATH_CYCLES = 3;
const INHALE = 4000;
const HOLD = 2000;
const EXHALE = 6000;

/** Темпы киносеанса. «Вал» — предъявление быстрее сознательного чтения:
 *  фиксируется неосознанным восприятием, озвучка не успевает и не нужна. */
const TEMPOS = [
  { id: "calm", label: "Спокойный", ms: 2400, tts: true },
  { id: "fast", label: "Быстрый", ms: 1100, tts: false },
  { id: "wave", label: "Вал", ms: 450, tts: false },
] as const;

function levelPackId(level?: string): string {
  const l = (level ?? "b1").toLowerCase();
  if (l === "c1" || l === "c2") return "level-c1";
  if (l === "b2") return "level-b2";
  return "level-b1"; // a1/a2/b1 — стартовый частотный массив
}

export default function SessionScreen() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const prefs = usePrefs();
  const music = useCalmMusic();
  const { t } = useT();

  // Вал с ростом i+1: твой уровень + подмешиваем следующий, новые слова
  // вперёд, узнанные — на повтор. Так массив ведёт вверх (B1→B2→C1).
  const words = useMemo(
    () => sessionWords(prefs?.level, knownWordSet(), 40),
    [prefs?.level]
  );
  const levelLabel = sessionLevelLabel(prefs?.level);

  const [phase, setPhase] = useState<Phase>("attune");
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [tempoIdx, setTempoIdx] = useState(0);
  const [knownCount, setKnownCount] = useState(0);

  // Реальные минуты активных фаз → шаг «Сессия дня» в плане.
  useActivityTimer(
    phase === "flow" && running
      ? "flash"
      : phase === "context"
        ? "context"
        : phase === "say"
          ? "output"
          : null
  );

  // Музыка живёт весь сеанс: громче на настройке, тихо под потоком.
  useEffect(() => {
    music.start(0.35);
    return () => music.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function leave() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    music.stop();
    router.back();
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        padding: 20,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.muted, fontVariant: ["tabular-nums"] }}>
          {phase === "done"
            ? t.sessionX.done
            : `${PHASE_NO[phase]}/4 · ${
                phase === "attune" || phase === "bridge"
                  ? t.sessionX.attune
                  : phase === "flow"
                    ? levelLabel
                    : phase === "context"
                      ? t.sessionX.ctxPhase
                      : t.sessionX.sayPhase
              }`}
        </Text>
        <Pressable
          onPress={leave}
          accessibilityRole="button"
          accessibilityLabel={t.sessionX.exit}
          hitSlop={10}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="close" size={18} color={c.muted} />
        </Pressable>
      </View>

      {(phase === "attune" || phase === "bridge") && <BotanicalFrame />}

      {phase === "attune" && (
        <Attune
          onDone={() => {
            setPhase("bridge");
          }}
        />
      )}

      {phase === "bridge" && (
        <Bridge
          onDone={() => {
            music.duck(0.06);
            setPhase("flow");
          }}
        />
      )}

      {phase === "flow" && (
        <Flow
          words={words}
          idx={idx}
          setIdx={setIdx}
          running={running}
          setRunning={setRunning}
          tempoIdx={tempoIdx}
          setTempoIdx={setTempoIdx}
          nativeLang={prefs?.nativeLang ?? "ru"}
          packId="level"
          onKnown={() => setKnownCount((n) => n + 1)}
          knownCount={knownCount}
          onFinish={() => {
            music.duck(0.2);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPhase("context");
          }}
        />
      )}

      {phase === "context" && (
        <Context
          words={words}
          nativeLang={prefs?.nativeLang ?? "ru"}
          onDone={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setPhase("say");
          }}
        />
      )}

      {phase === "say" && (
        <Say
          words={words}
          onDone={() => {
            music.duck(0.3);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPhase("done");
          }}
        />
      )}

      {phase === "done" && <Done count={words.length} known={knownCount} onClose={leave} />}
    </View>
  );
}

/* ---------- Настройка: дыхание под классику + установки ---------- */

function Attune({ onDone }: { onDone: () => void }) {
  const { c, sk } = useMarina();
  const { t } = useT();
  const scale = useRef(new Animated.Value(1)).current;
  const [label, setLabel] = useState(t.sessionX.inhale);
  const [cycle, setCycle] = useState(1);
  const [affIdx, setAffIdx] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const alive = useRef(true);

  // Установки сменяются мягко, раз в цикл дыхания.
  useEffect(() => {
    const id = setInterval(() => setAffIdx((i) => (i + 1) % AFFIRMATIONS.length), INHALE + HOLD + EXHALE);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    alive.current = true;
    let left = BREATH_CYCLES;
    const run = () => {
      if (!alive.current) return;
      setLabel(t.sessionX.inhale);
      Animated.timing(scale, { toValue: 1.4, duration: INHALE, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
        if (!alive.current) return;
        setLabel(t.sessionX.hold);
        setTimeout(() => {
          if (!alive.current) return;
          setLabel(t.sessionX.exhale);
          Animated.timing(scale, { toValue: 1, duration: EXHALE, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
            if (!alive.current) return;
            left--;
            if (left <= 0) onDone();
            else {
              setCycle(BREATH_CYCLES - left + 1);
              run();
            }
          });
        }, HOLD);
      });
    };
    run();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aff = AFFIRMATIONS[affIdx];

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.muted }}>
        {t.sessionX.circleOf(cycle, BREATH_CYCLES)}
      </Text>
      {/* Зона круга фиксирована: на вдохе (scale 1.4) он растёт внутри неё,
          не наезжая на подписи — воздух сохраняется. */}
      <View style={{ height: 240, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: c.brandSoft,
          borderWidth: 2,
          borderColor: c.brand,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
        }}
      >
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 19, color: c.brandD }}>
          {label}
        </Text>
      </Animated.View>
      </View>
      <View style={{ gap: 6, alignItems: "center", minHeight: 70, paddingTop: 6 }}>
        <Text
          style={{
            fontFamily: "GolosText_700Bold",
            fontSize: 17,
            lineHeight: 25,
            color: c.ink,
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          {aff.ru}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted, textAlign: "center" }}>
          {aff.en}
        </Text>
      </View>
      <Pressable onPress={onDone} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, color: c.muted }}>
          {t.common.ready}
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Мягкий мост: без резких переходов (метод: без стресса) ---------- */

function Bridge({ onDone }: { onDone: () => void }) {
  const { c } = useMarina();
  const { t } = useT();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    const t = setTimeout(onDone, 3600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", opacity: anim, gap: 12 }}>
      <Ionicons name="water" size={30} color={c.brand} />
      <Text
        style={{
          fontFamily: "GolosText_700Bold",
          fontSize: 18,
          lineHeight: 27,
          color: c.ink,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        {t.sessionX.bridgeTitle}
      </Text>
      <Text
        style={{
          fontFamily: "GolosText_400Regular",
          fontSize: 14,
          lineHeight: 21,
          color: c.muted,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        {t.sessionX.bridgeBody}
      </Text>
    </Animated.View>
  );
}

/* ---------- Киносеанс: вал слов ---------- */

function Flow({
  words,
  idx,
  setIdx,
  running,
  setRunning,
  tempoIdx,
  setTempoIdx,
  nativeLang,
  packId,
  onKnown,
  knownCount,
  onFinish,
}: {
  words: Word[];
  idx: number;
  setIdx: (f: (i: number) => number) => void;
  running: boolean;
  setRunning: (v: boolean) => void;
  tempoIdx: number;
  setTempoIdx: (i: number) => void;
  nativeLang: string;
  packId: string;
  onKnown: () => void;
  knownCount: number;
  onFinish: () => void;
}) {
  const { c, sk, radius } = useMarina();
  const { t } = useT();
  const tempo = TEMPOS[tempoIdx];
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    stop();
    if (!running) return;
    timer.current = setInterval(() => {
      setIdx((i) => {
        const next = i + 1;
        if (next >= words.length) {
          stop();
          onFinish();
          return i;
        }
        return next;
      });
    }, tempo.ms);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, tempoIdx]);

  // Озвучка только на спокойном темпе — быстрее голос не успевает (и не должен).
  const w = words[Math.min(idx, words.length - 1)];
  useEffect(() => {
    if (running && tempo.tts) speakEnglish(w.en, { interrupt: true, rate: 1.0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, running]);

  const tr = translate(w, nativeLang as never);
  const pct = Math.round(((idx + 1) / words.length) * 100);

  function toggle() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning(!running);
  }

  // «Знаю»: узнавание прямо в потоке — слово уходит в SRS (Good) и в
  // счётчик «слов в узнавании». Поток НЕ останавливается: метод любит ритм.
  function markKnown() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordAnswer(packId, w.en, true);
    onKnown();
  }

  return (
    <View style={{ flex: 1, gap: 14, paddingTop: 12 }}>
      {/* Прогресс массива */}
      <View style={{ gap: 6 }}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.line, overflow: "hidden" }}>
          <View style={{ width: `${pct}%`, height: 6, backgroundColor: sk.words }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: c.brand, fontVariant: ["tabular-nums"] }}>
            {knownCount > 0 ? t.sessionX.knownN(knownCount) : " "}
          </Text>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: c.muted, fontVariant: ["tabular-nums"] }}>
            {t.sessionX.wordsOf(idx + 1, words.length)}
          </Text>
        </View>
      </View>

      {/* Карточка слова — макет 2b: тёплая тень, волна-декор, тап = озвучка */}
      <Pressable
        onPress={() => speakEnglish(w.en, { interrupt: true, rate: 1.0 })}
        accessibilityRole="button"
        accessibilityLabel={w.en}
        style={{
          flex: 1,
          backgroundColor: c.surface,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 4,
          shadowColor: "#3c280f",
          shadowOpacity: 0.24,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        }}
      >
        <Text
          style={{
            fontFamily: "Lora_500Medium",
            fontSize: 36,
            lineHeight: 46,
            letterSpacing: -0.4,
            color: c.ink,
            textAlign: "center",
          }}
        >
          {w.en}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, color: c.muted }}>{w.ipa}</Text>
        <Text
          style={{
            fontFamily: "GolosText_500Medium",
            fontSize: 17,
            lineHeight: 24,
            color: c.brand,
            textAlign: "center",
            marginTop: 6,
          }}
        >
          {tr.text}
        </Text>
        {/* Аудиоволна — цвет навыка «слух», приглашение прослушать */}
        <View style={{ flexDirection: "row", gap: 3, alignItems: "flex-end", height: 20, marginTop: 12 }}>
          {[8, 16, 11, 19, 7, 13].map((hh, i) => (
            <View key={i} style={{ width: 4, height: hh, borderRadius: 2, backgroundColor: sk.sounds }} />
          ))}
        </View>
      </Pressable>

      {/* «Ещё нет / Знаю» — узнавание прямо в потоке, ритм не останавливаем */}
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIdx((i) => (i + 1 >= words.length ? i : i + 1));
          }}
          accessibilityRole="button"
          accessibilityLabel={t.sessionX.notYet}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 50,
            borderRadius: 13,
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#3c280f",
            shadowOpacity: 0.12,
            shadowRadius: 9,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13.5, color: c.muted }}>
            {t.sessionX.notYet}
          </Text>
        </Pressable>
        <Pressable
          onPress={markKnown}
          accessibilityRole="button"
          accessibilityLabel={t.sessionX.knowA11y(w.en)}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 50,
            borderRadius: 13,
            backgroundColor: c.accent,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13.5, color: c.onBrand }}>
            {t.sessionX.know}
          </Text>
        </Pressable>
      </View>

      {/* Темп */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {TEMPOS.map((tp, i) => {
          const on = i === tempoIdx;
          return (
            <Pressable
              key={tp.id}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTempoIdx(i);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
                borderColor: on ? sk.words : c.line,
                backgroundColor: on ? sk.words : c.surface,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "GolosText_600SemiBold",
                  fontSize: 13,
                  color: on ? c.onBrand : c.ink,
                }}
              >
                {t.sessionX.tempos[tp.id]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, lineHeight: 16, color: c.muted, textAlign: "center" }}>
        {t.sessionX.waveNote}
      </Text>

      {/* Пуск/пауза */}
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 56,
          borderRadius: 16,
          backgroundColor: running ? c.surface : c.accent,
          borderWidth: running ? 1 : 0,
          borderColor: c.line,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name={running ? "pause" : "play"} size={18} color={running ? c.ink : c.onBrand} />
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: running ? c.ink : c.onBrand}}>
          {running ? t.sessionX.pause : idx === 0 ? t.sessionX.go : t.sessionX.resume}
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Фаза 3 · Контекст: те же слова в живых фразах ---------- */

function Context({
  words,
  nativeLang,
  onDone,
}: {
  words: Word[];
  nativeLang: string;
  onDone: () => void;
}) {
  const { c, sk } = useMarina();
  const { t } = useT();
  // Слова сессии, у которых есть живая фраза; порядок сессии уже «новые вперёд».
  const items = useMemo(() => words.filter((w) => !!w.exEn).slice(0, 5), [words]);
  const known = useMemo(() => knownWordSet(), []);
  const [selected, setSelected] = useState<Word | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    // У пачки нет фраз-контекста — честно идём к выводу, не показывая пустоту.
    onDone();
    return null;
  }

  function openWord(w: Word) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordNoticed(w.en);
    setSelected(w);
  }

  function addToVocab(w: Word) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Тап «В мой словарь» = слово входит в повторы (Again → вернётся завтра).
    recordAnswer("level", w.en, false);
    setAdded((s) => new Set(s).add(w.en));
  }

  const selTr = selected ? translate(selected, nativeLang as never) : null;

  return (
    <View style={{ flex: 1, paddingTop: 12, gap: 10 }}>
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
        {t.sessionX.ctxHint}
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
        {items.map((w) => {
          const ex = w.exEn as string;
          const i = ex.toLowerCase().indexOf(w.en.toLowerCase());
          const before = i >= 0 ? ex.slice(0, i) : ex;
          const match = i >= 0 ? ex.slice(i, i + w.en.length) : "";
          const after = i >= 0 ? ex.slice(i + w.en.length) : "";
          const isKnown = known.has(w.en.toLowerCase());
          return (
            <Pressable
              key={w.en}
              onPress={() => openWord(w)}
              accessibilityRole="button"
              accessibilityLabel={w.en}
              style={({ pressed }) => ({
                backgroundColor: c.surface,
                borderRadius: 16,
                padding: 15,
                shadowColor: "#3c280f",
                shadowOpacity: 0.12,
                shadowRadius: 9,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
                opacity: pressed ? 0.85 : 1,
                borderWidth: selected?.en === w.en ? 1.5 : 0,
                borderColor: c.brand,
              })}
            >
              <Text style={{ fontFamily: "Lora_400Regular", fontSize: 17, lineHeight: 27, color: c.ink }}>
                {before}
                <Text
                  style={
                    isKnown
                      ? { textDecorationLine: "underline", textDecorationColor: c.accent, color: c.ink }
                      : { backgroundColor: c.amber, color: c.ink }
                  }
                >
                  {match}
                </Text>
                {after}
              </Text>
            </Pressable>
          );
        })}
        {/* Легенда маркировки — как в макете: амбер = новое, мята = знакомое */}
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center", paddingHorizontal: 2 }}>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c.amber }} />
            <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 11, color: c.muted }}>
              {t.sessionX.ctxLegendNew}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: c.accent }} />
            <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 11, color: c.muted }}>
              {t.sessionX.ctxLegendKnown}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Слой перевода снизу — макет: слово · транскрипция · перевод · действия */}
      {selected && selTr && (
        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: 18,
            padding: 16,
            gap: 4,
            shadowColor: "#3c280f",
            shadowOpacity: 0.22,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 5,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: "Lora_500Medium", fontSize: 22, color: c.ink }}>
              {selected.en}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>
              {selected.ipa}
            </Text>
          </View>
          <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 15, color: c.brand }}>
            {selTr.text}
          </Text>
          <View style={{ flexDirection: "row", gap: 9, marginTop: 10 }}>
            <Pressable
              onPress={() => speakEnglish(selected.exEn ?? selected.en, { interrupt: true, rate: 0.95 })}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: c.line,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="volume-medium" size={16} color={c.ink} />
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.ink }}>
                {t.sessionX.ctxListen}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => addToVocab(selected)}
              disabled={added.has(selected.en)}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 46,
                borderRadius: 12,
                backgroundColor: added.has(selected.en) ? c.brandSoft : c.accent,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "GolosText_600SemiBold",
                  fontSize: 13,
                  color: added.has(selected.en) ? c.brandD : c.onBrand,
                }}
              >
                {added.has(selected.en) ? t.sessionX.ctxAdded : t.sessionX.ctxAdd}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 56,
          borderRadius: 16,
          backgroundColor: c.brand,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.onBrand }}>
          {t.sessionX.ctxNext}
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Фаза 4 · Сказать своё: активный вывод — финал сессии ---------- */

function Say({ words, onDone }: { words: Word[]; onDone: () => void }) {
  const { c, sk } = useMarina();
  const { t, lang } = useT();
  const rec = useVoiceRecorder();
  const [text, setText] = useState("");
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // Вопрос дня — ротация по дате; чипы-опоры — первые слова сессии с фразами.
  const dayIdx = Math.floor(Date.now() / 86400000) % SAY_QUESTIONS.length;
  const q = SAY_QUESTIONS[dayIdx];
  const chips = useMemo(
    () => words.filter((w) => !!w.exEn).slice(0, 4).map((w) => w.en),
    [words]
  );

  const canSave = text.trim().length > 0 || !!audioUri;

  function insertChip(word: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setText((s) => (s.length === 0 || s.endsWith(" ") ? `${s}${word} ` : `${s} ${word} `));
  }

  async function toggleRecord() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (rec.recording) {
      const uri = await rec.stop();
      if (uri) setAudioUri(uri);
    } else {
      setAudioUri(null);
      await rec.start();
    }
  }

  function save() {
    const usedWords = chips.filter((w) => text.toLowerCase().includes(w.toLowerCase()));
    addArtifact({
      type: audioUri ? "speech" : "essay",
      promptId: "session-say",
      text: text.trim() || undefined,
      audioRef: audioUri ?? undefined,
      words: usedWords,
    });
    onDone();
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 12, gap: 12, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, lineHeight: 31, color: c.ink }}>
        {lang === "en" ? q.en : q.ru}
      </Text>
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted }}>
        {t.sessionX.sayHint}
      </Text>

      {/* Чипы-опоры из сегодняшних слов */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {chips.map((w) => (
          <Pressable
            key={w}
            onPress={() => insertChip(w)}
            accessibilityRole="button"
            accessibilityLabel={t.sessionX.sayChipA11y(w)}
            style={({ pressed }) => ({
              paddingHorizontal: 13,
              minHeight: 38,
              justifyContent: "center",
              borderRadius: 999,
              backgroundColor: c.amber,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontFamily: "Lora_500Medium", fontSize: 14, color: "#3b2c07" }}>{w}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder={t.sessionX.sayPlaceholder}
        placeholderTextColor={c.muted}
        style={{
          minHeight: 130,
          backgroundColor: c.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.line,
          padding: 14,
          fontFamily: "Lora_400Regular",
          fontSize: 17,
          lineHeight: 26,
          color: c.ink,
          textAlignVertical: "top",
        }}
      />

      {/* Голос: запись только для себя */}
      {rec.supported && (
        <Pressable
          onPress={toggleRecord}
          accessibilityRole="button"
          style={({ pressed }) => ({
            minHeight: 50,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: rec.recording ? c.brand : c.line,
            backgroundColor: rec.recording ? c.brandSoft : c.surface,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name={rec.recording ? "stop" : "mic"} size={18} color={rec.recording ? c.brandD : sk.video} />
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.ink }}>
            {rec.recording ? t.sessionX.sayStop : audioUri ? t.sessionX.sayRecorded : t.sessionX.sayRecord}
          </Text>
        </Pressable>
      )}
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, lineHeight: 16, color: c.muted }}>
        {t.sessionX.sayPrivate}
      </Text>

      <Pressable
        onPress={save}
        disabled={!canSave}
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 58,
          borderRadius: 16,
          backgroundColor: canSave ? c.brand : c.brandSoft,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pressed && canSave ? 0.98 : 1 }],
        })}
      >
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: canSave ? c.onBrand : c.brandD }}>
          {t.sessionX.saySave}
        </Text>
      </Pressable>
      <Pressable onPress={onDone} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, color: c.muted }}>
          {t.sessionX.saySkip}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* ---------- Завершение ---------- */

function Done({ count, known, onClose }: { count: number; known: number; onClose: () => void }) {
  const { c, sk } = useMarina();
  const { t } = useT();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: c.brandSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="checkmark" size={30} color={sk.words} />
      </View>
      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, color: c.ink, textAlign: "center" }}>
        {t.sessionX.doneTitle(count)}
      </Text>
      <Text
        style={{
          fontFamily: "GolosText_400Regular",
          fontSize: 14,
          lineHeight: 21,
          color: c.muted,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        {known > 0 ? t.sessionX.doneKnown(known) : ""}
        {t.sessionX.doneBody}
      </Text>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        style={({ pressed }) => ({
          alignSelf: "stretch",
          minHeight: 54,
          borderRadius: 16,
          backgroundColor: c.brand,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.onBrand }}>
          {t.sessionX.finish}
        </Text>
      </Pressable>
    </View>
  );
}
