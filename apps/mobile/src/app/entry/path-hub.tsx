import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useMarina } from "@/theme";
import { ENTRY_COPY } from "@ie/core/entryRouting";
import { A11Y } from "@ie/tokens/primitives";
import { setOpenAssessmentStage } from "@ie/core/entryAssessment";
import { sliceState } from "@ie/core/slice";

// S4 Path Hub — frozen Batch A implementation.
// Orientation, not a dashboard: one primary next step. Practice-time facts and
// Library are quiet/lateral and never compete with the leading action.

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"] as const;

function todayLabel(now = new Date()): string {
  const text = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

export default function PathHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useMarina();
  const pretestComplete = Boolean(sliceState().pretestAt);
  const title = pretestComplete ? "Первая практика" : ENTRY_COPY.pathHubTitle;
  const lead = pretestComplete
    ? "Начнём с короткого контекста, затем вернём новые фразы из памяти."
    : ENTRY_COPY.pathHubLead;
  const cta = pretestComplete ? "Начать практику" : ENTRY_COPY.pathHubCta;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 26,
        paddingTop: insets.top + 18,
        paddingBottom: insets.bottom + 28,
      }}
    >
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.muted }}>{todayLabel()}</Text>
      <Text
        style={{
          fontFamily: "GolosText_800ExtraBold",
          fontSize: 30,
          lineHeight: 34,
          letterSpacing: -0.7,
          color: c.ink,
          marginTop: 4,
        }}
      >
        {greeting()}
      </Text>

      <View
        style={{
          borderWidth: 2,
          borderColor: c.brand,
          borderRadius: 24,
          padding: 22,
          marginTop: 18,
          backgroundColor: c.surface,
          shadowColor: c.brand,
          shadowOpacity: 0.18,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.brand }} />
          <Text
            style={{
              fontFamily: "GolosText_600SemiBold",
              fontSize: 14,
              letterSpacing: 0.8,
              color: c.brand,
            }}
          >
            {ENTRY_COPY.pathHubKicker}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "GolosText_700Bold",
            fontSize: 26,
            lineHeight: 30,
            letterSpacing: -0.5,
            color: c.ink,
            marginTop: 12,
          }}
        >
          {title}
        </Text>
        <Text
          style={{ fontFamily: "GolosText_400Regular", fontSize: 16, lineHeight: 24, color: c.muted, marginTop: 8 }}
        >
          {lead}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {["28 коротких фраз", "около 15 минут"].map((label) => (
            <View key={label} style={{ borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: c.brandSoft }}>
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.brandInk }}>{label}</Text>
            </View>
          ))}
          <View
            style={{
              borderRadius: 999,
              paddingVertical: 8,
              paddingHorizontal: 14,
              backgroundColor: `${c.accent}24`,
            }}
          >
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.accentD }}>
              Можно отвечать «Не помню»
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ENTRY_COPY.pathHubCta}
          onPress={() => {
            if (!pretestComplete) {
              setOpenAssessmentStage("S7");
              router.push("/entry/pretest" as Href);
              return;
            }
            router.push("/entry/daily-session" as Href);
          }}
          style={{
            minHeight: 56,
            borderRadius: 16,
            backgroundColor: c.brand,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 18,
          }}
        >
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.onBrand }}>
            {cta}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 20,
          padding: 18,
          marginTop: 14,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "baseline",
            justifyContent: "space-between",
            columnGap: 12,
            rowGap: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: "auto",
              minWidth: 0,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent, flexShrink: 0 }} />
            <Text
              style={{
                flexShrink: 1,
                fontFamily: "GolosText_600SemiBold",
                fontSize: 14,
                lineHeight: 19,
                letterSpacing: 0.6,
                color: c.muted,
              }}
            >
              ВРЕМЯ ПРАКТИКИ · {new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(new Date()).toUpperCase()}
            </Text>
          </View>
          <Text style={{ flexShrink: 0, fontFamily: "GolosText_600SemiBold", fontSize: 14, lineHeight: 19, color: "#B0A893" }}>
            Первая неделя
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 34, marginTop: 14 }}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <View style={{ width: "100%", height: 6, borderRadius: 4, backgroundColor: c.brandSoft }} />
              <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 14, color: c.muted }}>{day}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 10 }}>
          Часы появятся после первой сессии.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Открыть библиотеку"
        onPress={() => router.push("/(tabs)/library" as Href)}
        style={{
          minHeight: A11Y.minTouchTarget,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: 20,
          backgroundColor: c.surface,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginTop: 14,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: c.amber,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "Lora_400Regular_Italic", fontSize: 19, color: c.ink }}>Aa</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>Библиотека</Text>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 2 }}>
            живой английский
          </Text>
        </View>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 22, color: c.muted }}>›</Text>
      </Pressable>

      {__DEV__ && (
        <Text
          accessibilityLabel="QA build 1.0.0 reset 2"
          style={{
            marginTop: 16,
            textAlign: "center",
            fontFamily: "GolosText_400Regular",
            fontSize: 11,
            color: c.muted,
            opacity: 0.65,
          }}
        >
          QA · 1.0.0 · reset-2
        </Text>
      )}
    </ScrollView>
  );
}
