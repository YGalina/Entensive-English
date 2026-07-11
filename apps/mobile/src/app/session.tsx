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

// Сессия дня — ОДИН флоу 4 фаз (13_app_logic §3.2), визуально 1:1 по макетам
// Экраны-v2 «СЕССИЯ · ПОТОК СЛОВ / КОНТЕКСТ / СКАЗАТЬ СВОЁ»:
//   1 настройка (дыхание + классика + установки — снятие барьера)
//   2 поток слов (карточка Lora 44, пример с амбер-маркером, Ещё нет/Знаю)
//   3 контекст (сплошной отрывок Lora, тап по слову → слой перевода снизу)
//   4 сказать своё (вопрос дня, белые Lora-чипы, голос/текст → артефакт)
// Полоски фаз в шапке: терракота · мята · охра · петроль.

type Phase = "attune" | "bridge" | "flow" | "context" | "say" | "done";

/** Сколько полосок фаз закрашено. */
const PHASE_NO: Record<Phase, number> = {
  attune: 1,
  bridge: 1,
  flow: 2,
  context: 3,
  say: 4,
  done: 4,
};

const BREATH_CYCLES = 3;
const INHALE = 4000;
const HOLD = 2000;
const EXHALE = 6000;

/** Темпы киносеанса. «Вал» — предъявление быстрее сознательного чтения. */
const TEMPOS = [
  { id: "calm", ms: 2400, tts: true },
  { id: "fast", ms: 1100, tts: false },
  { id: "wave", ms: 450, tts: false },
] as const;

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

export default function SessionScreen() {
  const { c, sk } = useMarina();
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

  // Цвета полосок фаз — по макету: терракота · мята · охра · петроль.
  const phaseColors = [c.brand, c.accent, sk.sounds, sk.video];
  const filled = PHASE_NO[phase];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        paddingHorizontal: 30,
        paddingTop: insets.top + 14,
        paddingBottom: insets.bottom + 12,
      }}
    >
      {/* Шапка: полоски фаз (+ счётчик слов в потоке) и выход */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7 }}>
          {phaseColors.map((col, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 6,
                backgroundColor: i < filled ? col : c.brandSoft,
              }}
            />
          ))}
          {phase === "flow" && (
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.muted, opacity: 0.85, marginLeft: 4, fontVariant: ["tabular-nums"] }}>
              {idx + 1}/{words.length}
            </Text>
          )}
        </View>
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
  const { c } = useMarina();
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
        <Text style={{ fontFamily: "Lora_400Regular", fontStyle: "italic", fontSize: 13, color: c.muted, textAlign: "center" }}>
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

/* ---------- Фаза 2 · Поток слов (макет: карточка Lora 44, пример с маркером) ---------- */

