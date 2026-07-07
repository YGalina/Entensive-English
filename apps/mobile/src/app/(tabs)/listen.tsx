import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { YouTube, type YouTubeHandle } from "@/components/youtube";
import {
  SHADOWING,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type ShadowScript,
} from "@ie/core/data/shadowing";
import { useActivityTimer } from "@ie/core/timelog";
import { useMarina } from "@/theme";

// Shadowing: смотришь живого носителя и ПОВТОРЯЕШЬ ВСЛУХ. Видео закреплено
// сверху (не уезжает), активная строка подсвечивается сама по таймингам
// субтитров (караоке) и список сам подъезжает к ней — листать не нужно.
// Тап по строке — перемотка ролика к этой фразе.

export default function ListenScreen() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const tone = sk.video;

  const [videoId, setVideoId] = useState<string | null>(null);
  const [showRu, setShowRu] = useState(false);
  const script = useMemo<ShadowScript | null>(
    () => SHADOWING.find((s) => s.id === videoId) ?? null,
    [videoId]
  );

  // Караоке: поллим текущее время плеера, пока экран в фокусе.
  const playerRef = useRef<YouTubeHandle | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const linesScroll = useRef<ScrollView | null>(null);
  const lineY = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (!script || !focused) return;
    lineY.current.clear();
    setActiveIdx(null);
    const id = setInterval(async () => {
      const t = await playerRef.current?.getCurrentTime();
      if (t == null) return;
      const i = script.lines.findIndex((l) => t >= l.start && t < l.end);
      setActiveIdx((prev) => {
        const next = i >= 0 ? i : prev;
        if (next !== prev && next != null) {
          const y = lineY.current.get(next);
          if (y != null) linesScroll.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
        }
        return next;
      });
    }, 500);
    return () => clearInterval(id);
  }, [script, focused]);

  // Минуты shadowing идут в план дня, пока открыт плеер на этом табе.
  useActivityTimer(focused && script ? "shadowing" : null);

  const playerH = Math.round(((width - 40) * 9) / 16);

  function openVideo(id: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVideoId(id);
    setShowRu(false);
  }

  /* ---------- Плеер (закреплён) + строки-караоке (скроллятся) ---------- */
  if (script) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8 }}>
        {/* Фиксированная шапка: видео всегда на экране */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setVideoId(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="К списку видео"
              hitSlop={8}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                minHeight: 40,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="chevron-back" size={18} color={c.muted} />
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>
                к видео
              </Text>
            </Pressable>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: c.muted,
                fontVariant: ["tabular-nums"],
              }}
            >
              {activeIdx != null ? `строка ${activeIdx + 1} / ${script.lines.length}` : `${script.lines.length} строк`}
            </Text>
          </View>

          <YouTube ref={playerRef} id={script.youtubeId} height={playerH} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: c.brandSoft,
              borderRadius: radius.soft,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Ionicons name="mic" size={16} color={tone} />
            <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, color: c.brandInk }}>
              Повторяй вслух за голосом. Текущая фраза подсветится сама; тап по строке —
              перемотка к ней.
            </Text>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowRu((v) => !v);
              }}
              accessibilityRole="button"
              accessibilityLabel={showRu ? "Скрыть перевод" : "Показать перевод"}
              hitSlop={8}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: showRu ? tone : c.surface,
                borderWidth: 1,
                borderColor: showRu ? tone : c.line,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "Nunito_700Bold",
                  fontSize: 12,
                  color: showRu ? c.onBrand : c.brandD,
                }}
              >
                RU
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Строки: подсветка активной, автоскролл, тап = перемотка */}
        <ScrollView
          ref={linesScroll}
          style={{ flex: 1, marginTop: 10 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 6 }}
        >
          {script.lines.map((l, i) => {
            const active = i === activeIdx;
            return (
              <Pressable
                key={i}
                onLayout={(e) => lineY.current.set(i, e.nativeEvent.layout.y)}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playerRef.current?.seekTo(l.start);
                  setActiveIdx(i);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Строка ${i + 1}: ${l.en}`}
                style={({ pressed }) => ({
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: active ? tone : "transparent",
                  backgroundColor: active ? c.brandSoft : pressed ? c.brandSoft : "transparent",
                })}
              >
                <Text
                  style={{
                    fontFamily: active ? "Nunito_700Bold" : "Inter_400Regular",
                    fontSize: 16,
                    lineHeight: 24,
                    color: active ? c.ink : c.muted,
                  }}
                >
                  {l.en}
                </Text>
                {showRu && l.ru ? (
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted, marginTop: 2 }}>
                    {l.ru}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  /* ---------- Список видео ---------- */
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
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.ink }}>
          Слушать
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
          Shadowing: повторяй вслух за живым носителем. Вход по Крашену — говорение придёт
          само.
        </Text>
      </View>

      {/* «3-минутка» — супер-короткая практика для дороги и очередей */}
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/three" as never);
        }}
        accessibilityRole="button"
        accessibilityLabel="Три минутки: дыхание, две фразы, установка"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: tone,
          borderRadius: radius.soft,
          padding: 16,
          minHeight: 64,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="timer" size={24} color={c.onBrand} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: c.onBrand }}>
            3-минутка
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.onBrand }}>
            дыхание под музыку → две фразы вслух → установка
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.onBrand} />
      </Pressable>

      {CATEGORY_ORDER.map((cat) => {
        const items = SHADOWING.filter((s) => s.category === cat);
        if (items.length === 0) return null;
        return (
          <View key={cat} style={{ gap: 10 }}>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>
              {CATEGORY_LABEL[cat]}
            </Text>
            {items.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => openVideo(s.id)}
                accessibilityRole="button"
                accessibilityLabel={`${s.title}, ${s.author}`}
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
                  <Ionicons name="play" size={18} color={tone} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>
                    {s.title}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
                    {s.author} · {s.level.toUpperCase()} · {s.lines.length} строк
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.muted} />
              </Pressable>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
