import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { OutputCard } from "@/components/output-card";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Фраза о себе» — утренний ритуал вывода отдельным экраном (макет 24a держит
// главную чистой: одна карточка-вход вместо большого блока на «Сегодня»).
export default function PhraseScreen() {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          accessibilityRole="button"
          accessibilityLabel={t.diaryX.close}
          hitSlop={8}
          style={({ pressed }) => ({ minHeight: 44, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="chevron-back" size={22} color={c.muted} />
        </Pressable>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 24, letterSpacing: -0.4, color: c.ink }}>
          {t.homeX.phraseSelf}
        </Text>
      </View>
      <OutputCard />
    </ScrollView>
  );
}
