// Всплывающий бабл-мотивашка (идея Галины). Мягко въезжает сверху при
// открытии панели, авто-скрывается, можно закрыть. ЦВЕТ КОДИРУЕТ ТИП:
//   • method → бирюзовый (brand) — методическая опора;
//   • psych  → коралловый (accent) — психологическая поддержка (выделяется).

import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { motivationOfDay, type Motivation } from "@ie/core/data/motivations";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

export function MotivationBubble({ slot }: { slot: Motivation["slot"] }) {
  const { c, radius, mode } = useMarina();
  const { lang } = useT();
  const en = lang === "en";
  const day = Math.floor(Date.now() / 864e5);
  const m = motivationOfDay(slot, day);

  const [dismissed, setDismissed] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!m) return;
    Animated.timing(anim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    // авто-скрытие через 12 c — не мешает, но успевает прочитаться
    const id = setTimeout(() => close(), 12000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m?.id]);

  function close() {
    Animated.timing(anim, { toValue: 0, duration: 240, useNativeDriver: true }).start(() =>
      setDismissed(true)
    );
  }

  if (!m || dismissed) return null;

  // Психоподдержка — коралловый (accent), метод — бирюзовый (brand).
  // accentSoft в токенах нет — задаём мягкий коралловый фон по теме вручную.
  const isPsych = m.tone === "psych";
  const psychBg = mode === "dark" ? "#3a231e" : "#fdeae4";
  const bg = isPsych ? psychBg : c.brandSoft;
  const fg = isPsych ? c.accentD : c.brandInk;
  const icon = isPsych ? "heart" : "bulb";

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          backgroundColor: bg,
          borderRadius: radius.soft,
          borderLeftWidth: 3,
          borderLeftColor: isPsych ? c.accent : c.brand,
          padding: 12,
        }}
      >
        <Ionicons name={icon as never} size={16} color={isPsych ? c.accent : c.brand} style={{ marginTop: 1 }} />
        <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: fg }}>
          {en ? m.en : m.ru}
        </Text>
        <Pressable onPress={close} accessibilityRole="button" hitSlop={8} style={{ marginTop: -2 }}>
          <Ionicons name="close" size={15} color={isPsych ? c.accent : c.brand} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
