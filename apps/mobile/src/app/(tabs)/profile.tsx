import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { usePrefs, updatePrefs } from "@ie/core/prefs";
import { useTimeStats, useStreak } from "@ie/core/timelog";
import { useOutcome, HOURS_PER_LEVEL } from "@ie/core/outcome";
import { useOutputStats } from "@ie/core/output";
import { useSrsStats } from "@ie/core/srs";
import { capabilityProgress, domainFromLegacyGoal } from "@ie/core/goal";
import { GOALS, LEVELS } from "@ie/core/data/catalog";
import { speakEnglish } from "@ie/media/speech";
import { useT } from "@/lib/i18n";
import { useMarina, useThemePref, setThemePref, type ThemePref } from "@/theme";
import { Breton } from "@/components/breton";
import { useLoggedIn, clearSessionToken } from "@/lib/session";
import {
  apiConfigured,
  fetchMe,
  requestMagicLink,
  pushToCloud,
  pullFromCloud,
  pendingCount,
  type MeUser,
} from "@/lib/cloud";

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
  const output = useOutputStats();
  const srs = useSrsStats();
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
      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 30, color: c.ink }}>
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

      {/* ---------- Честные часы: неделя столбиками (макет «Прогресс») ---------- */}
      <WeekBars byDay={time.byDay} />

      {/* ---------- Программа и ожидаемый результат ---------- */}
      <Card title={t.profile.program}>
        {/* Прогресс к уровню — крупно, в языке Welltory */}
        <View style={{ paddingVertical: 14, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 34, color: c.accent, fontVariant: ["tabular-nums"] }}>
              {outcome.pct}%
            </Text>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.ink }}>
              {outcome.levelNow.toUpperCase()} → {outcome.levelNext.toUpperCase()}
            </Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c.brandSoft, overflow: "hidden" }}>
            <View style={{ width: `${outcome.pct}%`, height: 8, borderRadius: 4, backgroundColor: c.accent }} />
          </View>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted, fontVariant: ["tabular-nums"] }}>
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
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 18, color: c.muted, paddingVertical: 10 }}>
          {t.profile.benchmarks(monthsAt(30), monthsAt(60), monthsAt(120))}
        </Text>
      </Card>

      {/* ---------- Речевой контур: что произведено самой (не «речь придёт сама») ---------- */}
      <Card title={t.profile.outputTitle}>
        <Row first label={t.profile.outputStatuses} value={String(output.byType.status ?? 0)} />
        <Row label={t.profile.outputSpeech} value={String(output.speech)} />
        <Row label={t.profile.outputActiveWords} value={String(srs.activeWords)} />
        <Row label={t.profile.outputNoticed} value={String(srs.noticedWords)} />
        <Row label={t.profile.outputDays} value={String(output.activeDays)} />
        <Pressable
          onPress={() => {
            tap();
            router.push("/diary" as never);
          }}
          accessibilityRole="button"
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, marginBottom: 12, borderRadius: 12, backgroundColor: pressed ? c.brandSoft : "transparent", borderWidth: 1, borderColor: c.line })}
        >
          <Ionicons name="book-outline" size={15} color={c.brand} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: c.brand }}>
            {t.diaryX.title} →
          </Text>
        </Pressable>
      </Card>

      {/* ---------- Способности: «что я могу», а не «сколько стрик» ---------- */}
      <Card title={t.profile.canTitle}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 18, color: c.muted, paddingTop: 10 }}>
          {t.profile.canNote}
        </Text>
        <View style={{ gap: 10, paddingVertical: 12 }}>
          {capabilityProgress(domainFromLegacyGoal(prefs?.goal), {
            statuses: output.byType.status ?? 0,
            activeWords: srs.activeWords,
            speech: output.speech,
          }).map((cap) => (
            <View key={cap.id} style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name={cap.unlocked ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={cap.unlocked ? c.brand : c.muted}
                />
                <Text style={{ flex: 1, fontFamily: "GolosText_600SemiBold", fontSize: 13, color: cap.unlocked ? c.ink : c.muted }}>
                  {t.profile.canNames[cap.id] ?? cap.id}
                </Text>
                <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, color: c.muted, fontVariant: ["tabular-nums"] }}>
                  {cap.pct}%
                </Text>
              </View>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: c.brandSoft, overflow: "hidden", marginLeft: 24 }}>
                <View style={{ width: `${cap.pct}%`, height: 4, borderRadius: 2, backgroundColor: cap.unlocked ? c.brand : c.accent }} />
              </View>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => {
            tap();
            router.push("/path" as never);
          }}
          accessibilityRole="button"
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, marginBottom: 12, borderRadius: 12, backgroundColor: pressed ? c.brandSoft : "transparent", borderWidth: 1, borderColor: c.line })}
        >
          <Ionicons name="trail-sign-outline" size={15} color={c.brand} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: c.brand }}>
            {t.pathX.title} →
          </Text>
        </Pressable>
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
            <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 18, color: c.ink }}>
              {streak > 0 ? t.profile.streakN(streak, plural(streak, ...t.profile.dayWords)) : t.profile.streakStart}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>
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
                <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: got ? c.ink : c.muted }}>
                  {m} {plural(m, ...t.profile.dayWords)}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 18, color: c.muted, paddingBottom: 12 }}>
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
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, lineHeight: 16, color: c.muted, paddingBottom: 8 }}>
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

      {/* ---------- Аккаунт: реальный вход по волшебной ссылке + синк ---------- */}
      <AccountCard />

      {/* ---------- Безопасность ---------- */}
      <Card title={t.profile.security}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 19, color: c.muted, paddingVertical: 12 }}>
          {t.profile.securityNote}
        </Text>
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
          backgroundColor: c.brand,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: speaking ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="volume-high" size={20} color={c.onBrand} />
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.onBrand }}>
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
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.brand }}>
          {t.profile.redo}
        </Text>
      </Pressable>

      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 18, color: c.muted }}>
        {t.profile.foot}
      </Text>
    </ScrollView>
  );
}

