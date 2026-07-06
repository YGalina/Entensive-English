import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePrefs } from "@ie/core/prefs";
import { useTimeStats } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { useMarina } from "@/theme";
import { Breton } from "@/components/breton";

export default function ProfileScreen() {
  const { c, radius, mode } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const prefs = usePrefs();
  const time = useTimeStats();
  const [speaking, setSpeaking] = useState(false);

  function testVoice() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSpeaking(true);
    speakEnglish("Hello! I am your English voice. Let’s learn together.", {
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  const rows: { label: string; value: string }[] = [
    { label: "Уровень", value: prefs?.level ? prefs.level.toUpperCase() : "после настройки" },
    { label: "Цель", value: prefs?.goal || "после настройки" },
    { label: "Тема оформления", value: mode === "dark" ? "полночь над морем" : "хрустящий белый" },
    { label: "Часов практики всего", value: (time.totalSec / 3600).toFixed(1) },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 16,
      }}
    >
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.ink }}>
        Профиль
      </Text>
      <Breton red />

      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          paddingHorizontal: 16,
        }}
      >
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 14,
              gap: 12,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: c.line,
            }}
          >
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.muted }}>
              {r.label}
            </Text>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>
              {r.value}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={testVoice}
        disabled={speaking}
        accessibilityRole="button"
        accessibilityLabel="Проверить английский голос"
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: 16,
          backgroundColor: c.accent,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: speaking ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="volume-high" size={20} color="#ffffff" />
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: "#ffffff" }}>
          {speaking ? "Говорю…" : "Проверить голос"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/onboarding");
        }}
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.surface,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="options" size={18} color={c.brand} />
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.brand }}>
          Пройти настройку заново
        </Text>
      </Pressable>

      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, color: c.muted }}>
        Вход по волшебной ссылке и облачный синк прогресса появятся в следующем шаге.
        Полный кабинет — в веб-версии.
      </Text>
    </ScrollView>
  );
}
