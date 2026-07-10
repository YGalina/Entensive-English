// Шторка «добавить по ссылке» — для своих видео (YouTube) и книг (Gutenberg).
// Вставила ссылку → распарсили → добавили в «Мою ленту». Ошибку говорим мягко.

import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMarina } from "@/theme";

export function AddLinkSheet({
  open,
  title,
  placeholder,
  hint,
  errorText,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  placeholder: string;
  hint: string;
  errorText: string;
  /** true — принято и закрыто; false — показать ошибку */
  onSubmit: (value: string) => boolean;
  onClose: () => void;
}) {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function submit() {
    const ok = onSubmit(value);
    if (ok) {
      setValue("");
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(8,20,20,0.55)" }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={title} />
        <View
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: insets.bottom + 16,
            gap: 12,
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: c.line }} />
          <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 18, color: c.ink }}>
            {title}
          </Text>
          <TextInput
            value={value}
            onChangeText={(v) => {
              setValue(v);
              setError(false);
            }}
            placeholder={placeholder}
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            onSubmitEditing={submit}
            style={{
              minHeight: 50,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: error ? c.accent : c.line,
              backgroundColor: c.bg,
              paddingHorizontal: 14,
              fontFamily: "GolosText_400Regular",
              fontSize: 15,
              color: c.ink,
            }}
          />
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 17, color: error ? c.accent : c.muted }}>
            {error ? errorText : hint}
          </Text>
          <Pressable
            onPress={submit}
            accessibilityRole="button"
            style={({ pressed }) => ({
              minHeight: 52,
              borderRadius: 16,
              backgroundColor: c.accent,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 15, color: "#ffffff" }}>
              {title}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
