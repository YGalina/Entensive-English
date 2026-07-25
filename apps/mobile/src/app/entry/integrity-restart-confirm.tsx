import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useMarina } from "@/theme";
import { ENTRY_COPY, confirmIntegrityRestart } from "@ie/core/entryRouting";
import { EntryScaffold, Title, Body, PrimaryButton, GhostButton } from "@/components/entry-ui";

// S1 restart confirmation (Recovery/Integrity design). Destructive; the confirm
// action is enabled only after an explicit acknowledgement (form + text, not
// colour alone). Restart creates a FRESH local path (old profile/draft/protocol/
// daily are not silently reused) and routes back to onboarding.
export default function IntegrityRestartConfirm() {
  const router = useRouter();
  const { c, radius } = useMarina();
  const [ack, setAck] = useState(false);

  function restart() {
    const { route } = confirmIntegrityRestart();
    router.replace(route as Href);
  }

  return (
    <EntryScaffold>
      <View style={{ flex: 1, gap: 14, justifyContent: "center" }}>
        <Title>{ENTRY_COPY.restartTitle}</Title>
        <Body>{ENTRY_COPY.restartLead}</Body>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: ack }}
          onPress={() => setAck((v) => !v)}
          style={{ flexDirection: "row", gap: 12, alignItems: "center", minHeight: 44 }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: ack ? c.brand : c.line,
              backgroundColor: ack ? c.brand : "transparent",
            }}
          />
          <Text style={{ flex: 1, fontFamily: "GolosText_500Medium", fontSize: 16, lineHeight: 22, color: c.ink }}>
            {ENTRY_COPY.restartAck}
          </Text>
        </Pressable>
      </View>
      <PrimaryButton label={ENTRY_COPY.restartConfirm} onPress={restart} disabled={!ack} />
      <GhostButton label={ENTRY_COPY.restartCancel} onPress={() => router.back()} />
    </EntryScaffold>
  );
}
