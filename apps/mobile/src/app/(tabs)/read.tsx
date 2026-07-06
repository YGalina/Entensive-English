import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { STORIES, type Story } from "@ie/core/data/reading";
import { useActivityTimer } from "@ie/core/timelog";
import { recordWpm, useWpmStats } from "@ie/core/wpm";
import { nowMs } from "@ie/core/now";
import { useMarina } from "@/theme";

// «Читать» — массив текста потоком, не по слову. Замер WPM — главный
// измеримый KPI метода (у Петрусинского скорость чтения ×2,5 за 2 недели).
// Перевод — вторичный слой: по желанию, не перебивая поток.

const GENRE: Record<Story["genre"], string> = {
  fable: "басня",
  fantasy: "фэнтези",
  humor: "юмор",
  classic: "классика",
};

function wordCount(s: Story): number {
  return s.paras.reduce((a, p) => a + p.en.split(/\s+/).filter(Boolean).length, 0);
}

export default function ReadScreen() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const tone = sk.reading;
  const wpmStats = useWpmStats();

  const [storyId, setStoryId] = useState<string | null>(null);
  const [showRu, setShowRu] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [resultWpm, setResultWpm] = useState<number | null>(null);

  const story = useMemo(() => STORIES.find((s) => s.id === storyId) ?? null, [storyId]);
  const words = story ? wordCount(story) : 0;
  const reading = !!story && startedAt !== null && resultWpm === null;

  // Минуты чтения идут в план дня только пока реально читаем на этом экране.
  useActivityTimer(focused && reading ? "reading" : null);

  const scrollRef = useRef<ScrollView | null>(null);

  function openStory(id: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStoryId(id);
    setShowRu(false);
    setResultWpm(null);
    setStartedAt(nowMs());
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function finish() {
    if (!story || startedAt === null) return;
    const elapsedSec = (nowMs() - startedAt) / 1000;
    const wpm = Math.round((words / Math.max(1, elapsedSec)) * 60);
    // Фильтры мусора (короткая сессия, нереальный темп) — внутри recordWpm.
    recordWpm(wpm, words, elapsedSec);
    setResultWpm(wpm);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function backToList() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStoryId(null);
    setStartedAt(null);
    setResultWpm(null);
  }

  // Ушла с экрана посреди чтения — замер не засчитываем (без штрафов, просто честно).
  useEffect(() => {
    if (!focused && reading) setStartedAt(nowMs());
  }, [focused, reading]);

  /* ---------- Экран чтения ---------- */
  if (story) {
    return (
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 12,
          paddingBottom: 32,
          gap: 14,
        }}
      >
        <Pressable
          onPress={backToList}
          accessibilityRole="button"
          accessibilityLabel="К списку текстов"
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            minHeight: 44,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="chevron-back" size={18} color={c.muted} />
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>
            к текстам
          </Text>
        </Pressable>

        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 26, lineHeight: 32, color: c.ink }}>
            {story.title}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
            {story.author} · {words} слов · {GENRE[story.genre]} · {story.level.toUpperCase()}
          </Text>
        </View>

        {resultWpm === null ? (
          <>
            {/* Текст: читаем потоком, глазами вперёд, не застревая */}
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: c.line,
                padding: 20,
                gap: 16,
              }}
            >
              {story.paras.map((p, i) => (
                <View key={i} style={{ gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 17,
                      lineHeight: 27,
                      color: c.ink,
                    }}
                  >
                    {p.en}
                  </Text>
                  {showRu && p.ru ? (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        lineHeight: 21,
                        color: c.muted,
                      }}
                    >
                      {p.ru}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowRu((v) => !v);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({
                minHeight: 48,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: c.line,
                backgroundColor: showRu ? c.brandSoft : c.surface,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Ionicons name="language" size={16} color={c.brandD} />
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.brandD }}>
                {showRu ? "скрыть перевод" : "показать перевод"}
              </Text>
            </Pressable>

            <Pressable
              onPress={finish}
              accessibilityRole="button"
              style={({ pressed }) => ({
                minHeight: 56,
                borderRadius: 16,
                backgroundColor: c.accent,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Ionicons name="checkmark" size={18} color="#ffffff" />
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#ffffff" }}>
                Дочитала
              </Text>
            </Pressable>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                lineHeight: 18,
                color: c.muted,
                textAlign: "center",
              }}
            >
              Читай потоком, не застревая на словах. Жми, когда дочитаешь, — посчитаем твою
              скорость.
            </Text>
          </>
        ) : (
          /* ---------- Результат ---------- */
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: c.line,
              padding: 24,
              gap: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: c.brandSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="speedometer" size={26} color={tone} />
            </View>
            <Text
              style={{
                fontFamily: "Nunito_800ExtraBold",
                fontSize: 40,
                color: tone,
                fontVariant: ["tabular-nums"],
              }}
            >
              {resultWpm}
            </Text>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>
              слов в минуту
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                lineHeight: 20,
                color: c.muted,
                textAlign: "center",
              }}
            >
              {resultWpm >= 200
                ? "Темп носителя — блестяще!"
                : resultWpm >= 140
                  ? "Отличный рабочий темп. Скорость растёт с каждым текстом."
                  : "Хорошее начало. Метод разгонит темп сам — просто читай каждый день."}
              {wpmStats.best && resultWpm >= wpmStats.best ? " Это твой рекорд 🎉" : ""}
            </Text>
            <Pressable
              onPress={backToList}
              accessibilityRole="button"
              style={({ pressed }) => ({
                alignSelf: "stretch",
                minHeight: 52,
                borderRadius: 16,
                backgroundColor: c.accent,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 6,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#ffffff" }}>
                Ещё текст
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  }

  /* ---------- Список текстов ---------- */
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 12,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.ink }}>
          Читать
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
          Массив текста потоком, не по слову. В конце — твоя скорость чтения.
          {wpmStats.last ? ` Последний замер: ${wpmStats.last} WPM.` : ""}
        </Text>
      </View>

      {STORIES.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => openStory(s.id)}
          accessibilityRole="button"
          accessibilityLabel={`${s.title}, ${s.author}, уровень ${s.level.toUpperCase()}`}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: pressed ? c.brandSoft : c.surface,
            borderRadius: radius.soft,
            borderWidth: 1,
            borderColor: c.line,
            padding: 14,
            minHeight: 64,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: c.brandSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 12, color: tone }}>
              {s.level.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>
              {s.title}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
              {s.author} · {wordCount(s)} слов · {GENRE[s.genre]}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}
