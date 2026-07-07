import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getLevelPack } from "@ie/core/data/levelVocab";
import { translate, type Word } from "@ie/core/data/packs";
import { AFFIRMATIONS } from "@ie/core/data/affirmations";
import { usePrefs } from "@ie/core/prefs";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { useCalmMusic } from "@/lib/calm-music";
import { useMarina } from "@/theme";

// Сеанс дня — мобильный киносеанс по Петрусинскому. Ядро метода — ВАЛ:
// «массивное введение информации — не мелкими блоками, а большими массивами»
// (01_research §2). Логика: настройка (психорегуляция: дыхание + классика
// ≈60 уд/мин + установки) → перегрузка массивом (сотни слов, темп вплоть до
// субцептивного) → узнавание придёт в повторах. Ничего не «учим» специально.

type Phase = "attune" | "bridge" | "flow" | "done";

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

  const pack = useMemo(() => getLevelPack(levelPackId(prefs?.level))!, [prefs?.level]);
  const words = pack.words;

  const [phase, setPhase] = useState<Phase>("attune");
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [tempoIdx, setTempoIdx] = useState(0);

  // Реальные минуты киносеанса → шаг «Сеанс дня» в плане.
  useActivityTimer(phase === "flow" && running ? "flash" : null);

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
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>
          {phase === "attune" || phase === "bridge"
            ? "Настройка"
            : phase === "flow"
              ? pack.title
              : "Сеанс завершён"}
        </Text>
        <Pressable
          onPress={leave}
          accessibilityRole="button"
          accessibilityLabel="Выйти из сеанса"
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
            music.duck(0.14);
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
          onFinish={() => {
            music.duck(0.3);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPhase("done");
          }}
        />
      )}

      {phase === "done" && <Done count={words.length} onClose={leave} />}
    </View>
  );
}

/* ---------- Настройка: дыхание под классику + установки ---------- */

function Attune({ onDone }: { onDone: () => void }) {
  const { c, sk } = useMarina();
  const scale = useRef(new Animated.Value(1)).current;
  const [label, setLabel] = useState("Вдох…");
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
      setLabel("Вдох…");
      Animated.timing(scale, { toValue: 1.4, duration: INHALE, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
        if (!alive.current) return;
        setLabel("Задержи…");
        setTimeout(() => {
          if (!alive.current) return;
          setLabel("Выдох…");
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
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 26 }}>
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.muted }}>
        круг {cycle} из {BREATH_CYCLES} · музыка ведёт
      </Text>
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
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 19, color: c.brandD }}>
          {label}
        </Text>
      </Animated.View>
      <View style={{ gap: 6, alignItems: "center", minHeight: 70 }}>
        <Text
          style={{
            fontFamily: "Nunito_700Bold",
            fontSize: 17,
            lineHeight: 25,
            color: c.ink,
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          {aff.ru}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted, textAlign: "center" }}>
          {aff.en}
        </Text>
      </View>
      <Pressable onPress={onDone} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
          я готова →
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Мягкий мост: без резких переходов (метод: без стресса) ---------- */

function Bridge({ onDone }: { onDone: () => void }) {
  const { c } = useMarina();
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
          fontFamily: "Nunito_700Bold",
          fontSize: 18,
          lineHeight: 27,
          color: c.ink,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        Сейчас через тебя пойдёт поток слов.
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          lineHeight: 21,
          color: c.muted,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        Ничего не запоминай специально. Просто смотри и слушай — как кино. Узнавание придёт
        само.
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
  onFinish: () => void;
}) {
  const { c, sk, radius } = useMarina();
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

  return (
    <View style={{ flex: 1, gap: 14, paddingTop: 12 }}>
      {/* Прогресс массива */}
      <View style={{ gap: 6 }}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.line, overflow: "hidden" }}>
          <View style={{ width: `${pct}%`, height: 6, backgroundColor: sk.words }} />
        </View>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 12,
            color: c.muted,
            fontVariant: ["tabular-nums"],
            textAlign: "right",
          }}
        >
          {idx + 1} / {words.length} слов
        </Text>
      </View>

      {/* Кадр киносеанса */}
      <View
        style={{
          flex: 1,
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 10,
        }}
      >
        <Text
          style={{
            fontFamily: "Nunito_800ExtraBold",
            fontSize: 42,
            lineHeight: 50,
            color: c.ink,
            textAlign: "center",
          }}
        >
          {w.en}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 15, color: c.muted }}>{w.ipa}</Text>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 19,
            lineHeight: 26,
            color: c.brandD,
            textAlign: "center",
          }}
        >
          {tr.text}
        </Text>
      </View>

      {/* Темп */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {TEMPOS.map((t, i) => {
          const on = i === tempoIdx;
          return (
            <Pressable
              key={t.id}
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
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  color: on ? c.onBrand : c.ink,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16, color: c.muted, textAlign: "center" }}>
        «Вал» быстрее сознания — так и задумано: массив ложится в узнавание.
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
        <Ionicons name={running ? "pause" : "play"} size={18} color={running ? c.ink : "#ffffff"} />
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: running ? c.ink : "#ffffff"}}>
          {running ? "Пауза" : idx === 0 ? "Поехали" : "Продолжить"}
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Завершение ---------- */

function Done({ count, onClose }: { count: number; onClose: () => void }) {
  const { c, sk } = useMarina();
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
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 24, color: c.ink, textAlign: "center" }}>
        Через тебя прошло {count} слов
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          lineHeight: 21,
          color: c.muted,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        Сознание и не должно было их выучить. Массив лёг в узнавание — слова начнут
        всплывать сами: в текстах, в видео, в повторах. Так работает метод.
      </Text>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        style={({ pressed }) => ({
          alignSelf: "stretch",
          minHeight: 54,
          borderRadius: 16,
          backgroundColor: c.accent,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#ffffff" }}>
          Завершить
        </Text>
      </Pressable>
    </View>
  );
}
