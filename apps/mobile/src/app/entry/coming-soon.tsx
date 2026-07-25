import { View } from "react-native";
import { useRouter } from "expo-router";
import { ENTRY_COPY } from "@ie/core/entryRouting";
import { EntryScaffold, Title, Body, GhostButton } from "@/components/entry-ui";

// Neutral product-safe placeholder for entry destinations whose full screens
// land in later PRs (resume draft, protocol stage, recovery, daily cycle). The
// router computes the correct step; the destination screen is stubbed for now.
// No internal step kind is shown to the learner.
export default function ComingSoon() {
  const router = useRouter();
  return (
    <EntryScaffold>
      <View style={{ flex: 1, gap: 14, justifyContent: "center" }}>
        <Title>{ENTRY_COPY.comingSoonTitle}</Title>
        <Body>{ENTRY_COPY.comingSoonLead}</Body>
      </View>
      <GhostButton label={ENTRY_COPY.comingSoonBack} onPress={() => router.back()} />
    </EntryScaffold>
  );
}
