import { View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ENTRY_COPY } from "@ie/core/entryRouting";
import { EntryScaffold, Title, Body, PrimaryButton, GhostButton } from "@/components/entry-ui";

// S1 integrity-blocked (Recovery/Integrity design). Reached when the local store
// is corrupted with no confirmed restore source. No silent new-user flow:
// the old path stays paused; restart requires an explicit confirmation screen.
export default function IntegrityBlocked() {
  const router = useRouter();
  return (
    <EntryScaffold>
      <View style={{ flex: 1, gap: 14, justifyContent: "center" }}>
        <Title>{ENTRY_COPY.integrityTitle}</Title>
        <Body>{ENTRY_COPY.integrityLead}</Body>
      </View>
      <GhostButton label={ENTRY_COPY.integrityRetry} onPress={() => router.back()} />
      <PrimaryButton
        label={ENTRY_COPY.integrityRestart}
        onPress={() => router.push("/entry/integrity-restart-confirm" as Href)}
      />
    </EntryScaffold>
  );
}
