import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { DRILL_LESSONS } from "@ie/core/data/pronunciationDrills";
import { AFFIRMATIONS } from "@ie/core/data/affirmations";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { useCalmMusic } from "@/lib/calm-music";
import { BotanicalFrame } from "@/components/botanical";
import { useMarina } from "@/theme";

// «3-минутка» — супер-короткий ритуал для метро/очереди/перед сном:
// 1) дыхание 4-2-6 (альфа-настройка, 4 круга) → 2) две живые фразы вслух
// (мини-shadowing: слушай → повтори в паузу → вместе) → 3) установка
// (суггестопедия: на родном, чтобы легла без сопротивления) + мягкий финал.
// Всё занимает ~3 минуты и поддерживает ежедневный ритуал без чувства вины.

type Stage = "breath" | "bridge" | "phrases" | "affirm";

const BREATH_CYCLES = 4;
const INHALE = 4000;
const HOLD = 2000;
const EXHALE = 6000;

function pickRandom<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

export default function ThreeMinutes() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("breath");
  const [done, setDone] = useState(false);
  const music = useCalmMusic();

  // Короткая практика целиком идёт в копилку shadowing-минут дня.
  useActivityTimer(done ? null : "shadowing");

  // Классика (барокко ≈60 уд/мин) ведёт весь ритуал: громче на дыхании,
  // тихо под голосом фраз — психорегуляция по Лозанову, не украшение.
  useEffect(() => {
    music.start(0.32);
    return () => music.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Единый «рубильник»: смена стадии/выход глушит все хвосты.
  const session = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const nextStage = useCallback(
    (s: Stage | "done") => {
      session.current++;
      clearTimer();
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (s === "done") {
        setDone(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setStage(s);
      }
    },
    [clearTimer]
  );
  useEffect(
    () => () => {
      session.current++;
      clearTimer();
    },
    [clearTimer]
  );

  const phrases = useMemo(
    () => pickRandom(DRILL_LESSONS.flatMap((l) => l.phrases), 2),
    []
  );
  const affirmation = useMemo(() => pickRandom(AFFIRMATIONS, 1)[0], []);

  function close() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      {/* Шапка: прогресс из трёх точек + выход */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {(["breath", "phrases", "affirm"] as Stage[]).map((s) => (
            <View
              key={s}
              style={{
                width: 24,
                height: 6,
                borderRadius: 3,
                backgroundColor: done || s === stage || (s === "breath" && stage !== "breath") || (s === "phrases" && stage === "affirm") ? sk.video : c.line,
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Закрыть"
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

      {!done && (stage === "breath" || stage === "bridge") && <BotanicalFrame />}

      {done ? (
        <Finale onClose={close} />
      ) : stage === "breath" ? (
        <Breath onDone={() => nextStage("bridge")} onSkip={() => nextStage("bridge")} />
      ) : stage === "bridge" ? (
        <Bridge
          onDone={() => {
            music.duck(0.12);
            nextStage("phrases");
          }}
        />
      ) : stage === "phrases" ? (
        <Phrases
          phrases={phrases}
          session={session}
          timer={timer}
          onDone={() => {
            music.duck(0.3);
            nextStage("affirm");
          }}
          onSkip={() => {
            music.duck(0.3);
            nextStage("affirm");
          }}
        />
      ) : (
        <Affirm text={affirmation} onDone={() => nextStage("done")} />
      )}
    </View>
  );
}

/* ---------- Стадия 1: дыхание 4-2-6 ---------- */

function Breath({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const { c, sk } = useMarina();
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [cycle, setCycle] = useState(1);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    let cyclesLeft = BREATH_CYCLES;
    const run = () => {
      if (!alive.current) return;
      setPhase("in");
      Animated.timing(scale, {
        toValue: 1.4,
        duration: INHALE,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (!alive.current) return;
        setPhase("hold");
        setTimeout(() => {
          if (!alive.current) return;
          setPhase("out");
          Animated.timing(scale, {
            toValue: 1,
            duration: EXHALE,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            if (!alive.current) return;
            cyclesLeft--;
            if (cyclesLeft <= 0) {
              onDone();
            } else {
              setCycle(BREATH_CYCLES - cyclesLeft + 1);
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

  const label = phase === "in" ? "Вдох…" : phase === "hold" ? "Задержи…" : "Выдох…";

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 28 }}>
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.muted }}>
        круг {cycle} из {BREATH_CYCLES}
      </Text>
      <Animated.View
        style={{
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: c.brandSoft,
          borderWidth: 2,
          borderColor: sk.video,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
        }}
      >
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 20, color: c.brandD }}>
          {label}
        </Text>
      </Animated.View>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          lineHeight: 21,
          color: c.muted,
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        Дыши вместе с кругом: вдох 4 — пауза 2 — выдох 6. Плечи вниз, лицо мягкое.
      </Text>
      <Pressable onPress={onSkip} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
          пропустить →
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Мягкий мост: дыхание → фразы, без резкого старта ---------- */

function Bridge({ onDone }: { onDone: () => void }) {
  const { c, sk } = useMarina();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", opacity: anim, gap: 12 }}>
      <Ionicons name="musical-notes" size={26} color={sk.video} />
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
        Хорошо. Теперь — две живые фразы.
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
        Просто слушай… и повторяй вслух в свою паузу. Музыка останется с тобой.
      </Text>
    </Animated.View>
  );
}

/* ---------- Стадия 2: две фразы вслух (мини-shadowing) ---------- */

function Phrases({
  phrases,
  session,
  timer,
  onDone,
  onSkip,
}: {
  phrases: { key: string; en: string; ru: string }[];
  session: React.MutableRefObject<number>;
  timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  onDone: () => void;
  onSkip: () => void;
}) {
  const { c, sk, radius } = useMarina();
  const [idx, setIdx] = useState(0);
  const [hint, setHint] = useState("Слушай…");
  const phrase = phrases[idx];

  useEffect(() => {
    const my = ++session.current;
    const pause = Math.max(1800, phrase.en.split(" ").length * 450);
    const guard = (fn: () => void) => () => {
      if (session.current === my) fn();
    };
    setHint("Слушай…");
    speakEnglish(phrase.en, {
      rate: 0.95,
      interrupt: true,
      onEnd: guard(() => {
        setHint("Теперь повтори вслух — в свою паузу");
        timer.current = setTimeout(
          guard(() => {
            setHint("Вместе, чуть медленнее");
            speakEnglish(phrase.en, {
              rate: 0.7,
              interrupt: true,
              onEnd: guard(() => {
                timer.current = setTimeout(
                  guard(() => {
                    if (idx + 1 < phrases.length) setIdx(idx + 1);
                    else onDone();
                  }),
                  pause
                );
              }),
              onError: guard(onDone),
            });
          }),
          pause
        );
      }),
      onError: guard(onDone),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.muted }}>
        фраза {idx + 1} из {phrases.length}
      </Text>
      <View
        style={{
          alignSelf: "stretch",
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          padding: 24,
          gap: 12,
        }}
      >
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 24, lineHeight: 33, color: c.ink }}>
          {phrase.en}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, color: c.muted }}>
          {phrase.ru}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="mic" size={16} color={sk.video} />
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: sk.video }}>
          {hint}
        </Text>
      </View>
      <Pressable onPress={onSkip} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
          пропустить →
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Стадия 3: установка ---------- */

function Affirm({ text, onDone }: { text: { ru: string; en: string }; onDone: () => void }) {
  const { c, radius } = useMarina();
  useEffect(() => {
    const t = setTimeout(onDone, 9000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <View
        style={{
          alignSelf: "stretch",
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          padding: 28,
          gap: 12,
        }}
      >
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 24, lineHeight: 34, color: c.ink, textAlign: "center" }}>
          {text.ru}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center" }}>
          {text.en}
        </Text>
      </View>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
        Просто побудь с этой мыслью…
      </Text>
      <Pressable onPress={onDone} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
          дальше →
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- Финал ---------- */

function Finale({ onClose }: { onClose: () => void }) {
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
        <Ionicons name="checkmark" size={30} color={sk.video} />
      </View>
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 24, color: c.ink, textAlign: "center" }}>
        Три минуты — твои
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          lineHeight: 21,
          color: c.muted,
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        Маленький шаг сделан, ритуал жив. Английский любит регулярность больше, чем подвиги.
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
          Готово
        </Text>
      </Pressable>
    </View>
  );
}
