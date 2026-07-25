import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useMarina } from "@/theme";
import { ENTRY_COPY } from "@ie/core/entryRouting";
import { EntryScaffold, Body, PrimaryButton } from "@/components/entry-ui";

// S4 Path Hub (minimal product stub, PR 2): orientation, one leading step.
// Full hub (honest hours, lateral library) is a later slice.
export default function PathHub() {
  const router = useRouter();
  const { c, radius } = useMarina();
  return (
    <EntryScaffold>
      <View
        style={{
          borderWidth: 2,
          borderColor: c.brand,
          borderRadius: radius.card,
          padding: 20,
          gap: 10,
          backgroundColor: c.surface,
        }}
      >
        <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, letterSpacing: 1, color: c.brand }}>
          {ENTRY_COPY.pathHubKicker}
        </Text>
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 22, lineHeight: 28, color: c.ink }}>
          {ENTRY_COPY.pathHubTitle}
        </Text>
        <Body>{ENTRY_COPY.pathHubLead}</Body>
        <View style={{ height: 8 }} />
        <PrimaryButton
          label={ENTRY_COPY.pathHubCta}
          onPress={() => router.replace("/entry/coming-soon" as Href)}
        />
      </View>
    </EntryScaffold>
  );
}
