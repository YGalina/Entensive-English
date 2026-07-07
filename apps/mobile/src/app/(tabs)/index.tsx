import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { useSrsStats } from "@ie/core/srs";
import { useStreak } from "@ie/core/timelog";
import { usePrefs } from "@ie/core/prefs";
import { useMarina, skillTone } from "@/theme";
import { Breton } from "@/components/breton";

// «Сегодня» — мобильный дирижёр дня (предпросмотр). Данные настоящие:
// план собирается из @ie/core (шаги закрываются реальными минутами практики,
// повторы — пустой очередью FSRS), хранилище — на устройстве.

// В мобильной v1 — рецептивное ядро; «Набор» — принципиально только web
// (виртуальная клавиатура не тренирует пальцевую память Шестова).
const WEB_ONLY_STEPS = new Set(["typing"]);

// Куда ведёт шаг в мобильной v1 (рецептивное ядро). Остальные модули пока
// живут в веб-версии — по тапу тепло объясняем, не обрывая ритуал.
const STEP_ROUTE: Record<string, string> = {
  session: "/session",
  pronunciation: "/sounds",
  reading: "/read",
  shadowing: "/listen",
};

export default function TodayScreen() {
  const { c, sk, radius, mode } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plan = useDayPlan();

  // Морской герой: тёмный teal-градиент под белый текст в ОБЕИХ темах
  // (в тёмной бренд-цвет светлый, поэтому берём фиксированную глубину).
  const heroGradient =
    mode === "dark"
      ? (["#155055", "#0f3033", "#0a2224"] as const)
      : (["#1a97a0", "#147e86", "#0c5259"] as const);
  const srs = useSrsStats();
  const streak = useStreak();
  const prefs = usePrefs();

  const steps = plan.steps.filter((s) => !WEB_ONLY_STEPS.has(s.id));
  const current = steps.find((s) => !s.done) ?? null;

  function openStep(id: string, title: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const route = STEP_ROUTE[id];
    if (route) {
      router.push(route as never);
      return;
    }
    Alert.alert(
      title,
      "Этот шаг скоро появится в мобильной версии. Сейчас он ждёт тебя в веб-версии — а здесь уже можно смотреть путь дня.",
      [{ text: "Хорошо", style: "default" }]
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 16,
      }}
    >
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.ink }}>
            Сегодня
          </Text>
          {streak > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 16,
                backgroundColor: c.sun,
              }}
              accessibilityLabel={`Серия: ${streak} дней подряд`}
            >
              <Ionicons name="flame" size={14} color="#5a3a12" />
              <Text
                style={{
                  fontFamily: "Nunito_800ExtraBold",
                  fontSize: 13,
                  color: "#5a3a12",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {streak}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.muted }}>
          {prefs
            ? "Один понятный следующий шаг — остальное подождёт."
            : "Это ранний предпросмотр мобильной версии. Настройка под тебя — скоро."}
        </Text>
      </View>

      <Breton />

      {/* Герой: текущий шаг дня */}
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={{ borderRadius: radius.card, padding: 20, gap: 10 }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 12,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "#bfe0dd",
          }}
        >
          {current ? "Следующий шаг" : "День собран"}
        </Text>
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 24, color: "#ffffff" }}>
          {current ? current.ru.title : "Всё на сегодня сделано ✔"}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: "#cfe8e6" }}>
          {current
            ? current.ru.note
            : "Мозг доучит ночью — вечерний круг и сон делают своё."}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
          <Ionicons name="time-outline" size={16} color={c.sun} />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              color: c.sun,
              fontVariant: ["tabular-nums"],
            }}
          >
            {plan.todayMin} мин практики сегодня
          </Text>
        </View>
        {current && (
          <Pressable
            onPress={() => openStep(current.id, current.ru.title)}
            accessibilityRole="button"
            accessibilityLabel={`Начать: ${current.ru.title}`}
            style={({ pressed }) => ({
              marginTop: 10,
              minHeight: 48,
              borderRadius: 14,
              backgroundColor: c.accent,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: "#ffffff" }}>
              Начать
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </Pressable>
        )}
      </LinearGradient>

      {/* «3-минутка»: ритуал жив даже в самый занятый день */}
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/three" as never);
        }}
        accessibilityRole="button"
        accessibilityLabel="Три минутки: дыхание, две фразы, установка"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: pressed ? c.brandSoft : c.surface,
          borderRadius: radius.soft,
          borderWidth: 1,
          borderColor: c.line,
          paddingHorizontal: 14,
          minHeight: 56,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <Ionicons name="timer" size={20} color={sk.video} />
        <View style={{ flex: 1, paddingVertical: 10 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>
            Есть 3 минуты?
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
            дыхание → две фразы вслух → установка
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.muted} />
      </Pressable>

      {/* Путь дня: чипы шагов с флагами навыков */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>
          Путь дня
        </Text>
        {steps.map((s) => {
          const tone = skillTone(s.tone, sk, c.brand);
          return (
            <Pressable
              key={s.id}
              onPress={() => openStep(s.id, s.ru.title)}
              accessibilityRole="button"
              accessibilityLabel={`${s.ru.title}: ${s.done ? "готово" : `${s.pct}%`}`}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: pressed ? c.brandSoft : c.surface,
                borderRadius: radius.soft,
                borderWidth: 1,
                borderColor: c.line,
                paddingHorizontal: 14,
                minHeight: 56,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: s.done ? tone : c.line,
                }}
              />
              <View style={{ flex: 1, paddingVertical: 10 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>
                  {s.ru.title}
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
                  {s.kind === "review"
                    ? s.due > 0
                      ? `${s.due} слов ждут повтора`
                      : "очередь пуста"
                    : `${Math.round(s.doneMin)} / ${s.goalMin} мин`}
                </Text>
              </View>
              {s.done ? (
                <Ionicons name="checkmark-circle" size={22} color={tone} />
              ) : (
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color: tone,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {s.pct}%
                </Text>
              )}
              <Ionicons name="chevron-forward" size={16} color={c.muted} />
            </Pressable>
          );
        })}
      </View>

      {/* Мини-статистика словаря */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
        }}
      >
        {[
          { label: "слов в работе", value: srs.total },
          { label: "усвоено", value: srs.learned },
          { label: "ждут повтора", value: srs.dueToday },
        ].map((x) => (
          <View
            key={x.label}
            style={{
              flex: 1,
              backgroundColor: c.surface,
              borderRadius: radius.soft,
              borderWidth: 1,
              borderColor: c.line,
              padding: 12,
              gap: 2,
            }}
          >
            <Text
              style={{
                fontFamily: "Nunito_800ExtraBold",
                fontSize: 20,
                color: c.brand,
                fontVariant: ["tabular-nums"],
              }}
            >
              {x.value}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: c.muted }}>
              {x.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