/* ---------- Честные часы: неделя столбиками ---------- */
// Дизайн «Прогресс»: пустой день — тихий столбик, не «сломанная цепочка».
// Сегодня — терракота, прошлые дни — мягкая терракота, пусто — wash.

function WeekBars({ byDay }: { byDay: Record<string, number> }) {
  const { c, mode } = useMarina();
  const { t } = useT();
  const days: { key: string; dow: number; sec: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, dow: (d.getDay() + 6) % 7, sec: byDay[key] ?? 0, isToday: i === 0 });
  }
  const totalSec = Object.values(byDay).reduce((a, b) => a + b, 0);
  const h = Math.floor(totalSec / 3600);
  const m = Math.round((totalSec % 3600) / 60);
  const maxSec = Math.max(1, ...days.map((d) => d.sec));
  const pastBar = mode === "dark" ? "#6b5344" : "#f0c9bc"; // мягкая терракота
  const quietBar = c.brandSoft;

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.line,
        padding: 14,
        paddingHorizontal: 16,
        gap: 0,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 24, letterSpacing: -0.4, color: c.ink, fontVariant: ["tabular-nums"] }}>
          {h} ч {m} мин
        </Text>
        <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 11, color: c.muted }}>
          {t.profile.weekHonest}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "flex-end", height: 44, marginTop: 12 }}>
        {days.map((d) => {
          const pct = d.sec > 0 ? Math.max(0.12, d.sec / maxSec) : 0.1;
          return (
            <View
              key={d.key}
              style={{
                flex: 1,
                height: `${Math.round(pct * 100)}%`,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                backgroundColor: d.sec === 0 ? quietBar : d.isToday ? c.brand : pastBar,
              }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 5 }}>
        {days.map((d) => (
          <Text
            key={d.key}
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: d.isToday ? "GolosText_700Bold" : "GolosText_500Medium",
              fontSize: 9.5,
              color: d.isToday ? c.brand : c.muted,
            }}
          >
            {t.profile.weekDays[d.dow]}
          </Text>
        ))}
      </View>
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, lineHeight: 16, color: c.muted, marginTop: 10 }}>
        {t.profile.weekQuiet}
      </Text>
    </View>
  );
}

/* ---------- Аккаунт: вход по волшебной ссылке + синк ---------- */

type AcStatus =
  | "idle"
  | "sending"
  | "sent"
  | "dev"
  | "bad"
  | "syncing"
  | "pushed"
  | "pulled"
  | "fail";

