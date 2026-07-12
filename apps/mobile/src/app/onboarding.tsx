import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  NATIVE_LANGUAGES,
  GOALS,
  LEVELS,
  INTEREST_GROUPS,
  type LangCode,
} from "@ie/core/data/catalog";
import { usePrefs, savePrefs } from "@ie/core/prefs";
import { HOURS_PER_LEVEL } from "@ie/core/outcome";
import {
  buildCheckItems,
  scoreCheck,
  type CheckLevel,
  type CheckResult,
  type RawWord,
} from "@ie/core/levelcheck";
import { speakEnglish } from "@ie/media/speech";
import b1 from "@ie/core/data/vocab-b1.json";
import b2 from "@ie/core/data/vocab-b2.json";
import c1 from "@ie/core/data/vocab-c1.json";
import { dict, type UiLang } from "@/lib/i18n";
import { saveGoal, domainFromLegacyGoal, hoursBudget, type Goal as LifeGoal, type Level } from "@ie/core/goal";
import { useMarina } from "@/theme";

// Онбординг-квиз: не анкета, а первый урок доверия. Чередуем вопросы и
// ФАКТ-экраны: наука (Cambridge ≈200 ч/уровень), авторы метода (Лозанов,
// Петрусинский, Крашен; моторно-фонетический канал — без имён в UI),
// навыки-каналы. Тон: «приложение про результат, не про очки». Всё — ru/en.

type Step =
  | "welcome"
  | "lang"
  | "hours"
  | "goal"
  | "method"
  | "interests"
  | "skills"
  | "level"
  | "deadline"
  | "summary";

// Цель-first (аудит §13): сначала «зачем в жизни», потом «сколько времени».
const FLOW: Step[] = [
  "welcome",
  "lang",
  "goal",
  "hours",
  "method",
  "interests",
  "skills",
  "level",
  "deadline",
  "summary",
];

const DAILY_OPTIONS = [15, 30, 60, 120];

// Именительный падеж: дата без числа дня («≈ февраль 2027»).
const MONTHS_RU = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthsFor(min: number): number {
  return Math.max(1, Math.round((HOURS_PER_LEVEL * 60) / min / 30.4));
}

