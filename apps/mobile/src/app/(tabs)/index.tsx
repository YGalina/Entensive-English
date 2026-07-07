import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { useStreak } from "@ie/core/timelog";
import { useOutcome } from "@ie/core/outcome";
import { useWpmStats } from "@ie/core/wpm";
import { usePrefs } from "@ie/core/prefs";
import { useMarina, skillTone } from "@/theme";
import { Breton } from "@/components/breton";

// «Сегодня» — дашборд дня в языке Welltory: кольцо плана, крупные метрики,
// инсайт-карточка (объясняем, не просто показываем), герой следующего шага и
// компактная дорожка этапов. Все цифры настоящие: timelog/FSRS/WPM/outcome.

// «Набор» — принципиально только web (виртуальная клавиатура не тренирует
// пальцевую память); на мобильном шаг не показываем.
const WEB_ONLY_STEPS = new Set(["typing"]);

const STEP_ROUTE: Record<string, string> = {
  session: "/session",
  pronunciation: "/sounds",
  reading: "/read",
  shadowing: "/listen",
};

const MONTHS_RU = ["январю","февралю","марту","апрелю","маю","июню","июлю","августу","сентябрю","октябрю","ноябрю","декабрю"];

export default function TodayScreen() {
  const { c, sk, radius, mode } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plan = useDayPlan();
  const streak = useStreak();
  const prefs = usePrefs();
  const outcome = useOutcome();
  const wpm = useWpmStats();

  const heroGradient =
    mode === "dark"
      ? (["#155055", "#0f3033", "#0a2224"] as const)
      : (["#1a97a0", "#147e86", "#0c5259"] as const);

  const steps = plan.steps.filter((s) => !WEB_ONLY_STEPS.has(s.id));
  const current = steps.find((s) => !s.done) ?? null;

  // Кольцо дня: план из квиза (dailyGoalMin), запас — 30 мин.
  const dailyGoal = prefs?.dailyGoalMin ?? 30;
  const ringPct = Math.min(1, plan.todayMin / dailyGoal);
  const leftMin = Math.max(0, dailyGoal - plan.todayMin);

  function openStep(id: string, title: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const route = STEP_ROUTE[id];
    if (route) {
      router.push(route as never);
      return;
    }
    Alert.alert(
      title,
      "Этот шаг скоро появится в мобильной версии. Сейчас он ждёт тебя в веб-версии — а здесь уже можно смотреть дорожку дня.",
      [{ text: "Хорошо", style: "default" }]
    );
  }

  // Инсайт: темп → дата уровня → что осталось сегодня. Объясняем, не стыдим.
  const insight = (() => {
    const parts: string[] = [];
    if (outcome.paceMinPerDay >= 5 && outcome.levelEta) {
      const d = outcome.levelEta;
      parts.push(
        `Твой темп за неделю — ${outcome.paceMinPerDay} мин/день. Это дорога к ${outcome.levelNext.toUpperCase()} к ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}.`
      );
    } else {
      parts.push(`Прогноз уровня появится после первых дней практики — план на сегодня ${dailyGoal} мин.`);
    }
    if (leftMin > 0 && current) {
      parts.push(`Сегодня осталось ${leftMin} мин — лучший шаг: ${current.ru.title}.`);
    } else if (leftMin === 0) {
      parts.push("План на сегодня собран. Вечерний круг перед сном закрепит день.");
    }
    return parts.join(" ");
  })();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 14,
      }}
    >
      {/* Шапка */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.ink }}>
            Сегодня
          </Text>
          {streak > 0 && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: c.sun }}
              accessibilityLabel={`Серия: ${streak} дней подряд`}
            >
              <Ionicons name="flame" size={14} color="#5a3a12" />
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: "#5a3a12", fontVariant: ["tabular-nums"] }}>
                {streak}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Breton />

      {/* Кольцо дня + метрики */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <DayRing pct={ringPct} doneMin={plan.todayMin} goalMin={dailyGoal} />
        <View style={{ flex: 1, gap: 10 }}>
          <MetricCard
            label="скорость чтения"
            value={wpm.last != null ? String(wpm.last) : "—"}
            unit="WPM"
            pct={wpm.last != null ? Math.min(1, wpm.last / 240) : 0}
            barColor={c.brand}
            onPress={() => openStep("reading", "Чтение")}
          />
          <MetricCard
            label="слов в узнавании"
            value={String(outcome.wordsLearned)}
            unit={`/ ${outcome.wordsTarget}`}
            pct={Math.min(1, outcome.wordsLearned / outcome.wordsTarget)}
            barColor={c.accent}
            onPress={() => openStep("session", "Сеанс дня")}
          />
        </View>
      </View>

      {/* Инсайт: объясняем цифры человеческим языком */}
      <View style={{ flexDirection: "row", gap: 10, backgroundColor: c.brandSoft, borderRadius: radius.soft, padding: 14 }}>
        <Ionicons name="sparkles" size={16} color={c.brand} style={{ marginTop: 2 }} />
        <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19.5, color: c.brandInk }}>
          {insight}
        </Text>
      </View>

      {/* Герой: следующий шаг */}
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={{ borderRadius: radius.card, padding: 18, gap: 8 }}
      >
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: "#bfe0dd" }}>
          {current ? `следующий шаг · ${current.goalMin > 0 ? `${current.goalMin} мин` : "повторы"}` : "день собран"}
        </Text>
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 23, color: "#ffffff" }}>
          {current ? current.ru.title : "Всё на сегодня сделано ✔"}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13.5, color: "#cfe8e6" }}>
          {current ? current.ru.note : "Мозг доучит ночью — вечерний круг и сон делают своё."}
        </Text>
        {current && (
          <Pressable
            onPress={() => openStep(current.id, current.ru.title)}
            accessibilityRole="button"
            accessibilityLabel={`Начать: ${current.ru.title}`}
            style={({ pressed }) => ({
              marginTop: 8,
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

      {/* «3-минутка» */}
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
            дыхание под музыку → две фразы вслух → установка
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.muted} />
      </Pressable>

      {/* Дорожка дня: компактные этапы-точки */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>
          Дорожка дня
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: c.surface,
            borderRadius: radius.soft,
            borderWidth: 1,
            borderColor: c.line,
            paddingVertical: 12,
            paddingHorizontal: 8,
          }}
        >
          {steps.map((s) => {
            const tone = skillTone(s.tone, sk, c.brand);
            const isCurrent = current?.id === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => openStep(s.id, s.ru.title)}
                accessibilityRole="button"
                accessibilityLabel={`${s.ru.title}: ${s.done ? "готово" : isCurrent ? "текущий шаг" : `${s.pct}%`}`}
                hitSlop={6}
                style={({ pressed }) => ({ alignItems: "center", gap: 5, flex: 1, opacity: pressed ? 0.6 : 1 })}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    borderWidth: 2,
                    borderColor: s.done ? tone : isCurrent ? c.accent : c.line,
                    backgroundColor: s.done ? tone : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.done ? (
                    <Ionicons name="checkmark" size={15} color="#ffffff" />
                  ) : isCurrent ? (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.accent }} />
                  ) : null}
                </View>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "Inter_600SemiBold", fontSize: 9.5, color: s.done || isCurrent ? c.ink : c.muted }}
                >
                  {s.ru.title.split(" ")[0]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- Кольцо дня ---------- */

function DayRing({ pct, doneMin, goalMin }: { pct: number; doneMin: number; goalMin: number }) {
  const { c } = useMarina();
  const size = 128;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const len = 2 * Math.PI * r;

  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityLabel={`План дня: ${doneMin} из ${goalMin} минут`}
    >
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={r} stroke={c.brandSoft} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={c.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${len}`}
          strokeDashoffset={len * (1 - pct)}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 28, color: c.ink, fontVariant: ["tabular-nums"] }}>
          {Math.round(pct * 100)}%
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10.5, color: c.muted, fontVariant: ["tabular-nums"] }}>
          {doneMin} из {goalMin} мин
        </Text>
      </View>
    </View>
  );
}

/* ---------- Метрика с мини-шкалой ---------- */

function MetricCard({
  label,
  value,
  unit,
  pct,
  barColor,
  onPress,
}: {
  label: string;
  value: string;
  unit: string;
  pct: number;
  barColor: string;
  onPress: () => void;
}) {
  const { c, radius } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value} ${unit}`}
      style={({ pressed }) => ({
        backgroundColor: pressed ? c.brandSoft : c.surface,
        borderRadius: radius.soft,
        borderWidth: 1,
        borderColor: c.line,
        paddingHorizontal: 12,
        paddingVertical: 9,
        gap: 4,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase", color: c.muted }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 19, color: c.ink, fontVariant: ["tabular-nums"] }}>
        {value}{" "}
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: c.muted }}>{unit}</Text>
      </Text>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: c.brandSoft, overflow: "hidden" }}>
        <View style={{ width: `${Math.round(pct * 100)}%`, height: 4, borderRadius: 2, backgroundColor: barColor }} />
      </View>
    </Pressable>
  );
}
