import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { marinaColors } from "@ie/tokens";
// S1 Entry/Resume Router. Reads local state, computes exactly one next step via
// the PR 1 contract, and replaces into the resolved product route. It never
// writes progress/evidence — it is a navigation projection.
import { resolveEntryRoute, ENTRY_COPY } from "@ie/core/entryRouting";

export default function EntryRouter() {
  const router = useRouter();

  useEffect(() => {
    const { route } = resolveEntryRoute();
    router.replace(route as Href);
  }, [router]);

  // «Свет лампы» — короткий тёплый переход (Batch A S1), не спиннер-заглушка.
  const c = marinaColors("dark");
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#211D16",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 24,
      }}
    >
      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 22, color: c.ink }}>
        {ENTRY_COPY.brand}
      </Text>
      <ActivityIndicator color={c.sun} />
      <Text
        style={{
          fontFamily: "GolosText_400Regular",
          fontSize: 16,
          lineHeight: 24,
          color: c.muted,
          textAlign: "center",
        }}
      >
        {ENTRY_COPY.entryStatus}
      </Text>
    </View>
  );
}
