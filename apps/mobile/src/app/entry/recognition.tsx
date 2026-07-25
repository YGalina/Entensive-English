import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useMarina } from "@/theme";
import { ENTRY_COPY } from "@ie/core/entryRouting";
import { EntryScaffold, Body, PrimaryButton } from "@/components/entry-ui";

// S2 Recognition (minimal product stub, PR 2). Frozen copy; the full v4 screen
// (audio, phrase card) is a later slice. "Это про меня" → next entry step.
export default function Recognition() {
  const router = useRouter();
  const { c } = useMarina();
  return (
    <EntryScaffold>
      <View style={{ flex: 1, gap: 12, justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: "GolosText_600SemiBold",
            fontSize: 13,
            letterSpacing: 1,
            color: c.muted,
          }}
        >
          {ENTRY_COPY.recognitionKicker}
        </Text>
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, lineHeight: 32, color: c.ink }}>
          {ENTRY_COPY.recognitionLine}
        </Text>
        <Body>Дальше — короткое знакомство и первый шаг.</Body>
      </View>
      <PrimaryButton
        label={ENTRY_COPY.recognitionCta}
        onPress={() => router.replace("/entry/coming-soon" as Href)}
      />
    </EntryScaffold>
  );
}
