import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { removeArtifact, useArtifacts, type OutputArtifact, type OutputType } from "@ie/core/output";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Дневник» — лента всего, что произведено самой: статусы, фразы, роли,
// разборы недели, голос. Это ЕЁ материал (приватный, живёт на устройстве);
// видимая история пути — сильнее любого счётчика.

const TYPE_ICON: Record<OutputType, string> = {
  "morning-phrase": "sunny-outline",
  status: "chatbubble-ellipses-outline",
  essay: "create-outline",
  explanation: "school-outline",
  role: "film-outline",
  review: "clipboard-outline",
  speech: "mic-outline",
};

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export default function DiaryScreen() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, lang } = useT();
  const en = lang === "en";
  const d = t.diaryX;

  const artifacts = useArtifacts();

  const byDay = useMemo(() => {
    const map = new Map<string, OutputArtifact[]>();
    for (const a of artifacts) {
      const k = dayKey(a.createdAt);
      map.set(k, [...(map.get(k) ?? []), a]);
    }
    return [...map.entries()];
  }, [artifacts]);

  function fmtDay(k: string): string {
    const date = new Date(k + "T00:00:00Z");
    return date.toLocaleDateString(en ? "en-US" : "ru-RU", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 10 }}>
        <Text style={{ flex: 1, fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: c.ink }}>
          {d.title}
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={d.close}
          hitSlop={8}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close" size={18} color={c.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted }}>
          {d.privacyNote}
        </Text>

        {byDay.length === 0 && (
          <View style={{ alignItems: "center", gap: 8, paddingTop: 40 }}>
            <Ionicons name="book-outline" size={26} color={c.muted} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.muted, textAlign: "center", maxWidth: 280 }}>
              {d.empty}
            </Text>
          </View>
        )}

        {byDay.map(([day, items]) => (
          <View key={day} style={{ gap: 8 }}>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>
              {fmtDay(day)}
            </Text>
            {items.map((a) => (
              <View
                key={a.id}
                style={{ backgroundColor: c.surface, borderRadius: radius.soft, borderWidth: 1, borderColor: c.line, padding: 12, gap: 6 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name={(TYPE_ICON[a.type] ?? "document-outline") as never} size={14} color={c.brand} />
                  <Text style={{ flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: c.muted }}>
                    {d.types[a.type] ?? a.type}
                    {a.audioRef ? "  ·  🎙" : ""}
                  </Text>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      removeArtifact(a.id);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={d.remove}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={14} color={c.muted} />
                  </Pressable>
                </View>
                {!!a.text && (
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.ink }}>
                    {a.text}
                  </Text>
                )}
                {a.words.length > 0 && (
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: c.brand }}>
                    {a.words.join(" · ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
