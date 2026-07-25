import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMarina } from "@/theme";
// PR 1 общий контракт примитивов Living Content: высоты кнопок и a11y-минимумы.
import { BUTTON, A11Y } from "@ie/tokens/primitives";

// Тонкие product-safe примитивы для оболочек входа (PR 2). Не редизайн:
// геометрия и минимумы берутся из замороженного контракта примитивов.

export function EntryScaffold({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  const bg = dark ? "#211D16" : c.bg; // «свет лампы» — тёплый тёмный вход (Batch A S1)
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 24,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        gap: 16,
      }}
    >
      {children}
    </ScrollView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const { c } = useMarina();
  return (
    <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 26, lineHeight: 32, color: c.ink }}>
      {children}
    </Text>
  );
}

export function Body({ children }: { children: ReactNode }) {
  const { c } = useMarina();
  // body ≥16 (A11Y-минимум примитивов).
  return (
    <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 16, lineHeight: 24, color: c.muted }}>
      {children}
    </Text>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { c, radius } = useMarina();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: BUTTON.primary.minHeight, // 54, ≥44 touch target
        borderRadius: radius.soft,
        backgroundColor: disabled ? c.line : c.brand,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.onBrand }}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { c, radius } = useMarina();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minHeight: BUTTON.ghost.minHeight, // 48, ≥44 touch target
        borderRadius: radius.soft,
        borderWidth: 1,
        borderColor: c.line,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 16, color: c.ink }}>{label}</Text>
    </Pressable>
  );
}

export const MIN_TOUCH = A11Y.minTouchTarget;