function etaLabel(min: number, lang: UiLang): string {
  const d = new Date(Date.now() + monthsFor(min) * 30.4 * 24 * 3600 * 1000);
  return lang === "en"
    ? `≈ ${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}`
    : `≈ ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

/** Фраза «ага-момента» по уровню (перевод — на родном языке ученицы). */
const AHA: Record<string, { en: string; ru: string }> = {
  a1: { en: "You are here. And this is your English.", ru: "Ты здесь. И это — твой английский." },
  a2: { en: "You are here. And this is your English.", ru: "Ты здесь. И это — твой английский." },
  b1: { en: "Your brain already knows more English than you think.", ru: "Твой мозг уже знает больше английского, чем ты думаешь." },
  b2: { en: "Everything you understand today becomes yours tomorrow.", ru: "Всё, что ты понимаешь сегодня, завтра становится твоим." },
  c1: { en: "Fluency is not a talent — it is a rhythm you are about to enter.", ru: "Беглость — не талант, а ритм, в который ты сейчас входишь." },
  c2: { en: "Fluency is not a talent — it is a rhythm you are about to enter.", ru: "Беглость — не талант, а ритм, в который ты сейчас входишь." },
};

export default function Onboarding() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const prefs = usePrefs();

  const uiLang: UiLang = prefs?.uiLang === "en" ? "en" : "ru";
  const t = dict(uiLang);
  const en = uiLang === "en";

  const [stepIdx, setStepIdx] = useState(0);
  const step = FLOW[stepIdx];

  const [nativeLang, setNativeLang] = useState<LangCode>(prefs?.nativeLang ?? "ru");
  const [langOpen, setLangOpen] = useState(false);
  const [dailyMin, setDailyMin] = useState(prefs?.dailyGoalMin ?? 30);
  const [goal, setGoal] = useState(prefs?.goal ?? "");
  const [topics, setTopics] = useState<string[]>(prefs?.topics ?? []);
  const [level, setLevel] = useState(prefs?.level ?? "");
  const [deadlineMonths, setDeadlineMonths] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [aha, setAha] = useState(false);

  const curLang = NATIVE_LANGUAGES.find((l) => l.code === nativeLang) ?? NATIVE_LANGUAGES[0];

  // Честный бюджет часов до цели (Cambridge GLH) — для summary.
  const budget = (() => {
    const lvl = ((level || "b1") as Level);
    const order: Level[] = ["a1", "a2", "b1", "b2", "c1", "c2"];
    const target = order[Math.min(order.indexOf(lvl) + 1, order.length - 1)];
    const g: LifeGoal = {
      lifeGoal: goal,
      domain: domainFromLegacyGoal(goal),
      currentLevel: lvl,
      targetLevel: target,
      deadline: deadlineMonths
        ? new Date(Date.now() + deadlineMonths * 30.4 * 24 * 3600 * 1000).toISOString()
        : undefined,
      weeklyMinutes: dailyMin * 7,
    };
    return hoursBudget(g);
  })();

  const canNext =
    step === "lang" ? !!nativeLang
    : step === "goal" ? !!goal
    : step === "interests" ? topics.length > 0
    : step === "level" ? !!level
    : true;

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function toggleTopic(id: string) {
    tap();
    setTopics((ts) => (ts.includes(id) ? ts.filter((x) => x !== id) : [...ts, id]));
  }

  function next() {
    tap();
    if (stepIdx < FLOW.length - 1) {
      setStepIdx((i) => i + 1);
      return;
    }
    savePrefs({
      nativeLang,
      uiLang,
      goal,
      topics,
      level,
      dailyGoalMin: dailyMin,
    });
    // Цель-first (Фаза B): рядом с prefs сохраняем Goal — домен, уровни,
    // недельный бюджет. Полный цель-first онбординг заменит это поле честнее.
    const lvl = ((level || "b1") as Level);
    const order: Level[] = ["a1", "a2", "b1", "b2", "c1", "c2"];
    const target = order[Math.min(order.indexOf(lvl) + 1, order.length - 1)];
    const goalObj = GOALS.find((g) => g.id === goal);
    saveGoal({
      lifeGoal: goalObj ? (uiLang === "en" ? goalObj.titleEn : goalObj.title) : goal,
      domain: domainFromLegacyGoal(goal),
      currentLevel: lvl,
      targetLevel: target,
      deadline: deadlineMonths
        ? new Date(Date.now() + deadlineMonths * 30.4 * 24 * 3600 * 1000).toISOString()
        : undefined,
      weeklyMinutes: dailyMin * 7,
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAha(true);
  }

  function back() {
    tap();
    setStepIdx((i) => Math.max(0, i - 1));
  }

  function finish() {
    tap();
    router.replace("/");
  }

  if (aha) return <AhaMoment level={level} onDone={finish} />;

  const levelTitle = (id: string) => {
    const l = LEVELS.find((x) => x.id === id);
    return l ? (en ? l.titleEn : l.title) : id.toUpperCase();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      {/* Прогресс квиза */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="sparkles" size={15} color={c.brand} />
          </View>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.ink }}>
            {t.onb.title}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {FLOW.map((s, i) => (
            <View
              key={s}
              style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= stepIdx ? c.brand : c.line }}
            />
          ))}
        </View>
      </View>

      {checking ? (
        <LevelCheck
          uiLang={uiLang}
          onDone={(lvl) => {
            setLevel(lvl);
            setChecking(false);
          }}
          onCancel={() => setChecking(false)}
        />
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 10 }}>
            <StepFade key={step}>
              {step === "welcome" && (
                <View style={{ gap: 14 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="compass" size={28} color={c.brand} />
                  </View>
                  <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 27, lineHeight: 34, color: c.ink }}>
                    {t.onb.welcomeTitle}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 23, color: c.ink }}>
                    {t.onb.welcomeBody}
                  </Text>
                  <View style={{ backgroundColor: c.brandSoft, borderRadius: radius.soft, padding: 14 }}>
                    <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 20, color: c.brandInk }}>
                      {t.onb.welcomeScience}
                    </Text>
                  </View>
                </View>
              )}

              {step === "lang" && (
                <Section title={t.onb.qLangTitle} note={t.onb.qLangNote}>
                  <Pressable
                    onPress={() => {
                      tap();
                      setLangOpen(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.onb.qLangSheet}: ${curLang.native}`}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      minHeight: 72,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderRadius: radius.soft,
                      borderWidth: 1,
                      borderColor: c.brand,
                      backgroundColor: c.brandSoft,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Text style={{ fontSize: 30 }}>{curLang.flag}</Text>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 18, color: c.ink }}>
                        {curLang.native}
                      </Text>
                      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>
                        {t.onb.qLangHint}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }}>
                      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13, color: c.brand }}>
                        {t.onb.qLangChange}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={c.brand} />
                    </View>
                  </Pressable>
                </Section>
              )}

              {step === "hours" && (
                <View style={{ gap: 12 }}>
                  <FactBadge />
                  <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, lineHeight: 30, color: c.ink }}>
                    {t.onb.factHoursTitle}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.ink }}>
                    {t.onb.factHoursBody}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.ink, marginTop: 6 }}>
                    {t.onb.factHoursAsk}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {DAILY_OPTIONS.map((m) => {
                      const on = m === dailyMin;
                      return (
                        <Pressable
                          key={m}
                          onPress={() => {
                            tap();
                            setDailyMin(m);
                          }}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          style={({ pressed }) => ({
                            flex: 1,
                            minHeight: 52,
                            borderRadius: 14,
                            borderWidth: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            borderColor: on ? c.brand : c.line,
                            backgroundColor: on ? c.brand : c.surface,
                            transform: [{ scale: pressed ? 0.97 : 1 }],
                          })}
                        >
                          <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: on ? c.onBrand : c.ink }}>
                            {m}
                          </Text>
                          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 10, color: on ? c.onBrand : c.muted }}>
                            {t.common.minutes}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={{ backgroundColor: c.brandSoft, borderRadius: radius.soft, padding: 14, gap: 4 }}>
                    <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.brandInk }}>
                      {t.onb.factHoursResult(dailyMin, monthsFor(dailyMin))}
                    </Text>
                    <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 17, color: c.brandInk }}>
                      {t.onb.factHoursNote}
                    </Text>
                  </View>
                </View>
              )}

              {step === "goal" && (
                <Section title={t.onb.qGoalTitle} note={t.onb.qGoalNote}>
                  {GOALS.map((g) => (
                    <OptionRow
                      key={g.id}
                      active={goal === g.id}
                      onPress={() => {
                        tap();
                        setGoal(g.id);
                      }}
                      title={en ? g.titleEn : g.title}
                      desc={en ? undefined : g.desc}
                    />
                  ))}
                </Section>
              )}

              {step === "method" && (
                <View style={{ gap: 12 }}>
                  <FactBadge />
                  <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, lineHeight: 30, color: c.ink }}>
                    {t.onb.factMethodTitle}
                  </Text>
                  {t.onb.factMethodItems.map((m) => (
                    <View key={m.name} style={{ backgroundColor: c.surface, borderRadius: radius.soft, borderWidth: 1, borderColor: c.line, padding: 14, gap: 4 }}>
                      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.brandD }}>
                        {m.name}
                      </Text>
                      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19.5, color: c.ink }}>
                        {m.text}
                      </Text>
                    </View>
                  ))}
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted, fontStyle: "italic" }}>
                    {t.onb.factMethodFoot}
                  </Text>
                </View>
              )}

              {step === "interests" && (
                <Section title={t.onb.qInterestsTitle} note={t.onb.qInterestsNote}>
                  <View style={{ gap: 14 }}>
                    {INTEREST_GROUPS.map((g) => (
                      <View key={g.id} style={{ gap: 8 }}>
                        <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: c.muted }}>
                          {en ? g.titleEn : g.title}
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                          {g.items.map((it) => {
                            const on = topics.includes(it.id);
                            return (
                              <Pressable
                                key={it.id}
                                onPress={() => toggleTopic(it.id)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: on }}
                                style={({ pressed }) => ({
                                  minHeight: 44,
                                  borderRadius: 22,
                                  borderWidth: 1,
                                  paddingHorizontal: 14,
                                  justifyContent: "center",
                                  borderColor: on ? c.brand : c.line,
                                  backgroundColor: on ? c.brand : c.surface,
                                  transform: [{ scale: pressed ? 0.97 : 1 }],
                                })}
                              >
                                <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: on ? c.onBrand : c.ink }}>
                                  {en ? it.titleEn : it.title}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {step === "skills" && (
                <View style={{ gap: 12 }}>
                  <FactBadge />
                  <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, lineHeight: 30, color: c.ink }}>
                    {t.onb.factSkillsTitle}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.ink }}>
                    {t.onb.factSkillsBody}
                  </Text>
                  <View style={{ gap: 8 }}>
                    {t.onb.factSkillsItems.map((s) => (
                      <View key={s.text} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: radius.soft, borderWidth: 1, borderColor: c.line, paddingHorizontal: 14, minHeight: 52 }}>
                        <Ionicons name={s.icon as never} size={19} color={c.brand} />
                        <Text style={{ flex: 1, fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 19, color: c.ink }}>
                          {s.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {step === "level" && (
                <Section title={t.onb.qLevelTitle} note={t.onb.qLevelNote}>
                  {LEVELS.map((l) => (
                    <OptionRow
                      key={l.id}
                      active={level === l.id}
                      onPress={() => {
                        tap();
                        setLevel(l.id);
                      }}
                      title={en ? l.titleEn : l.title}
                      desc={en ? undefined : l.desc}
                    />
                  ))}
                  <Pressable
                    onPress={() => {
                      tap();
                      setChecking(true);
                    }}
                    accessibilityRole="button"
                    style={({ pressed }) => ({
                      minHeight: 52,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: c.brand,
                      backgroundColor: c.brandSoft,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                      marginTop: 4,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Ionicons name="sparkles" size={16} color={c.brandD} />
                    <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.brandD }}>
                      {t.onb.qLevelCheckCta}
                    </Text>
                  </Pressable>
                </Section>
              )}

              {step === "deadline" && (
                <View style={{ gap: 12 }}>
                  <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 26, lineHeight: 32, color: c.ink }}>
                    {t.onb.qDeadlineTitle}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted }}>
                    {t.onb.qDeadlineNote}
                  </Text>
                  <View style={{ gap: 10 }}>
                    {[6, 9, 12].map((m) => (
                      <Pressable
                        key={m}
                        onPress={() => { tap(); setDeadlineMonths(m); }}
                        accessibilityRole="button"
                        style={({ pressed }) => ({
                          minHeight: 54,
                          borderRadius: radius.soft,
                          borderWidth: 2,
                          borderColor: deadlineMonths === m ? c.brand : c.line,
                          backgroundColor: deadlineMonths === m ? c.brandSoft : pressed ? c.brandSoft : c.surface,
                          paddingHorizontal: 16,
                          justifyContent: "center",
                        })}
                      >
                        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
                          {t.onb.deadlineOpt(m)}
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => { tap(); setDeadlineMonths(null); }}
                      accessibilityRole="button"
                      style={({ pressed }) => ({
                        minHeight: 54,
                        borderRadius: radius.soft,
                        borderWidth: 2,
                        borderColor: deadlineMonths === null ? c.brand : c.line,
                        backgroundColor: deadlineMonths === null ? c.brandSoft : pressed ? c.brandSoft : c.surface,
                        paddingHorizontal: 16,
                        justifyContent: "center",
                      })}
                    >
                      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
                        {t.onb.deadlineNone}
                      </Text>
                      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>
                        {t.onb.deadlineNoneNote}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {step === "summary" && (
                <View style={{ gap: 12 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="checkmark" size={28} color={c.brand} />
                  </View>
                  <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 26, lineHeight: 32, color: c.ink }}>
                    {t.onb.summaryTitle}
                  </Text>
                  <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, paddingHorizontal: 16 }}>
                    <SummaryRow first label={t.onb.summaryLevel} value={levelTitle(level)} />
                    <SummaryRow
                      label={t.onb.summaryTarget}
                      value={levelTitle(
                        ["a1","a2","b1","b2","c1","c2"][
                          Math.min(["a1","a2","b1","b2","c1","c2"].indexOf(level) + 1, 5)
                        ] ?? "b2"
                      )}
                    />
                    <SummaryRow label={t.onb.summaryPace} value={t.onb.summaryDaily(dailyMin)} />
                    <SummaryRow label={t.onb.summaryEta} value={etaLabel(dailyMin, uiLang)} />
                    <SummaryRow label={t.onb.summaryBudget} value={t.onb.summaryBudgetVal(budget.range[0], budget.range[1])} />
                  </View>
                  {budget.weeklyMinutesForDeadline !== null &&
                    budget.weeklyMinutesForDeadline > dailyMin * 7 && (
                      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.accent }}>
                        {t.onb.summaryDeadlinePace(Math.ceil(budget.weeklyMinutesForDeadline / 7 / 5) * 5)}
                      </Text>
                    )}
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted }}>
                    {t.onb.summaryFoot}
                  </Text>
                </View>
              )}
            </StepFade>
          </ScrollView>

          <LanguageSheet
            open={langOpen}
            value={nativeLang}
            title={t.onb.qLangSheet}
            onSelect={(code) => {
              tap();
              setNativeLang(code);
              setLangOpen(false);
            }}
            onClose={() => setLangOpen(false)}
          />

          {/* Навигация */}
          <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 12, backgroundColor: c.bg }}>
            {stepIdx > 0 && (
              <Pressable
                onPress={back}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: c.line,
                  backgroundColor: c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.muted }}>
                  {t.common.back}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={next}
              disabled={!canNext}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 54,
                borderRadius: 16,
                backgroundColor: c.brand,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                opacity: canNext ? 1 : 0.45,
                transform: [{ scale: pressed && canNext ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.onBrand }}>
                {step === "welcome"
                  ? t.onb.welcomeCta
                  : step === "summary"
                    ? t.onb.summaryCta
                    : t.common.next}
              </Text>
              <Ionicons
                name={step === "summary" ? "checkmark" : "arrow-forward"}
                size={18}
                color={c.onBrand}
              />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

