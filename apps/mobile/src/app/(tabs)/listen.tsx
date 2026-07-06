import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { YouTube } from "@/components/youtube";
import {
  SHADOWING,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type ShadowScript,
} from "@ie/core/data/shadowing";
import { useActivityTimer } from "@ie/core/timelog";
import { useMarina } from "@/theme";

// Shadowing: смотришь живого носителя и ПОВТОРЯЕШЬ ВСЛУХ, глазами по строкам.
// Просодия, декодирование беглой речи и мышцы лица работают одновременно.
// Перевод вторичен — по желанию, чтобы не выпадать из потока.

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

  // Минуты shadowing идут в план дня, пока открыт плеер на этом табе.
  useActivityTimer(focused && script ? "shadowing" : null);

  const playerH = Math.round(((width - 40) * 9) / 16);

  function openVideo(id: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVideoId(id);
    setShowRu(false);
  }

  /* ---------- Плеер + строки ---------- */
  if (script) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 12,
          paddingBottom: 32,
          gap: 14,
        }}
      >
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
            minHeight: 44,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="chevron-back" size={18} color={c.muted} />
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>
            к видео
          </Text>
        </Pressable>

        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 22, lineHeight: 28, color: c.ink }}>
            {script.title}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
            {script.author} · {script.level.toUpperCase()} · {CATEGORY_LABEL[script.category]}
          </Text>
        </View>

        <YouTube id={script.youtubeId} height={playerH} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: c.brandSoft,
            borderRadius: radius.soft,
            padding: 12,
          }}
        >
          <Ionicons name="mic" size={18} color={tone} />
          <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.brandInk }}>
            Повторяй ВСЛУХ за голосом, глазами по строкам. Сфальшивила — тихо подхвати со
            следующей фразы.
          </Text>
        </View>

        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowRu((v) => !v);
          }}
          accessibilityRole="button"
          style={({ pressed }) => ({
            minHeight: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: showRu ? c.brandSoft : c.surface,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 6,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Ionicons name="language" size={15} color={c.brandD} />
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13, color: c.brandD }}>
            {showRu ? "скрыть перевод" : "показать перевод"}
          </Text>
        </Pressable>

        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: c.line,
            padding: 18,
            gap: 14,
          }}
        >
          {script.lines.map((l, i) => (
            <View key={i} style={{ gap: 4 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 24, color: c.ink }}>
                {l.en}
              </Text>
              {showRu && l.ru ? (
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
                  {l.ru}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
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
        <Ionicons name="timer" size={24} color="#ffffff" />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#ffffff" }}>
            3-минутка
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#e6f4f4" }}>
            дыхание → две фразы вслух → установка. В метро, в очереди, перед сном.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ffffff" />
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
