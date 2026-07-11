import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { useOutputStats } from "@ie/core/output";
import { useSrsStats } from "@ie/core/srs";
import { useOutcome } from "@ie/core/outcome";
import { usePrefs } from "@ie/core/prefs";
import { sessionLevelLabel } from "@ie/core/data/levelVocab";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";
import { GuardianCard } from "@/components/guardian-card";

// «Сегодня» — макет 24a/v2 + 13_app_logic §3.1: ОДИН следующий шаг.
// Утром: большая карточка «Сессия дня» (единственный терракотовый CTA),
// честные часы до уровня, малая карточка SRS «Пора вернуть слова» и вечерний
// вход. Вечером экран сам меняется: сделанное сворачивается, остаётся статус
// дня. Без стриков и огоньков; без легаси-входов phrase/roles/3-минутки.

// «Набор» — принципиально только web (виртуальная клавиатура не тренирует
// пальцевую память); на мобильном шаг не показываем.
const WEB_ONLY_STEPS = new Set(["typing"]);

const MONTHS_DAT_RU = ["к январю","к февралю","к марту","к апрелю","к маю","к июню","к июлю","к августу","к сентябрю","к октябрю","к ноябрю","к декабрю"];
const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS_RU = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const WEEKDAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS_GEN_RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

export default function TodayScreen() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plan = useDayPlan();
  const { t, lang } = useT();
  const L = lang;
  const en = L === "en";
  const outcome = useOutcome();
  const srs = useSrsStats();
  const outStats = useOutputStats();

  const prefs = usePrefs();
  const steps = plan.steps.filter((s) => !WEB_ONLY_STEPS.has(s.id));
  const current = steps.find((s) => !s.done) ?? null;

  // Главная карточка — всегда «Сессия дня» (один флоу 4 фаз), не очередной
  // шаг чек-листа: dayplan остаётся под капотом как учёт часов.
  const sessionStep = steps.find((s) => s.id === "session") ?? null;
  const sessionDone = sessionStep?.done ?? false;
  const levelLabel = sessionLevelLabel(prefs?.level);

  // Вечерний режим экрана: после 17:00 и главный шаг сделан (или всё сделано).
  const hour = new Date().getHours();
  const evening = hour >= 17;
  const eveningView = evening && (sessionDone || !current);

  const now = new Date();
  const dateLine = en
    ? `${WEEKDAYS_EN[now.getDay()]}, ${MONTHS_EN[now.getMonth()]} ${now.getDate()}`
    : `${WEEKDAYS_RU[now.getDay()]}, ${now.getDate()} ${MONTHS_GEN_RU[now.getMonth()]}`;

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // Честные часы: путь к следующему уровню (Cambridge GLH ориентир).
  const hoursPct = Math.min(1, outcome.hoursDone / Math.max(1, outcome.hoursGoal));
  const etaNote = (() => {
    if (outcome.paceMinPerDay >= 5 && outcome.levelEta) {
      const d = outcome.levelEta;
      const when = en
        ? `around ${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}`
        : `примерно ${MONTHS_DAT_RU[d.getMonth()]} ${d.getFullYear()}`;
      return t.homeX.etaPace(when);
    }
    return t.homeX.etaNoPace;
  })();


  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 14, paddingBottom: 32, gap: 13 }}
    >
      {/* Шапка: дата · Сегодня · аватар */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 15, color: c.muted }}>
            {dateLine}
          </Text>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 34, letterSpacing: -0.8, color: c.ink, marginTop: 4 }}>
            {eveningView ? t.homeX.eveningTitle : t.today.title}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            tap();
            router.push("/profile" as never);
          }}
          accessibilityRole="button"
          accessibilityLabel={t.profile.title}
          style={({ pressed }) => ({
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: c.brand,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Ionicons name="person" size={17} color={c.onBrand} />
        </Pressable>
      </View>

      {/* Честные часы до уровня */}
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 15,
          padding: 13,
          paddingHorizontal: 15,
          shadowColor: "#3c280f",
          shadowOpacity: 0.14,
          shadowRadius: 11,
          shadowOffset: { width: 0, height: 5 },
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12.5, letterSpacing: 0.8, textTransform: "uppercase", color: c.muted }}>
            {t.homeX.pathTo(outcome.levelNext.toUpperCase())}
          </Text>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.ink, fontVariant: ["tabular-nums"] }}>
            {t.homeX.hoursOf(Math.round(outcome.hoursDone), outcome.hoursGoal)}
          </Text>
        </View>
        <View style={{ height: 8, borderRadius: 8, backgroundColor: c.brandSoft, marginTop: 10, overflow: "hidden", flexDirection: "row" }}>
          {/* градиент терракота→амбер двумя сегментами (без linear-gradient зависимости) */}
          <View style={{ width: `${Math.max(2, hoursPct * 60)}%`, backgroundColor: c.brand }} />
          <View style={{ width: `${hoursPct * 40}%`, backgroundColor: sk.sounds }} />
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, color: c.muted, marginTop: 9 }}>
          {etaNote}
        </Text>
      </View>

      {eveningView ? (
        <>
          {/* Вечер: сделанное сворачивается */}
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: radius.card,
              padding: 15,
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
                {s.done ? (
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="checkmark" size={15} color={c.onBrand} />
                  </View>
                ) : (
                  <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderStyle: "dashed", borderColor: c.line }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: c.ink }}>
                    {s[L].title}
                    {!s.done && ` · ${t.homeX.left}`}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, color: c.muted }} numberOfLines={1}>
                    {s.done ? s[L].note : t.homeX.leftNote}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Вечерний круг — тёмная карточка «свет лампы» */}
          <View style={{ backgroundColor: "#2e2a22", borderRadius: 18, padding: 16 }}>
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
                borderRadius: 999,
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
          {/* СЕССИЯ ДНЯ — единственный терракотовый CTA экрана (макет 24a/v2) */}
          <View
            style={{
              backgroundColor: c.surface,
              borderWidth: 2,
              borderColor: c.brand,
              borderRadius: 18,
              padding: 16,
              shadowColor: c.brand,
              shadowOpacity: 0.3,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 7 },
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", color: c.brand }}>
                {t.homeX.sessionLabel}
              </Text>
              {sessionStep && sessionStep.goalMin > 0 && (
                <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13.5, color: c.muted }}>
                  {t.homeX.min(sessionStep.goalMin)}
                </Text>
              )}
            </View>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 24, lineHeight: 29, color: c.ink, marginTop: 9 }}>
              {sessionDone ? t.homeX.sessionDoneTitle : t.homeX.sessionTitle(levelLabel)}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.muted, marginTop: 6 }}>
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
                marginTop: 16,
                minHeight: 60,
                borderRadius: 999,
                backgroundColor: sessionDone ? c.surface : c.brand,
                borderWidth: sessionDone ? 1.5 : 0,
                borderColor: c.line,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: sessionDone ? c.ink : c.onBrand }}>
                {sessionDone ? t.homeX.sessionAgain : t.today.start}
              </Text>
            </Pressable>
          </View>

          {/* Пора вернуть слова (SRS без долга) · Вечером — две малые карточки */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <SmallCard
              label={
                srs.produceDue > 0
                  ? t.homeX.srsN(srs.produceDue)
                  : t.homeX.srsVocabLabel
              }
              labelColor={c.accent}
              title={srs.produceDue > 0 ? t.homeX.srsTitle : t.homeX.srsVocabTitle}
              onPress={() => {
                tap();
                router.push((srs.produceDue > 0 ? "/produce" : "/vocab") as never);
              }}
            />
            <SmallCard
              label={t.homeX.evening(3)}
              labelColor={sk.typing}
              title={t.homeX.dayStatus}
              onPress={() => {
                tap();
                router.push("/evening" as never);
              }}
            />
          </View>

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
          borderRadius: 15,
          paddingHorizontal: 15,
          paddingVertical: 12,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Ionicons name="people" size={18} color={c.brandInk} />
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

/* ---------- Малая карточка «Потом / Вечером» ---------- */

function SmallCard({
  label,
  labelColor,
  title,
  onPress,
}: {
  label: string;
  labelColor: string;
  title: string;
  onPress: () => void;
}) {
  const { c } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${title}`}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: 14,
        padding: 12,
        paddingHorizontal: 13,
        shadowColor: "#3c280f",
        shadowOpacity: 0.12,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase", color: labelColor }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13, color: c.ink, marginTop: 3 }}>
        {title}
      </Text>
    </Pressable>
  );
}


