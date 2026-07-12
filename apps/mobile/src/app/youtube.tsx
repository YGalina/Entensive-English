import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { searchYouTube, youtubeConfigured, type YouTubeHit } from "@ie/core/data/youtube";
import { addMyVideo } from "@ie/core/mylibrary";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// Поиск видео на YouTube прямо в приложении (выбор Галины: API-путь). Строка →
// официальный Data API → результаты с превью → тап добавляет в «Мою ленту» и
// открывает встроенный плеер с shadowing. Без ключа — честное состояние.

export default function YouTubeSearchScreen() {
  const { c, sk } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const Y = t.ytX;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<YouTubeHit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const configured = youtubeConfigured();

  async function run() {
    const q = query.trim();
    if (!q) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError(null);
    const res = await searchYouTube(q, 15);
    setLoading(false);
    if (res.ok) {
      setHits(res.hits);
      if (res.hits.length === 0) setError(Y.empty);
    } else {
      setHits([]);
      setError(res.reason === "quota" ? Y.errQuota : res.reason === "no-key" ? Y.errNoKey : Y.errNetwork);
    }
  }

  function pick(hit: YouTubeHit) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMyVideo(hit.id, hit.title);
    router.replace(`/listen?video=${hit.id}` as never);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 10 }}>
      {/* Шапка: назад + строка поиска */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={Y.back}
          hitSlop={8}
          style={({ pressed }) => ({ minHeight: 44, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="chevron-back" size={24} color={c.ink} />
        </Pressable>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: c.surface,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: c.line,
            paddingHorizontal: 14,
          }}
        >
          <Ionicons name="logo-youtube" size={18} color={sk.video} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={run}
            returnKeyType="search"
            autoFocus
            placeholder={Y.placeholder}
            placeholderTextColor={c.muted}
            style={{ flex: 1, minHeight: 46, fontFamily: "GolosText_400Regular", fontSize: 15, color: c.ink }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={c.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
          {Y.hint}
        </Text>

        {loading && (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={c.brand} />
          </View>
        )}

        {!loading && error && (
          <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 18, gap: 6 }}>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.ink }}>
              {!configured ? Y.errNoKeyTitle : Y.errTitle}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
              {error}
            </Text>
          </View>
        )}

        {!loading &&
          hits?.map((h) => (
            <Pressable
              key={h.id}
              onPress={() => pick(h)}
              accessibilityRole="button"
              accessibilityLabel={h.title}
              style={({ pressed }) => ({
                backgroundColor: c.surface,
                borderRadius: 16,
                overflow: "hidden",
                flexDirection: "row",
                gap: 12,
                shadowColor: "#3c280f",
                shadowOpacity: 0.12,
                shadowRadius: 9,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View style={{ width: 128, height: 80, backgroundColor: c.brandSoft }}>
                {h.thumb ? (
                  <Image source={{ uri: h.thumb }} style={{ width: 128, height: 80 }} resizeMode="cover" />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="play" size={20} color={sk.video} />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, paddingVertical: 10, paddingRight: 12, justifyContent: "center" }}>
                <Text numberOfLines={2} style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, lineHeight: 19, color: c.ink }}>
                  {h.title}
                </Text>
                <Text numberOfLines={1} style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted, marginTop: 3 }}>
                  {h.channel}
                </Text>
              </View>
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
}
