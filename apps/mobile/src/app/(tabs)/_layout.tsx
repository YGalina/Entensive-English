import { Redirect, Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrefs } from "@ie/core/prefs";
import { useMarina } from "@/theme";

// Мобильная навигация — 5 табов по финальным макетам (13_app_logic §4.1):
// Сегодня · Библиотека · Словарь · Люди · Профиль. Читать/Слушать/Звуки живут
// внутри Библиотеки; активный таб красится сигнальным флагом своего навыка.

type IconName = keyof typeof Ionicons.glyphMap;

function icon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  const { c, sk } = useMarina();
  const prefs = usePrefs();

  // Первый вход: настроим под неё, прежде чем показывать план дня.
  // Хранилище синхронное (kv-store), поэтому мигания «таб → онбординг» нет.
  if (!prefs) return <Redirect href="/onboarding" />;

  const en = prefs.uiLang === "en";
  const T = en
    ? { today: "Today", library: "Library", vocab: "Words", people: "People", profile: "Profile" }
    : { today: "Сегодня", library: "Библиотека", vocab: "Словарь", people: "Люди", profile: "Профиль" };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
        tabBarLabelStyle: { fontFamily: "GolosText_600SemiBold", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: T.today,
          tabBarActiveTintColor: c.brand,
          tabBarIcon: icon("home"),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: T.library,
          tabBarActiveTintColor: sk.reading,
          tabBarIcon: icon("library"),
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: T.vocab,
          tabBarActiveTintColor: sk.words,
          tabBarIcon: icon("layers"),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: T.people,
          tabBarActiveTintColor: sk.video,
          tabBarIcon: icon("people"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: T.profile,
          tabBarActiveTintColor: c.brand,
          tabBarIcon: icon("person-circle"),
        }}
      />
    </Tabs>
  );
}