/* ---------- Бейдж факт-экрана ---------- */

function FactBadge() {
  const { c } = useMarina();
  const prefs = usePrefs();
  const t = dict(prefs?.uiLang === "en" ? "en" : "ru");
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: c.warnSoft, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Ionicons name="flask" size={13} color={c.warn} />
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 11, color: c.warn, letterSpacing: 0.4, textTransform: "uppercase" }}>
        {t.onb.factBadge}
      </Text>
    </View>
  );
}

/* ---------- Мини-определение уровня (18 слов, логика @ie/core) ---------- */

function LevelCheck({
  uiLang,
  onDone,
  onCancel,
}: {
  uiLang: UiLang;
  onDone: (level: string) => void;
  onCancel: () => void;
}) {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const t = dict(uiLang);
  const en = uiLang === "en";
  const words = useMemo(
    () => buildCheckItems({ b1: b1 as RawWord[], b2: b2 as RawWord[], c1: c1 as RawWord[] }),
    []
  );
  const [i, setI] = useState(0);
  const [known, setKnown] = useState<Record<CheckLevel, number>>({ b1: 0, b2: 0, c1: 0 });
  const [fakes, setFakes] = useState(0);

  const finished = i >= words.length;
  const result: CheckResult | null = finished ? scoreCheck(known, fakes) : null;
  const item = finished ? null : words[i];

  function answer(yes: boolean) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (yes && item) {
      if (item.kind === "fake") setFakes((f) => f + 1);
      else setKnown((k) => ({ ...k, [item.lvl]: k[item.lvl] + 1 }));
    }
    setI((p) => p + 1);
  }

  useEffect(() => {
    if (finished) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [finished]);

  if (finished && result) {
    const lv = LEVELS.find((l) => l.id === result.level);
    const title = lv ? (en ? lv.titleEn : lv.title) : result.level.toUpperCase();
    const note = result.unreliable
      ? t.onb.checkUnreliable
      : result.cappedHigh
        ? t.onb.checkCapped
        : `${title}. ${t.onb.checkResultNote}`;
    return (
      <View style={{ flex: 1, padding: 20, paddingBottom: insets.bottom + 12 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="checkmark" size={30} color={c.brand} />
          </View>
          <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, color: c.ink, textAlign: "center" }}>
            {t.onb.checkResult(result.level.toUpperCase())}
          </Text>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
            {note}
          </Text>
        </View>
        <Pressable
          onPress={() => onDone(result.level)}
          accessibilityRole="button"
          style={({ pressed }) => ({
            minHeight: 54,
            borderRadius: 16,
            backgroundColor: c.brand,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.onBrand }}>
            {t.onb.checkAccept}
          </Text>
          <Ionicons name="checkmark" size={18} color={c.onBrand} />
        </Pressable>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={{ minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 6 }}
        >
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.muted }}>
            {t.onb.checkManual}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!item) return null;

  return (
    <View style={{ flex: 1, padding: 20, paddingBottom: insets.bottom + 12, gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted, flex: 1 }}>
          {t.onb.checkHint}
        </Text>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.ink, fontVariant: ["tabular-nums"] }}>
          {i + 1} / {words.length}
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
        <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 36, color: c.ink, textAlign: "center" }}>
          {item.w.en}
        </Text>
        <Pressable
          onPress={() => speakEnglish(item.w.en, { interrupt: true })}
          accessibilityRole="button"
          accessibilityLabel={t.onb.speakWord}
          hitSlop={10}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, opacity: pressed ? 0.6 : 1, minHeight: 44 })}
        >
          <Ionicons name="volume-medium" size={18} color={c.muted} />
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted }}>
            {item.w.ipa}
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={() => answer(false)}
          accessibilityRole="button"
          style={({ pressed }) => ({ flex: 1, minHeight: 56, borderRadius: 16, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
        >
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.muted }}>
            {t.onb.checkNotYet}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => answer(true)}
          accessibilityRole="button"
          style={({ pressed }) => ({ flex: 1, minHeight: 56, borderRadius: 16, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, transform: [{ scale: pressed ? 0.98 : 1 }] })}
        >
          <Ionicons name="checkmark" size={18} color={c.onBrand} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.onBrand }}>
            {t.onb.checkKnow}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={onCancel} accessibilityRole="button" style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>
          {t.onb.checkBack}
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- «Ага-момент» ---------- */

