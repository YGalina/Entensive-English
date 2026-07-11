import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Библиотека» — таб по 13_app_logic §4.1: один вход в весь живой контент.
// Читать (книги/тексты) · Слушать (shadowing) · Звуки (лестница темпа — навык
// «Слух» живёт внутри Библиотеки, не отдельным табом). Своя ссылка («Моя
// лента») — внутри разделов. Поиск и «% моего» приедут следующим шагом.

export default function LibraryScreen() {
  const { c, sk } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const L = t.libX;

  function open(route: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as never);
  }

  const items = [
    { route: "/read", icon: "book" as const, tone: sk.reading, title: L.read, note: L.readNote },
    { route: "/listen", icon: "headset" as const, tone: sk.video, title: L.listen, note: L.listenNote },
    { route: "/sounds", icon: "mic" as const, tone: sk.sounds, title: L.sounds, note: L.soundsNote },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 14, paddingBottom: 32, gap: 12 }}
    >
      <View>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 34, letterSpacing: -0.8, color: c.ink }}>
          {L.title}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 4 }}>
          {L.subtitle}
        </Text>
      </View>

      {items.map((it) => (
        <Pressable
          key={it.route}
          onPress={() => open(it.route)}
          accessibilityRole="button"
          accessibilityLabel={it.title}
          style={({ pressed }) => ({
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 13,
            shadowColor: "#3c280f",
            shadowOpacity: 0.13,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            elevation: 3,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: `${it.tone}22`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={it.icon} size={21} color={it.tone} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
              {it.title}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 17, color: c.muted, marginTop: 2 }}>
              {it.note}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.muted} />
        </Pressable>
      ))}

      {/* Импорт своего — правило метода: твой контент сильнее любого каталога */}
      <View
        style={{
          backgroundColor: c.brandSoft,
          borderRadius: 15,
          paddingHorizontal: 15,
          paddingVertical: 13,
          flexDirection: "row",
          gap: 11,
          alignItems: "center",
        }}
      >
        <Ionicons name="add-circle" size={20} color={c.brandInk} />
        <Text style={{ flex: 1, fontFamily: "GolosText_500Medium", fontSize: 13.5, lineHeight: 19, color: c.brandInk }}>
          {L.own}
        </Text>
      </View>
    </ScrollView>
  );
}
