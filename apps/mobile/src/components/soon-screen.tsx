import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMarina } from "@/theme";
import { Breton } from "@/components/breton";

// Экран-предвестник модуля рецептивного ядра: что здесь появится и почему это
// важно по методу. Тон — тёплый, без «функция недоступна».

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
  title: string;
  lead: string;
  points: string[];
};

export function SoonScreen({ icon, tone, title, lead, points }: Props) {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
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
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
        }}
      >
        <Ionicons name={icon} size={30} color={tone} />
      </View>
      <Text
        style={{
          fontFamily: "GolosText_800ExtraBold",
          fontSize: 28,
          lineHeight: 34,
          color: c.ink,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: "GolosText_400Regular",
          fontSize: 15,
          lineHeight: 23,
          color: c.muted,
        }}
      >
        {lead}
      </Text>
      <Breton />
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: radius.card,
          padding: 18,
          gap: 12,
          borderWidth: 1,
          borderColor: c.line,
        }}
      >
        {points.map((p) => (
          <View key={p} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
            <Ionicons name="checkmark-circle" size={18} color={tone} style={{ marginTop: 2 }} />
            <Text
              style={{
                flex: 1,
                fontFamily: "GolosText_400Regular",
                fontSize: 14,
                lineHeight: 21,
                color: c.ink,
              }}
            >
              {p}
            </Text>
          </View>
        ))}
      </View>
      <Text
        style={{
          fontFamily: "GolosText_400Regular",
          fontSize: 13,
          lineHeight: 19,
          color: c.muted,
        }}
      >
        Уже тренируешься на компьютере? Прогресс общий: скоро он будет синхронизироваться
        между веб-версией и телефоном.
      </Text>
    </ScrollView>
  );
}