function AhaMoment({ level, onDone }: { level: string; onDone: () => void }) {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const phrase = AHA[level] ?? AHA.b1;

  useEffect(() => {
    const t = setTimeout(() => {
      speakEnglish(phrase.en, {});
    }, 600);
    return () => clearTimeout(t);
  }, [phrase.en]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="ear" size={28} color={c.brand} />
        </View>
        <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 24, gap: 14, alignSelf: "stretch" }}>
          <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 25, lineHeight: 34, color: c.ink, textAlign: "center" }}>
            {phrase.en}
          </Text>
          <Pressable
            onPress={() => speakEnglish(phrase.en, { interrupt: true })}
            accessibilityRole="button"
            style={({ pressed }) => ({ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, paddingHorizontal: 16, borderRadius: 22, backgroundColor: c.brandSoft, opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons name="volume-high" size={18} color={c.brandD} />
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13, color: c.brandD }}>
              ещё раз · again
            </Text>
          </Pressable>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center" }}>
            {phrase.ru}
          </Text>
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
          Ты только что поняла английский — без словаря и без напряжения. Так и будет каждый
          день: понятный вход, маленький шаг, большой массив.
        </Text>
      </View>
      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        style={({ pressed }) => ({ minHeight: 56, borderRadius: 16, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, transform: [{ scale: pressed ? 0.98 : 1 }] })}
      >
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.onBrand }}>
          В приложение · Let's go
        </Text>
        <Ionicons name="arrow-forward" size={18} color={c.onBrand} />
      </Pressable>
    </View>
  );
}

