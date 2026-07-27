import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMarina } from "@/theme";

// Общие кирпичи экранов Vertical Slice: шапка с назад, карточка, кнопки.
// Пилотный контур намеренно самодостаточен и не трогает остальное приложение.

export function SliceScreen({
  title,
  children,
  onBack,
  progress,
}: {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  progress?: { current: number; total: number };
}) {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Pressable
          onPress={onBack ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel="Назад"
          hitSlop={10}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.line,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? c.brandSoft : c.surface,
          })}
        >
          <Ionicons name="chevron-back" size={20} color={c.ink} />
        </Pressable>
        <Text style={{ flex: 1, fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>{title}</Text>
        {progress && (
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.muted }}>
            {progress.current} из {progress.total}
          </Text>
        )}
      </View>
      {progress && (
        <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: 24, paddingBottom: 8 }}>
          {Array.from({ length: progress.total }, (_, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 4,
                backgroundColor:
                  index + 1 < progress.current ? c.ink : index + 1 === progress.current ? c.brand : c.line,
              }}
            />
          ))}
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 28, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function SliceCard({ children, tone }: { children: ReactNode; tone?: "soft" }) {
  const { c } = useMarina();
  return (
    <View
      style={{
        backgroundColor: tone === "soft" ? c.brandSoft : c.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.line,
        padding: 16,
        gap: 10,
      }}
    >
      {children}
    </View>
  );
}

export function SliceBtn({
  label,
  onPress,
  kind = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: "primary" | "ghost";
  disabled?: boolean;
}) {
  const { c } = useMarina();
  const primary = kind === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        minHeight: 56,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: primary ? c.brand : "transparent",
        borderWidth: primary ? 0 : 1,
        borderColor: c.line,
        opacity: disabled ? 0.45 : 1,
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      })}
    >
      <Text
        style={{
          fontFamily: "GolosText_700Bold",
          fontSize: 15,
          color: primary ? c.onBrand : c.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SliceNote({ text }: { text: string }) {
  const { c } = useMarina();
  return (
    <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted }}>
      {text}
    </Text>
  );
}

export function SliceChip({ label, tone }: { label: string; tone: "found" | "plain" }) {
  const { c } = useMarina();
  return (
    <View
      style={{
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: tone === "found" ? c.accent : c.brandSoft,
      }}
    >
      <Text
        style={{
          fontFamily: "Lora_600SemiBold",
          fontSize: 13,
          color: tone === "found" ? c.onBrand : c.brandInk,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
