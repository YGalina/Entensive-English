import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { setSessionToken } from "@/lib/session";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// Deep-link из письма: intensiveenglish://auth?session=<токен>. Сохраняем токен
// и уводим в профиль. Verify на сервере уже сжёг одноразовый login-токен —
// сюда приходит долгоживущий Bearer сессии.
export default function AuthLanding() {
  const { session } = useLocalSearchParams<{ session?: string }>();
  const router = useRouter();
  const { c } = useMarina();
  const { t } = useT();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const token = typeof session === "string" ? session : "";
    if (token.length > 0) {
      setSessionToken(token);
      setOk(true);
    } else {
      setOk(false);
    }
    const id = setTimeout(() => router.replace("/profile"), 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>
      {ok === false ? (
        <>
          <Ionicons name="alert-circle" size={40} color={c.accent} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink, textAlign: "center" }}>
            {t.authX.failed}
          </Text>
        </>
      ) : (
        <>
          {ok ? (
            <Ionicons name="checkmark-circle" size={40} color={c.brand} />
          ) : (
            <ActivityIndicator color={c.brand} />
          )}
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink, textAlign: "center" }}>
            {ok ? t.authX.done : t.authX.signing}
          </Text>
        </>
      )}
    </View>
  );
}