/* ---------- Шторка выбора языка ---------- */

function LanguageSheet({
  open,
  value,
  title,
  onSelect,
  onClose,
}: {
  open: boolean;
  value: LangCode;
  title: string;
  onSelect: (code: LangCode) => void;
  onClose: () => void;
}) {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(8,20,20,0.55)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={title} />
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "75%", paddingBottom: insets.bottom + 8 }}>
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: c.line, marginTop: 10 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 18, color: c.ink }}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="close" size={18} color={c.brandD} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            {NATIVE_LANGUAGES.map((l) => {
              const active = l.code === value;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => onSelect(l.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    minHeight: 54,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: pressed || active ? c.brandSoft : "transparent",
                  })}
                >
                  <Text style={{ fontSize: 24 }}>{l.flag}</Text>
                  <Text style={{ flex: 1, fontFamily: active ? "GolosText_700Bold" : "GolosText_400Regular", fontSize: 16, color: c.ink }}>
                    {l.native}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={22} color={c.brand} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Плавное появление шага ---------- */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        if (alive) setReduced(!!v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v) => setReduced(!!v));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduced;
}

function StepFade({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      anim.setValue(1);
      return;
    }
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [anim, reduced]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/* ---------- Мелкие блоки ---------- */

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  const { c } = useMarina();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 6, marginBottom: 4 }}>
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 24, lineHeight: 30, color: c.ink }}>
          {title}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
          {note}
        </Text>
      </View>
      {children}
    </View>
  );
}

function OptionRow({
  active,
  title,
  desc,
  onPress,
}: {
  active: boolean;
  title: string;
  desc?: string;
  onPress: () => void;
}) {
  const { c, radius } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 56,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.soft,
        borderWidth: 1,
        borderColor: active ? c.brand : c.line,
        backgroundColor: active ? c.brandSoft : c.surface,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.ink }}>{title}</Text>
        {desc ? (
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>{desc}</Text>
        ) : null}
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: active ? c.brand : c.line,
          backgroundColor: active ? c.brand : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {active && <Ionicons name="checkmark" size={14} color={c.onBrand} />}
      </View>
    </Pressable>
  );
}

function SummaryRow({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  const { c } = useMarina();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 13,
        gap: 12,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: c.line,
      }}
    >
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted }}>{label}</Text>
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.ink, textAlign: "right", flexShrink: 1 }}>
        {value}
      </Text>
    </View>
  );
}
