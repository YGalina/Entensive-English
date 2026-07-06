import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { configureStorage } from "@ie/core/storage";
import { marinaColors } from "@ie/tokens";
import { kvStorage } from "@/lib/storage";
import { useMarina } from "@/theme";

// Хранилище прогресса настраивается ДО первого рендера: хуки @ie/core
// (prefs/timelog/srs) читают адаптер при первом обращении.
configureStorage(kvStorage);

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
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={navTheme(mode)}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
