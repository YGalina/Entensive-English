import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { speakEnglish } from "@ie/media/speech";
import { A11Y } from "@ie/tokens/primitives";
import { useMarina } from "@/theme";
import { ENTRY_COPY } from "@ie/core/entryRouting";

// S2 Recognition — full product screen (PR 3).
// Source: frozen `docs/design/exports/batch-a-defaults-final/screens/S2_recognition.html` (v4).
// One thought, one action: naming the gap, then «Это про меня» → S3.
// No product tour, no reminder/privacy contract here (those live in S20/S26).

const PARTNER_EN_HEAD = "— So…";
const PARTNER_EN_HIGHLIGHT = "what do you think?";
const PARTNER_RU = "— Ну а ты что думаешь?";
const LEARNER_EN = "Well, I";
const PAUSE_NOTE = "…и эта пауза";
const LISTEN = "Прослушать";

export default function Recognition() {
  const router = useRouter();
  const { c, sk } = useMarina();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 26,
        paddingTop: insets.top + 22,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <Text
        style={{
          fontFamily: "GolosText_600SemiBold",
          fontSize: 14,
          letterSpacing: 1,
          color: c.muted,
        }}
      >
        {ENTRY_COPY.recognitionKicker}
      </Text>

      {/* Реплика собеседника */}
      <View
        style={{
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: 22,
          borderBottomLeftRadius: 8,
          padding: 22,
          marginTop: 14,
        }}
      >
        <Text style={{ fontFamily: "Lora_400Regular", fontSize: 30, lineHeight: 42, color: c.ink }}>
          {PARTNER_EN_HEAD}
          {"\n"}
          <Text style={{ backgroundColor: c.amber }}> {PARTNER_EN_HIGHLIGHT} </Text>
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={LISTEN}
            onPress={() => speakEnglish(`So... ${PARTNER_EN_HIGHLIGHT}`)}
            style={{
              minHeight: A11Y.minTouchTarget,
              justifyContent: "center",
              backgroundColor: c.bg,
              borderWidth: 1,
              borderColor: c.line,
              borderRadius: 999,
              paddingHorizontal: 18,
            }}
          >
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: sk.video }}>
              {"▸ "}
              {LISTEN}
            </Text>
          </Pressable>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, color: c.muted }}>{PARTNER_RU}</Text>
        </View>
      </View>

      {/* Связка между репликами */}
      <View style={{ width: 2, height: 26, backgroundColor: c.line, marginLeft: 196 }} />

      {/* Своя реплика, которая обрывается */}
      <View style={{ gap: 8, alignItems: "flex-end" }}>
        <View
          style={{
            backgroundColor: c.brandSoft,
            borderRadius: 22,
            borderBottomRightRadius: 8,
            paddingVertical: 18,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: "Lora_500Medium_Italic", fontSize: 30, color: c.brandInk }}>{LEARNER_EN}</Text>
          <View style={{ width: 2.5, height: 32, backgroundColor: sk.video, marginLeft: 6 }} />
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted }}>{PAUSE_NOTE}</Text>
      </View>

      <Text
        style={{
          fontFamily: "GolosText_800ExtraBold",
          fontSize: 31,
          lineHeight: 37,
          letterSpacing: -0.8,
          color: c.ink,
          marginTop: 30,
        }}
      >
        {ENTRY_COPY.recognitionLine}
      </Text>

      <View style={{ flex: 1, minHeight: 24 }} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/entry/profile" as Href)}
        style={{
          height: 56,
          borderRadius: 16,
          backgroundColor: c.brand,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.onBrand }}>
          {ENTRY_COPY.recognitionCta}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