/** Английская фраза с амбер-маркером целевого слова (как в макете). */
function HighlightedExample({
  text,
  target,
  size = 15,
  line = 23,
}: {
  text: string;
  target: string;
  size?: number;
  line?: number;
}) {
  const { c } = useMarina();
  const i = text.toLowerCase().indexOf(target.toLowerCase());
  return (
    <Text
      style={{
        fontFamily: "Lora_400Regular",
        fontStyle: "italic",
        fontSize: size,
        lineHeight: line,
        color: c.muted,
        textAlign: "center",
      }}
    >
      {i >= 0 ? (
        <>
          {text.slice(0, i)}
          <Text style={{ fontStyle: "normal", fontFamily: "Lora_500Medium", backgroundColor: c.amber, color: "#3b2c07" }}>
            {text.slice(i, i + target.length)}
          </Text>
          {text.slice(i + target.length)}
        </>
      ) : (
        text
      )}
    </Text>
  );
}

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
  const { c, sk } = useMarina();
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

  function toggle() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning(!running);
  }

  function cycleTempo() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempoIdx((tempoIdx + 1) % TEMPOS.length);
  }

  // «Знаю»: узнавание прямо в потоке — слово уходит в SRS (Good) и в
  // счётчик «слов в узнавании». Поток НЕ останавливается: метод любит ритм.
  function markKnown() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordAnswer(packId, w.en, true);
    onKnown();
  }

  return (
    <View style={{ flex: 1, gap: 18, paddingTop: 8 }}>
      {/* Карточка слова — макет: radius 28, Lora 44, перевод терракотой */}
      <Pressable
        onPress={() => speakEnglish(w.en, { interrupt: true, rate: 1.0 })}
        accessibilityRole="button"
        accessibilityLabel={w.en}
        style={{
          flex: 1,
          backgroundColor: c.surface,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
          paddingVertical: 36,
          shadowColor: "#3c280f",
          shadowOpacity: 0.26,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 14 },
          elevation: 6,
        }}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontFamily: "Lora_500Medium",
            fontSize: 44,
            lineHeight: 54,
            letterSpacing: -0.4,
            color: c.ink,
            textAlign: "center",
          }}
        >
          {w.en}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 16, color: c.muted, opacity: 0.75, marginTop: 8 }}>
          {w.ipa}
        </Text>
        <Text
          style={{
            fontFamily: "GolosText_500Medium",
            fontSize: 23,
            lineHeight: 30,
            color: c.brand,
            textAlign: "center",
            marginTop: 14,
          }}
        >
          {tr.text}
        </Text>
        {/* Аудиоволна — охра навыка «слух», приглашение прослушать */}
        <View style={{ flexDirection: "row", gap: 4, alignItems: "flex-end", height: 26, marginTop: 22 }}>
          {[11, 22, 15, 26, 9, 18, 12].map((hh, i) => (
            <View key={i} style={{ width: 5, height: hh, borderRadius: 2, backgroundColor: sk.sounds }} />
          ))}
        </View>
        {w.exEn && (
          <View style={{ marginTop: 22, maxWidth: 300 }}>
            <HighlightedExample text={`“${w.exEn}”`} target={w.en} size={16} line={24} />
          </View>
        )}
      </Pressable>

      {/* «Ещё нет / Знаю» — узнавание прямо в потоке, ритм не останавливаем */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIdx((i) => (i + 1 >= words.length ? i : i + 1));
          }}
          accessibilityRole="button"
          accessibilityLabel={t.sessionX.notYet}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 56,
            borderRadius: 16,
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#3c280f",
            shadowOpacity: 0.14,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            elevation: 2,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 16, color: c.muted }}>
            {t.sessionX.notYet}
          </Text>
        </Pressable>
        <Pressable
          onPress={markKnown}
          accessibilityRole="button"
          accessibilityLabel={t.sessionX.knowA11y(w.en)}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 56,
            borderRadius: 16,
            backgroundColor: c.accent,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: c.accent,
            shadowOpacity: 0.4,
            shadowRadius: 13,
            shadowOffset: { width: 0, height: 7 },
            elevation: 3,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 16, color: c.onBrand }}>
            {t.sessionX.know}
          </Text>
        </Pressable>
      </View>

      {/* Футер — макет: «темп 0,5 сек · Пауза». Тап по темпу листает режимы */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4, paddingBottom: 4 }}>
        <Pressable onPress={cycleTempo} accessibilityRole="button" hitSlop={8} style={{ minHeight: 44, justifyContent: "center" }}>
          <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 14, color: c.muted, opacity: 0.8 }}>
            {t.sessionX.tempoLine(t.sessionX.tempos[tempo.id])}
            {knownCount > 0 ? `   ·   ${t.sessionX.knownN(knownCount)}` : ""}
          </Text>
        </Pressable>
        <Pressable onPress={toggle} accessibilityRole="button" hitSlop={8} style={{ minHeight: 44, justifyContent: "center" }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: running ? c.muted : c.brand }}>
            {running ? t.sessionX.pause : idx === 0 ? t.sessionX.go : t.sessionX.resume}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Фаза 3 · Контекст: сплошной отрывок, тап = слой перевода ---------- */

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

  const newCount = items.filter((w) => !known.has(w.en.toLowerCase())).length;
  const knownCount = items.length - newCount;

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
    <View style={{ flex: 1, marginHorizontal: -30 }}>
      {/* Кикер фазы — мята, как в макете */}
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", color: c.accent, paddingHorizontal: 30, paddingTop: 20 }}>
        {t.sessionX.ctxPhase}
      </Text>

      {/* Сплошной живой отрывок: амбер = новое, мятное подчёркивание = знакомое */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 30, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontFamily: "Lora_400Regular", fontSize: 21, lineHeight: 37, color: c.ink }}>
          {items.map((w, i) => {
            const ex = w.exEn as string;
            const at = ex.toLowerCase().indexOf(w.en.toLowerCase());
            const isKnown = known.has(w.en.toLowerCase());
            const isSel = selected?.en === w.en;
            return (
              <Text key={w.en}>
                {i > 0 ? "  " : ""}
                {at >= 0 ? (
                  <>
                    {ex.slice(0, at)}
                    <Text
                      onPress={() => openWord(w)}
                      suppressHighlighting
                      style={
                        isKnown
                          ? {
                              textDecorationLine: "underline",
                              textDecorationColor: c.accent,
                              color: c.ink,
                              backgroundColor: isSel ? c.brandSoft : "transparent",
                            }
                          : { backgroundColor: c.amber, color: "#3b2c07" }
                      }
                    >
                      {ex.slice(at, at + w.en.length)}
                    </Text>
                    {ex.slice(at + w.en.length)}
                  </>
                ) : (
                  <Text onPress={() => openWord(w)} suppressHighlighting>
                    {ex}
                  </Text>
                )}
              </Text>
            );
          })}
        </Text>

        {/* Легенда маркировки */}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.brand }}>
            ■ {t.sessionX.ctxNew(newCount)}
          </Text>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.accent }}>
            — {t.sessionX.ctxKnown(knownCount)}
          </Text>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.muted, opacity: 0.8 }}>
            {t.sessionX.ctxTap}
          </Text>
        </View>

        {!selected && (
          <Pressable
            onPress={onDone}
            accessibilityRole="button"
            style={({ pressed }) => ({
              marginTop: 24,
              minHeight: 58,
              borderRadius: 18,
              backgroundColor: c.brand,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: c.brand,
              shadowOpacity: 0.45,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 4,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.onBrand }}>
              {t.sessionX.ctxNext}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Слой перевода снизу — макет: ручка, Lora 28, чернильная кнопка */}
      {selected && selTr && (
        <View
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: 30,
            paddingTop: 20,
            paddingBottom: 26,
            shadowColor: "#3c280f",
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -10 },
            elevation: 10,
          }}
        >
          <Pressable onPress={() => setSelected(null)} accessibilityRole="button" accessibilityLabel={t.readX.sheetClose} hitSlop={12}>
            <View style={{ width: 44, height: 5, borderRadius: 5, backgroundColor: c.line, alignSelf: "center", marginBottom: 16 }} />
          </Pressable>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontFamily: "Lora_500Medium", fontSize: 28, color: c.ink }}>
              {selected.en}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, opacity: 0.75 }}>
              {selected.ipa}
            </Text>
          </View>
          <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 18, color: c.brand, marginTop: 6 }}>
            {selTr.text}
          </Text>
          {selected.exEn && (
            <Text style={{ fontFamily: "Lora_400Regular", fontStyle: "italic", fontSize: 16, lineHeight: 24, color: c.muted, marginTop: 12 }}>
              “{selected.exEn}”
            </Text>
          )}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
            <Pressable
              onPress={() => speakEnglish(selected.exEn ?? selected.en, { interrupt: true, rate: 0.95 })}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 50,
                borderRadius: 14,
                backgroundColor: c.brandSoft,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 15, color: c.brandInk }}>
                {t.sessionX.ctxListen}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => addToVocab(selected)}
              disabled={added.has(selected.en)}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 50,
                borderRadius: 14,
                backgroundColor: added.has(selected.en) ? c.accent : c.ink,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 15, color: added.has(selected.en) ? c.onBrand : c.bg }}>
                {added.has(selected.en) ? t.sessionX.ctxAdded : t.sessionX.ctxAdd}
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={onDone}
            accessibilityRole="button"
            style={({ pressed }) => ({
              marginTop: 12,
              minHeight: 52,
              borderRadius: 16,
              backgroundColor: c.brand,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15.5, color: c.onBrand }}>
              {t.sessionX.ctxNext}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ---------- Фаза 4 · Сказать своё — макет: петроль-кикер, белые Lora-чипы ---------- */

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
      contentContainerStyle={{ paddingTop: 20, gap: 0, paddingBottom: 24, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Кикер фазы — петроль «речь», как в макете */}
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", color: sk.video }}>
        {t.sessionX.sayPhase}
      </Text>
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 27, lineHeight: 33, letterSpacing: -0.5, color: c.ink, marginTop: 10 }}>
        {lang === "en" ? q.en : q.ru}
      </Text>
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.muted, opacity: 0.9, marginTop: 11 }}>
        {t.sessionX.sayHint}
      </Text>

      {/* Чипы-опоры: белые, Lora — слово как предмет (макет) */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 22 }}>
        {chips.map((w) => (
          <Pressable
            key={w}
            onPress={() => insertChip(w)}
            accessibilityRole="button"
            accessibilityLabel={t.sessionX.sayChipA11y(w)}
            style={({ pressed }) => ({
              paddingHorizontal: 15,
              minHeight: 40,
              justifyContent: "center",
              borderRadius: 22,
              backgroundColor: c.surface,
              shadowColor: "#3c280f",
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ fontFamily: "Lora_500Medium", fontSize: 16, color: c.ink }}>{w}</Text>
          </Pressable>
        ))}
      </View>

      {/* Поле — белая карточка, пишем Lora (голос языка) */}
      <View
        style={{
          flex: 1,
          minHeight: 150,
          backgroundColor: c.surface,
          borderRadius: 22,
          padding: 22,
          marginTop: 22,
          shadowColor: "#3c280f",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder={t.sessionX.sayPlaceholder}
          placeholderTextColor={c.muted}
          style={{
            flex: 1,
            fontFamily: "Lora_400Regular",
            fontSize: 18,
            lineHeight: 30,
            color: c.ink,
            textAlignVertical: "top",
          }}
        />
      </View>

      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 17, color: c.muted, opacity: 0.7, marginTop: 10 }}>
        {t.sessionX.sayPrivate}
      </Text>

      {/* Микрофон-квадрат + терракотовый CTA — как в макете */}
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center", marginTop: 14 }}>
        {rec.supported && (
          <Pressable
            onPress={toggleRecord}
            accessibilityRole="button"
            accessibilityLabel={rec.recording ? t.sessionX.sayStop : t.sessionX.sayRecord}
            style={({ pressed }) => ({
              width: 60,
              height: 60,
              borderRadius: 20,
              backgroundColor: rec.recording ? c.brandSoft : c.surface,
              borderWidth: rec.recording ? 1.5 : 0,
              borderColor: c.brand,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#3c280f",
              shadowOpacity: 0.16,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 5 },
              elevation: 2,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Ionicons
              name={rec.recording ? "stop" : audioUri ? "checkmark" : "mic"}
              size={22}
              color={rec.recording ? c.brandD : audioUri ? c.accent : sk.video}
            />
          </Pressable>
        )}
        <Pressable
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 60,
            borderRadius: 18,
            backgroundColor: canSave ? c.brand : c.brandSoft,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: c.brand,
            shadowOpacity: canSave ? 0.45 : 0,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: canSave ? 4 : 0,
            transform: [{ scale: pressed && canSave ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: canSave ? c.onBrand : c.brandInk }}>
            {t.sessionX.saySave}
          </Text>
        </Pressable>
      </View>
      <Pressable onPress={onDone} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center", alignItems: "center", marginTop: 4 }}>
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
