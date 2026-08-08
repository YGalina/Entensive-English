import { Redirect, Stack, usePathname } from "expo-router";
// SDK 54: expo-router больше НЕ реэкспортит темы навигации — берём из первоисточника.
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useFonts } from "expo-font";
// Дизайн-система «Living Content»: Golos Text — голос интерфейса, Lora — голос
// языка (английские слова, фразы, чтение, курсив голосов стражей).
import {
  GolosText_400Regular,
  GolosText_500Medium,
  GolosText_600SemiBold,
  GolosText_700Bold,
  GolosText_800ExtraBold,
} from "@expo-google-fonts/golos-text";
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
  Lora_400Regular_Italic,
  Lora_500Medium_Italic,
} from "@expo-google-fonts/lora";
import { configureStorage } from "@ie/core/storage";
import { marinaColors } from "@ie/tokens";
import { kvStorage, resetOwnerQaProgressOnce } from "@/lib/storage";
import { useMarina } from "@/theme";

// Хранилище прогресса настраивается ДО первого рендера: хуки @ie/core
// (prefs/timelog/srs) читают адаптер при первом обращении.
configureStorage(kvStorage);
resetOwnerQaProgressOnce();

SplashScreen.preventAutoHideAsync();

/** Темы навигации, покрашенные токенами «Марины». */
function navTheme(mode: "light" | "dark") {
  const base = mode === "dark" ? DarkTheme : DefaultTheme;
  const c = marinaColors(mode);
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.brand,
      background: c.bg,
      card: c.surface,
      text: c.ink,
      border: c.line,
      notification: c.accent,
    },
  };
}

export default function RootLayout() {
  const { mode } = useMarina();
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    GolosText_400Regular,
    GolosText_500Medium,
    GolosText_600SemiBold,
    GolosText_700Bold,
    GolosText_800ExtraBold,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    Lora_400Regular_Italic,
    Lora_500Medium_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // The repository still carries historical routes while approved product
  // screens are migrated. They are implementation references only: no cached
  // URL or old deep link may reopen rejected onboarding, word-flow, music,
  // coach, guardian, streak or level-check surfaces.
  if (pathname !== "/entry" && !pathname.startsWith("/entry/")) {
    return <Redirect href="/entry" />;
  }

  return (
    <ThemeProvider value={navTheme(mode)}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