function AccountCard() {
  const { c } = useMarina();
  const { t } = useT();
  const loggedIn = useLoggedIn();
  const configured = apiConfigured();

  const [me, setMe] = useState<MeUser>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AcStatus>("idle");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [queue, setQueue] = useState(0);

  useEffect(() => {
    setQueue(pendingCount());
    if (loggedIn) {
      void fetchMe().then(setMe);
    } else {
      setMe(null);
    }
  }, [loggedIn]);

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function send() {
    tap();
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
      setStatus("bad");
      return;
    }
    setStatus("sending");
    const r = await requestMagicLink(e);
    if (!r.ok) {
      setStatus("fail");
      return;
    }
    if (r.devLink) {
      setDevLink(r.devLink);
      setStatus("dev");
    } else {
      setStatus("sent");
    }
  }

  async function doPush() {
    tap();
    setStatus("syncing");
    const ok = await pushToCloud();
    setQueue(pendingCount());
    setStatus(ok ? "pushed" : "fail");
  }

  async function doPull() {
    tap();
    setStatus("syncing");
    const ok = await pullFromCloud();
    setStatus(ok ? "pulled" : "fail");
  }

  function doLogout() {
    tap();
    clearSessionToken();
    setMe(null);
    setStatus("idle");
    setDevLink(null);
    setEmail("");
  }

  // Сервер синка не задан — честный статус, как раньше.
  if (!configured) {
    return (
      <Card title={t.profile.account}>
        <Row first label={t.profile.plan} value={t.profile.planFree} />
        <Row label={t.profile.planPro} value={t.profile.planProVal} />
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 19, color: c.muted, paddingVertical: 12 }}>
          {t.profile.acNoServer}
        </Text>
      </Card>
    );
  }

  // Вошла — показываем аккаунт и синк.
  if (loggedIn) {
    return (
      <Card title={t.profile.account}>
        <Row first label={t.profile.acSignedIn} value={me?.email ?? "…"} />
        <Row label={t.profile.plan} value={me?.plan === "pro" ? t.profile.planPro : t.profile.planFree} />
        <View style={{ paddingVertical: 12, gap: 10 }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: c.ink }}>
            {t.profile.acSyncTitle}
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AcBtn icon="cloud-upload-outline" label={t.profile.acPush} onPress={doPush} disabled={status === "syncing"} />
            <AcBtn icon="cloud-download-outline" label={t.profile.acPull} onPress={doPull} disabled={status === "syncing"} />
          </View>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted, fontVariant: ["tabular-nums"] }}>
            {t.profile.acQueue(queue)}
          </Text>
          <AcStatusLine status={status} />
        </View>
        <Pressable
          onPress={doLogout}
          accessibilityRole="button"
          style={({ pressed }) => ({ minHeight: 44, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, backgroundColor: pressed ? c.surface : "transparent" })}
        >
          <Ionicons name="log-out-outline" size={16} color={c.muted} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: c.muted }}>{t.profile.acLogout}</Text>
        </Pressable>
      </Card>
    );
  }

  // Не вошла — форма входа по email.
  return (
    <Card title={t.profile.account}>
      <Row first label={t.profile.plan} value={t.profile.planFree} />
      <View style={{ paddingVertical: 12, gap: 10 }}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 19, color: c.muted }}>
          {t.profile.acLoginNote}
        </Text>
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (status === "bad") setStatus("idle");
          }}
          placeholder={t.profile.acEmail}
          placeholderTextColor={c.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={{ minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.line, paddingHorizontal: 14, fontFamily: "GolosText_400Regular", fontSize: 14, color: c.ink, backgroundColor: c.surface }}
        />
        {status === "dev" && devLink ? (
          <>
            <Pressable
              onPress={() => {
                tap();
                void Linking.openURL(devLink);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 48, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Ionicons name="open-outline" size={18} color={c.onBrand} />
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.onBrand }}>{t.profile.acOpenLink}</Text>
            </Pressable>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 18, color: c.muted }}>
              {t.profile.acLinkHint}
            </Text>
          </>
        ) : (
          <Pressable
            onPress={send}
            disabled={status === "sending"}
            accessibilityRole="button"
            style={({ pressed }) => ({ minHeight: 48, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, opacity: status === "sending" ? 0.6 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
          >
            <Ionicons name="mail-outline" size={18} color={c.onBrand} />
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.onBrand }}>
              {status === "sending" ? t.profile.acSending : t.profile.acSend}
            </Text>
          </Pressable>
        )}
        {status === "bad" && <AcNote text={t.profile.acBadEmail} tone="warn" />}
        {status === "sent" && <AcNote text={t.profile.acSentMail} tone="ok" />}
        {status === "fail" && <AcNote text={t.profile.acSyncFail} tone="warn" />}
      </View>
    </Card>
  );
}

function AcBtn({ icon, label, onPress, disabled }: { icon: string; label: string; onPress: () => void; disabled?: boolean }) {
  const { c } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({ flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, opacity: disabled ? 0.5 : 1, backgroundColor: pressed ? c.brandSoft : "transparent" })}
    >
      <Ionicons name={icon as never} size={15} color={c.brand} />
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 12.5, color: c.brand }}>{label}</Text>
    </Pressable>
  );
}

function AcStatusLine({ status }: { status: AcStatus }) {
  const { t } = useT();
  if (status === "syncing") return <AcNote text={t.profile.acSyncing} tone="muted" />;
  if (status === "pushed") return <AcNote text={t.profile.acPushed} tone="ok" />;
  if (status === "pulled") return <AcNote text={t.profile.acPulled} tone="ok" />;
  if (status === "fail") return <AcNote text={t.profile.acSyncFail} tone="warn" />;
  return null;
}

function AcNote({ text, tone }: { text: string; tone: "ok" | "warn" | "muted" }) {
  const { c } = useMarina();
  const color = tone === "ok" ? c.brand : tone === "warn" ? c.accent : c.muted;
  return (
    <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12.5, lineHeight: 18, color }}>{text}</Text>
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
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>{title}</Text>
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
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, flexShrink: 0 }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "GolosText_600SemiBold",
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
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted }}>{label}</Text>
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
                  fontFamily: "GolosText_600SemiBold",
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
