import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { useOutputStats } from "@ie/core/output";
import { useSrsStats } from "@ie/core/srs";
import { usePrefs } from "@ie/core/prefs";
import { useTimeStats } from "@ie/core/timelog";
import { sessionLevelLabel } from "@ie/core/data/levelVocab";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";
import { GuardianCard } from "@/components/guardian-card";

// «Сегодня» — 1:1 по макету Экраны-v2 «1 · СЕГОДНЯ» (Living Content):
// дата → крупное приветствие → карточка «Сессия дня» с полосками четырёх фаз
// и единственным терракотовым CTA → «Честные часы · месяц» со столбиками
// недели (пустой день — тихий столбик) → карточка SRS «Пора вернуть слова».
// Вечером экран сам меняется: сделанное сворачивается, остаётся вечерний круг.

// «Набор» — принципиально только web (виртуальная клавиатура не тренирует
// пальцевую память); на мобильном шаг не показываем.
const WEB_ONLY_STEPS = new Set(["typing"]);

const WEEKDAYS_RU = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_GEN_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_NOM_RU = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Ключ дня в формате timelog (локальная дата YYYY-MM-DD). */
function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function TodayScreen() {
  const { c, sk } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plan = useDayPlan();
  const { t, lang } = useT();
  const en = lang === "en";
  const srs = useSrsStats();
  const outStats = useOutputStats();
  const prefs = usePrefs();
  const time = useTimeStats();

  const steps = plan.steps.filter((s) => !WEB_ONLY_STEPS.has(s.id));
  const current = steps.find((s) => !s.done) ?? null;
  const sessionStep = steps.find((s) => s.id === "session") ?? null;
  const sessionDone = sessionStep?.done ?? false;
  const levelLabel = sessionLevelLabel(prefs?.level);

  const now = new Date();
  const hour = now.getHours();
  const evening = hour >= 17;
  const eveningView = evening && (sessionDone || !current);

  const dateLine = en
    ? `${WEEKDAYS_EN[now.getDay()]}, ${MONTHS_EN[now.getMonth()]} ${now.getDate()}`
    : `${WEEKDAYS_RU[now.getDay()]}, ${now.getDate()} ${MONTHS_GEN_RU[now.getMonth()]}`;
  const monthName = en ? MONTHS_EN[now.getMonth()] : MONTHS_NOM_RU[now.getMonth()];

  // Честные часы месяца + столбики последних 7 дней (сегодня — справа).
  const monthPrefix = dayKey(now).slice(0, 7);
  const monthSec = Object.entries(time.byDay)
    .filter(([d]) => d.startsWith(monthPrefix))
    .reduce((s, [, v]) => s + v, 0);
  const monthH = Math.floor(monthSec / 3600);
  const monthM = Math.round((monthSec % 3600) / 60);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return time.byDay[dayKey(d)] ?? 0;
  });
  const weekMax = Math.max(...week, 60);

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingHorizontal: 30, paddingTop: insets.top + 22, paddingBottom: 32, gap: 18 }}
    >
      {/* Шапка: дата и крупное приветствие (макет: 13/600 → 32/800) */}
      <View>
        <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, letterSpacing: 0.3, color: c.muted, opacity: 0.85 }}>
          {dateLine}
        </Text>
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 32, lineHeight: 36, letterSpacing: -0.8, color: c.ink, marginTop: 6 }}>
          {eveningView ? t.homeX.eveningTitle : t.today.title}
        </Text>
      </View>

      {eveningView ? (
        <>
          {/* Вечер: сделанное сворачивается */}
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 20,
              padding: 20,
              gap: 11,
              shadowColor: "#3c280f",
              shadowOpacity: 0.14,
              shadowRadius: 11,
              shadowOffset: { width: 0, height: 5 },
              elevation: 3,
            }}
          >
            {steps.map((s) => (
              <View key={s.id} style={{ flexDirection: "row", gap: 10, alignItems: "center", opacity: s.done ? 1 : 0.85 }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: s.done ? c.accent : "transparent",
                    borderWidth: s.done ? 0 : 2,
                    borderStyle: s.done ? undefined : "dashed",
                    borderColor: c.line,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.done && <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13, color: c.onBrand }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: c.ink }}>
                    {s[lang].title}
                    {!s.done && ` · ${t.homeX.left}`}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, color: c.muted }} numberOfLines={1}>
                    {s.done ? s[lang].note : t.homeX.leftNote}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Вечерний круг — тёплая тёмная карточка «свет лампы» */}
          <View style={{ backgroundColor: "#2e2a22", borderRadius: 22, padding: 20 }}>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", color: "#e8b36a" }}>
              {t.homeX.circleLabel}
            </Text>
            <Text style={{ fontFamily: "Lora_400Regular", fontSize: 19, lineHeight: 28, color: "#f5efe2", marginTop: 9 }}>
              {t.homeX.circleQuote}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 19, color: "#9c937d", marginTop: 8 }}>
              {t.homeX.circleNote}
            </Text>
            <Pressable
              onPress={() => {
                tap();
                router.push("/evening" as never);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({
                marginTop: 14,
                minHeight: 58,
                borderRadius: 16,
                backgroundColor: "#e8b36a",
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: "#2a2214" }}>
                {outStats.statusToday ? t.homeX.circleOpenAgain : t.homeX.circleCta}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {/* СЕССИЯ ДНЯ — макет: рамка терракоты, полоски 4 фаз, один CTA */}
          <View
            style={{
              borderWidth: 2,
              borderColor: c.brand,
              borderRadius: 24,
              backgroundColor: c.surface,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 22,
              shadowColor: c.brand,
              shadowOpacity: 0.32,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 12 },
              elevation: 5,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.brand }} />
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: c.brand }}>
                {t.homeX.sessionLabel}
                {sessionStep && sessionStep.goalMin > 0 ? ` · ${t.homeX.min(sessionStep.goalMin)}` : ""}
              </Text>
            </View>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 25, lineHeight: 30, letterSpacing: -0.5, color: c.ink, marginTop: 12 }}>
              {sessionDone ? t.homeX.sessionDoneTitle : t.homeX.sessionTitle(levelLabel)}
            </Text>
            {/* Полоски четырёх фаз: слова · грамматика-мята · слух · речь */}
            <View style={{ flexDirection: "row", gap: 7, marginTop: 16 }}>
              {[c.brand, c.accent, sk.sounds, sk.video].map((col, i) => (
                <View key={i} style={{ flex: 1, height: 6, borderRadius: 6, backgroundColor: col }} />
              ))}
            </View>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, color: c.muted, opacity: 0.85, marginTop: 10 }}>
              {t.homeX.sessionNote}
            </Text>
            <Pressable
              onPress={() => {
                tap();
                router.push("/session" as never);
              }}
              accessibilityRole="button"
              accessibilityLabel={sessionDone ? t.homeX.sessionAgain : t.today.start}
              style={({ pressed }) => ({
                marginTop: 18,
                minHeight: 56,
                borderRadius: 16,
                backgroundColor: sessionDone ? c.surface : c.brand,
                borderWidth: sessionDone ? 1.5 : 0,
                borderColor: c.line,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: c.brand,
                shadowOpacity: sessionDone ? 0 : 0.45,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: sessionDone ? c.ink : c.onBrand }}>
                {sessionDone ? t.homeX.sessionAgain : t.today.start}
              </Text>
            </Pressable>
          </View>

          {/* ЧЕСТНЫЕ ЧАСЫ · месяц — столбики недели, пустой день тихий */}
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 20,
              paddingHorizontal: 22,
              paddingVertical: 20,
              shadowColor: "#3c280f",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, letterSpacing: 0.9, textTransform: "uppercase", color: c.muted, opacity: 0.85 }}>
                {t.homeX.hoursLabel(monthName)}
              </Text>
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 20, letterSpacing: -0.4, color: c.ink, fontVariant: ["tabular-nums"] }}>
                {t.homeX.hoursValue(monthH, monthM)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 9, alignItems: "flex-end", height: 52, marginTop: 16 }}>
              {week.map((sec, i) => {
                const pct = sec > 0 ? Math.max(0.18, sec / weekMax) : 0.14;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.round(pct * 100)}%`,
                      borderRadius: 5,
                      backgroundColor: sec > 0 ? c.brand : c.brandSoft,
                    }}
                  />
                );
              })}
            </View>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, color: c.muted, opacity: 0.7, marginTop: 12 }}>
              {t.homeX.hoursNote}
            </Text>
          </View>

          {/* SRS — «Пора вернуть слова», без долга и красного */}
          <Pressable
            onPress={() => {
              tap();
              router.push((srs.produceDue > 0 ? "/produce" : "/vocab") as never);
            }}
            accessibilityRole="button"
            accessibilityLabel={srs.produceDue > 0 ? t.homeX.srsTitle : t.homeX.srsVocabTitle}
            style={({ pressed }) => ({
              backgroundColor: c.warnSoft,
              borderRadius: 20,
              paddingHorizontal: 22,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                backgroundColor: sk.sounds,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 18, color: c.onBrand }}>
                {srs.produceDue > 0 ? srs.produceDue : "Aa"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
                {srs.produceDue > 0 ? t.homeX.srsTitle : t.homeX.srsVocabTitle}
              </Text>
              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, color: c.muted, opacity: 0.85, marginTop: 2 }}>
                {srs.produceDue > 0 ? t.homeX.srsNote(srs.produceDue) : t.homeX.srsVocabNote}
              </Text>
            </View>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 22, color: sk.sounds }}>›</Text>
          </Pressable>
        </>
      )}

      {/* Стражи пути: психологическая поддержка (по детектору, ≤1/день) */}
      <GuardianCard />

      {/* Сообщество/тренер рядом — одной строкой */}
      <Pressable
        onPress={() => {
          tap();
          router.push("/coach" as never);
        }}
        accessibilityRole="button"
        accessibilityLabel={t.coachX.liveTitle}
        style={({ pressed }) => ({
          flexDirection: "row",
          gap: 11,
          alignItems: "center",
          backgroundColor: c.brandSoft,
          borderRadius: 16,
          paddingHorizontal: 18,
          paddingVertical: 14,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ flex: 1, fontFamily: "GolosText_500Medium", fontSize: 14, lineHeight: 20, color: c.brandInk }}>
          {t.homeX.communityLine}
        </Text>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14.5, color: c.brandD }}>
          {t.homeX.communityCta}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
