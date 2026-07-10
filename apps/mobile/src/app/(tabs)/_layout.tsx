import { Redirect, Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrefs } from "@ie/core/prefs";
import { useMarina } from "@/theme";

// Мобильная навигация: 5 табов (не 8, как на web) — рецептивное ядро v1.
// Активный таб красится сигнальным флагом своего навыка (система «Марина»).

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
    ? { today: "Today", read: "Read", listen: "Listen", sounds: "Sounds", profile: "Profile" }
    : { today: "Сегодня", read: "Читать", listen: "Слушать", sounds: "Звуки", profile: "Профиль" };

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
        name="read"
        options={{
          title: T.read,
          tabBarActiveTintColor: sk.reading,
          tabBarIcon: icon("book"),
        }}
      />
      <Tabs.Screen
        name="listen"
        options={{
          title: T.listen,
          tabBarActiveTintColor: sk.video,
          tabBarIcon: icon("headset"),
        }}
      />
      <Tabs.Screen
        name="sounds"
        options={{
          title: T.sounds,
          tabBarActiveTintColor: sk.sounds,
          tabBarIcon: icon("mic"),
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
