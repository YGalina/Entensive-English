import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePrefs, updatePrefs } from "@ie/core/prefs";
import { useTimeStats, useStreak } from "@ie/core/timelog";
import { useOutcome, HOURS_PER_LEVEL } from "@ie/core/outcome";
import { GOALS, LEVELS } from "@ie/core/data/catalog";
import { speakEnglish } from "@ie/media/speech";
import { useT } from "@/lib/i18n";
import { useMarina, useThemePref, setThemePref, type ThemePref } from "@/theme";
import { Breton } from "@/components/breton";

// Профиль: кто я в программе, куда иду и как настроено моё пространство.
// Тон — по методу: цифры честные (из реальной практики), пропуски не стыдим.

const MONTHS_RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(d: Date, en = false): string {
  return en
    ? `${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    : `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

/** Вехи постоянства: мягкие, без «сгоревших» состояний. */
const MILESTONES = [3, 7, 14, 30];

export default function ProfileScreen() {
  const { c, sk, radius, mode } = useMarina();
  const themePref = useThemePref();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const prefs = usePrefs();
  const time = useTimeStats();
  const streak = useStreak();
  const outcome = useOutcome();
  const { t, lang } = useT();
  const en = lang === "en";
  const [speaking, setSpeaking] = useState(false);

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function testVoice() {
    tap();
    setSpeaking(true);
    speakEnglish("Hello! I am your English voice. Let’s learn together.", {
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  const goalObj = GOALS.find((g) => g.id === prefs?.goal);
  const goalTitle = goalObj ? (en ? goalObj.titleEn : goalObj.title) : t.profile.afterSetup;
  const levelTitle = prefs?.level ? prefs.level.toUpperCase() : t.profile.afterSetup;

  // «Если заниматься X минут в день» — месяцы до следующего уровня.
  const monthsAt = (minPerDay: number) =>
    Math.max(1, Math.round((HOURS_PER_LEVEL * 60) / minPerDay / 30.4));

  const uiLang = prefs?.uiLang === "en" ? "en" : "ru";

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
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.ink }}>
        {t.profile.title}
      </Text>
      <Breton red />

      {/* ---------- Я в программе ---------- */}
      <Card title={t.profile.myCourse}>
        <Row first label={t.profile.levelNow} value={levelTitle} />
        <Row label={t.profile.goal} value={goalTitle} />
        <Row
          label={t.profile.dailyPlan}
          value={prefs?.dailyGoalMin ? t.profile.dailyPlanVal(prefs.dailyGoalMin) : t.profile.inSetup}
        />
        <Row label={t.profile.hours} value={outcome.hoursDone.toFixed(1)} />
        <Row label={t.profile.days} value={String(outcome.daysPracticed)} />
      </Card>

      {/* ---------- Программа и ожидаемый результат ---------- */}
      <Card title={t.profile.program}>
        {/* Прогресс к уровню — крупно, в языке Welltory */}
        <View style={{ paddingVertical: 14, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 34, color: c.accent, fontVariant: ["tabular-nums"] }}>
              {outcome.pct}%
            </Text>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: c.ink }}>
              {outcome.levelNow.toUpperCase()} → {outcome.levelNext.toUpperCase()}
            </Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c.brandSoft, overflow: "hidden" }}>
            <View style={{ width: `${outcome.pct}%`, height: 8, borderRadius: 4, backgroundColor: c.accent }} />
          </View>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted, fontVariant: ["tabular-nums"] }}>
            {t.profile.progressCaption(Number(outcome.hoursDone.toFixed(0)), outcome.hoursGoal, HOURS_PER_LEVEL)}
          </Text>
        </View>
        <Row
          label={t.profile.pace7}
          value={outcome.paceMinPerDay > 0 ? t.profile.paceVal(outcome.paceMinPerDay) : t.profile.paceGathering}
        />
        <Row
          label={t.profile.forecast}
          value={outcome.levelEta ? fmtDate(outcome.levelEta, en) : t.profile.needPace}
        />
        <Row
          label={t.profile.wordsRecog}
          value={t.profile.wordsVal(outcome.wordsLearned, outcome.wordsTarget)}
        />
        <Row
          label={t.profile.speechSelf}
          value={outcome.speechEta ? `≈ ${fmtDate(outcome.speechEta, en)}` : t.profile.speechFrom}
        />
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, color: c.muted, paddingVertical: 10 }}>
          {t.profile.benchmarks(monthsAt(30), monthsAt(60), monthsAt(120))}
        </Text>
      </Card>

      {/* ---------- Постоянство (мягкие ачивки) ---------- */}
      <Card title={t.profile.consistency}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: c.brandSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="flame" size={22} color={c.sun} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: c.ink }}>
              {streak > 0 ? t.profile.streakN(streak, plural(streak, ...t.profile.dayWords)) : t.profile.streakStart}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
              {t.profile.regular}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 12 }}>
          {MILESTONES.map((m) => {
            const got = streak >= m;
            return (
              <View
                key={m}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: got ? c.sun : c.line,
                  backgroundColor: got ? c.warnSoft : c.surface,
                }}
              >
                <Ionicons name={got ? "star" : "star-outline"} size={13} color={got ? c.sun : c.muted} />
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: got ? c.ink : c.muted }}>
                  {m} {plural(m, ...t.profile.dayWords)}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, color: c.muted, paddingBottom: 12 }}>
          {t.profile.noBurn}
        </Text>
      </Card>

      {/* ---------- Интерфейс ---------- */}
      <Card title={t.profile.ui}>
        <ChoiceRow
          label={t.profile.appLang}
          options={[
            { id: "ru", title: "Русский" },
            { id: "en", title: "English" },
          ]}
          value={uiLang}
          onPick={(id) => {
            tap();
            updatePrefs({ uiLang: id as "ru" | "en" });
          }}
        />
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16, color: c.muted, paddingBottom: 8 }}>
          {t.profile.langNote}
        </Text>
        <ChoiceRow
          label={t.profile.theme}
          options={[
            { id: "system", title: t.profile.themeSystem },
            { id: "light", title: t.profile.themeLight },
            { id: "dark", title: t.profile.themeDark },
          ]}
          value={themePref}
          onPick={(id) => {
            tap();
            setThemePref(id as ThemePref);
          }}
        />
        <Row label={t.profile.themeNow} value={mode === "dark" ? t.profile.themeNowDark : t.profile.themeNowLight} />
      </Card>

      {/* ---------- Действия ---------- */}
      <Pressable
        onPress={testVoice}
        disabled={speaking}
        accessibilityRole="button"
        accessibilityLabel={t.profile.testVoiceA11y}
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: 16,
          backgroundColor: c.accent,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: speaking ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="volume-high" size={20} color="#ffffff" />
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: "#ffffff" }}>
          {speaking ? t.profile.speaking : t.profile.testVoice}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          tap();
          router.push("/onboarding");
        }}
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.surface,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="options" size={18} color={c.brand} />
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.brand }}>
          {t.profile.redo}
        </Text>
      </Pressable>

      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, color: c.muted }}>
        {t.profile.foot}
      </Text>
    </ScrollView>
  );
}

/* ---------- Мелкие блоки ---------- */

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  const { c, radius } = useMarina();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>{title}</Text>
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          paddingHorizontal: 16,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  const { c } = useMarina();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        gap: 12,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: c.line,
      }}
    >
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.muted, flexShrink: 0 }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
          color: c.ink,
          textAlign: "right",
          flexShrink: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: { id: string; title: string }[];
  value: string;
  onPick: (id: string) => void;
}) {
  const { c } = useMarina();
  return (
    <View style={{ paddingVertical: 12, gap: 8 }}>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.muted }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <Pressable
              key={o.id}
              onPress={() => onPick(o.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => ({
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: 22,
                borderWidth: 1,
                justifyContent: "center",
                borderColor: on ? c.brand : c.line,
                backgroundColor: on ? c.brand : c.surface,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  color: on ? c.onBrand : c.ink,
                }}
              >
                {o.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
