import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  DRILL_LESSONS,
  TEMPO_STEPS,
  type TempoStepId,
} from "@ie/core/data/pronunciationDrills";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// Постановка звука по Шестову — мобильный тренажёр. Протокол тот же, что на
// web (методичка, стр. 7): НЕ отдельные слова, а ключевое слово в живой фразе,
// лестница темпа: слушай → сверхмедленно по словам → вместе → носитель.
// Автопоток гоняет все 4 шага с паузами на повтор, минимум 3 круга на фразу.

/** Иконка роли шага: молчу-слушаю / повторяю за словом / говорю вместе / синхронно. */
const STEP_ICON: Record<TempoStepId, string> = {
  listen: "ear",
  ultra: "footsteps",
  slow: "people",
  native: "flash",
};

function repeatPause(text: string, stepId: TempoStepId): number {
  return stepId === "listen" ? 900 : Math.max(1500, text.split(" ").length * 420);
}

/** Ключевое слово подсвечивается в фразе сигнальным цветом навыка. */
function PhraseText({ en, keyWord, color, tone }: { en: string; keyWord: string; color: string; tone: string }) {
  const parts = en.split(new RegExp(`(${keyWord})`, "i"));
  return (
    <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, lineHeight: 33, color }}>
      {parts.map((p, i) =>
        p.toLowerCase() === keyWord.toLowerCase() ? (
          <Text key={i} style={{ color: tone }}>
            {p}
          </Text>
        ) : (
          <Text key={i}>{p}</Text>
        )
      )}
    </Text>
  );
}

