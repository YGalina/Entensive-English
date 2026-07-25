import { Stack } from "expo-router";

// Product entry surface (PR 2): S1 Entry/Resume Router + minimal routing stubs.
// Headerless stack; the router replaces into the resolved destination.
export default function EntryLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
