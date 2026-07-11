import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Люди» — таб по 13_app_logic §4.1/§4.4: язык живёт между людьми.
// Сейчас живое здесь — «Сессия с тренером» (еженедельный разбор + заявка на
// малые группы). «Кто рядом» и клубы требуют бэкенда — показываем честные
// заглушки с проговорённой приватностью, без обещаний сроков.

export default function PeopleScreen() {
  const { c, sk } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const P = t.peopleX;

  function openCoach() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/coach" as never);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 14, paddingBottom: 32, gap: 12 }}
    >
      <View>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 34, letterSpacing: -0.8, color: c.ink }}>
          {P.title}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 4 }}>
          {P.subtitle}
        </Text>
      </View>

      {/* Сессия с тренером — живой вход */}
      <Pressable
        onPress={openCoach}
        accessibilityRole="button"
        accessibilityLabel={P.coach}
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
            backgroundColor: c.brandSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="people" size={21} color={c.brandD} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
            {P.coach}
          </Text>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 17, color: c.muted, marginTop: 2 }}>
            {P.coachNote}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.muted} />
      </Pressable>

      {/* Клуб — заявка живёт в /coach, здесь честный анонс */}
      <Pressable
        onPress={openCoach}
        accessibilityRole="button"
        accessibilityLabel={P.club}
        style={({ pressed }) => ({
          backgroundColor: c.surface,
          borderRadius: 16,
          padding: 16,
          gap: 5,
          shadowColor: "#3c280f",
          shadowOpacity: 0.13,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 3,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
            {P.club}
          </Text>
          <View style={{ backgroundColor: c.amber, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10.5, color: "#3b2c07" }}>
              {P.soon}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted }}>
          {P.clubNote}
        </Text>
      </Pressable>

      {/* Кто рядом — приватность проговорена прямо в заглушке (макет «пусто») */}
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 16,
          padding: 16,
          gap: 5,
          borderWidth: 1,
          borderColor: c.line,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
            {P.near}
          </Text>
          <View style={{ backgroundColor: c.amber, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10.5, color: "#3b2c07" }}>
              {P.soon}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted }}>
          {P.nearNote}
        </Text>
      </View>
    </ScrollView>
  );
}