export default function SoundsScreen() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const { t, lang } = useT();

  const [li, setLi] = useState(0);
  const [pi, setPi] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const lesson = DRILL_LESSONS[li];
  const phrase = lesson.phrases[pi];
  const tone = sk.sounds;

  // Реальные минуты практики → шаг «Постановка звука» в плане дня.
  useActivityTimer(focused && (auto || speaking) ? "pronunciation" : null);

  // Сессионный счётчик отменяет «хвосты» прежних запусков (как на web).
  const session = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const stopAll = useCallback(() => {
    session.current++;
    clearTimer();
    setSpeaking(false);
    setAuto(false);
  }, [clearTimer]);

  // Уход с экрана/размонтирование — полная тишина.
  useEffect(() => {
    if (!focused) stopAll();
  }, [focused, stopAll]);
  useEffect(() => stopAll, [stopAll]);

  const playStep = useCallback(
    (text: string, idx: number, done?: () => void) => {
      const s = TEMPO_STEPS[idx];
      const my = ++session.current;
      clearTimer();
      setSpeaking(true);
      const finish = () => {
        if (session.current !== my) return;
        setSpeaking(false);
        done?.();
      };
      if (s.wordByWord) {
        const words = text.split(/\s+/).filter(Boolean);
        let w = 0;
        const next = () => {
          if (session.current !== my) return;
          if (w >= words.length) {
            finish();
            return;
          }
          const word = words[w++];
          speakEnglish(word, {
            rate: s.rate,
            interrupt: true,
            onEnd: () => {
              timer.current = setTimeout(next, 320);
            },
            onError: () => {
              timer.current = setTimeout(next, 320);
            },
          });
        };
        next();
      } else {
        speakEnglish(text, { rate: s.rate, interrupt: true, onEnd: finish, onError: finish });
      }
    },
    [clearTimer]
  );

  /** Автопоток: шаги 1→4 с паузами на повтор, затем следующая фраза. */
  const runAuto = useCallback(
    (lessonIdx: number, phraseIdx: number, idx: number) => {
      const ph = DRILL_LESSONS[lessonIdx].phrases[phraseIdx];
      setStepIdx(idx);
      playStep(ph.en, idx, () => {
        const my = session.current;
        timer.current = setTimeout(() => {
          if (session.current !== my) return;
          if (idx + 1 < TEMPO_STEPS.length) {
            runAuto(lessonIdx, phraseIdx, idx + 1);
          } else {
            const nextP = (phraseIdx + 1) % DRILL_LESSONS[lessonIdx].phrases.length;
            setPi(nextP);
            runAuto(lessonIdx, nextP, 0);
          }
        }, repeatPause(ph.en, TEMPO_STEPS[idx].id));
      });
    },
    [playStep]
  );

  function toggleAuto() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (auto) {
      stopAll();
      return;
    }
    setAuto(true);
    runAuto(li, pi, 0);
  }

  function tapStep(idx: number) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAuto(false);
    session.current++;
    clearTimer();
    setStepIdx(idx);
    playStep(phrase.en, idx);
  }

  function pickLesson(idx: number) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopAll();
    setLi(idx);
    setPi(0);
    setStepIdx(0);
  }

  function pickPhrase(delta: number) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopAll();
    setPi((p) => (p + delta + lesson.phrases.length) % lesson.phrases.length);
    setStepIdx(0);
  }

  const step = TEMPO_STEPS[stepIdx];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 14,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 30, color: c.ink }}>
          {t.soundsX.title}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
          {t.sounds.intro}
        </Text>
      </View>

      {/* Уроки */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {DRILL_LESSONS.map((l, idx) => {
          const on = idx === li;
          return (
            <Pressable
              key={l.id}
              onPress={() => pickLesson(idx)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => ({
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: 22,
                borderWidth: 1,
                justifyContent: "center",
                borderColor: on ? tone : c.line,
                backgroundColor: on ? tone : c.surface,
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
                {lang === "en" ? l.titleEn : l.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Карточка фразы */}
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          padding: 20,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: tone, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {t.soundsX.keyWord} · {phrase.key}
          </Text>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: c.muted, fontVariant: ["tabular-nums"] }}>
            {pi + 1} / {lesson.phrases.length}
          </Text>
        </View>

        <PhraseText en={phrase.en} keyWord={phrase.key} color={c.ink} tone={tone} />
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 20, color: c.muted }}>
          {phrase.ru}
        </Text>

        {/* Лестница темпа */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {TEMPO_STEPS.map((s, idx) => {
            const on = idx === stepIdx;
            return (
              <Pressable
                key={s.id}
                onPress={() => tapStep(idx)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={({ pressed }) => ({
                  minHeight: 44,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  justifyContent: "center",
                  borderColor: on ? tone : c.line,
                  backgroundColor: on ? (speaking || auto ? tone : c.brandSoft) : c.surface,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text
                  style={{
                    fontFamily: "GolosText_600SemiBold",
                    fontSize: 12,
                    color: on ? (speaking || auto ? c.onBrand : c.brandD) : c.muted,
                  }}
                >
                  {t.soundsX.steps[s.id].label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {/* Роль шага — заметно, а не мелким серым: в 1 и 4 звук одинаков,
            меняется именно роль (слушаю → говорю синхронно) */}
        <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: c.brandSoft, borderRadius: 12, padding: 12 }}>
          <Ionicons name={STEP_ICON[step.id] as never} size={18} color={tone} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontFamily: "GolosText_600SemiBold", fontSize: 13, lineHeight: 19, color: c.brandInk }}>
            {t.soundsX.steps[step.id].hint}
          </Text>
        </View>
      </View>

      {/* Управление */}
      <Pressable
        onPress={toggleAuto}
        accessibilityRole="button"
        accessibilityLabel={auto ? t.soundsX.autoA11yOff : t.soundsX.autoA11yOn}
        style={({ pressed }) => ({
          minHeight: 56,
          borderRadius: 16,
          backgroundColor: auto ? c.surface : c.accent,
          borderWidth: auto ? 1 : 0,
          borderColor: c.line,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name={auto ? "stop" : "play"} size={18} color={auto ? c.ink : c.onBrand} />
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: auto ? c.ink : c.onBrand }}>
          {auto ? t.soundsX.stop : t.soundsX.auto}
        </Text>
      </Pressable>
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 18, color: c.muted, textAlign: "center" }}>
        {t.soundsX.autoHint}
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={() => pickPhrase(-1)}
          accessibilityRole="button"
          accessibilityLabel={t.soundsX.prev}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 48,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 6,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Ionicons name="arrow-back" size={16} color={c.muted} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.muted }}>{t.soundsX.prev}</Text>
        </Pressable>
        <Pressable
          onPress={() => pickPhrase(1)}
          accessibilityRole="button"
          accessibilityLabel={t.soundsX.next}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 48,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 6,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.muted }}>{t.soundsX.next}</Text>
          <Ionicons name="arrow-forward" size={16} color={c.muted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}
