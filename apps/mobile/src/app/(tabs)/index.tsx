import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { useArtifacts } from "@ie/core/output";
import { booksForReader } from "@ie/core/data/gutenberg";
import { SHADOWING } from "@ie/core/data/shadowing";
import { STORIES } from "@ie/core/data/reading";
import { useStreak } from "@ie/core/timelog";
import { useSrsStats } from "@ie/core/srs";
import { useOutcome } from "@ie/core/outcome";
import { useWpmStats } from "@ie/core/wpm";
import { usePrefs } from "@ie/core/prefs";
import { useT } from "@/lib/i18n";
import { useMarina, skillTone } from "@/theme";
import { Breton } from "@/components/breton";
import { OutputCard } from "@/components/output-card";
import { GuardianCard } from "@/components/guardian-card";

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
const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function TodayScreen() {
  const { c, sk, radius, mode } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plan = useDayPlan();
  const streak = useStreak();
  const { t, lang } = useT();
  const L = lang;
  const prefs = usePrefs();
  const outcome = useOutcome();
  const wpm = useWpmStats();
  const srs = useSrsStats();
  // Разбор недели: приглашаем в выходные, если за 7 дней разбора не было.
  const artifacts = useArtifacts(40);
  const weekday = new Date().getDay(); // 0 = вс, 6 = сб
  const reviewDue =
    (weekday === 0 || weekday === 6) &&
    !artifacts.some((a) => a.type === "review" && a.createdAt >= Date.now() - 6 * 864e5);

  // Тёмная = синяя морская ночь (не зелёная) — в тон tokens.dark.
  const heroGradient =
    mode === "dark"
      ? (["#12455c", "#0e3346", "#0a2230"] as const)
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
    Alert.alert(title, t.today.soonBody, [{ text: t.today.ok, style: "default" }]);
  }

  // «Полка дня»: конечная (НЕ лента) — три двери в смыслы на сегодня.
  // Детерминированно от даты: у всех ровно три приглашения, завтра — новые.
  const shelf = (() => {
    const day = Math.floor(Date.now() / 864e5);
    const books = booksForReader(prefs?.topics ?? [], prefs?.level);
    const book = books.length ? books[day % Math.min(3, books.length)] : null;
    const video = SHADOWING.length ? SHADOWING[day % SHADOWING.length] : null;
    const lvl = (prefs?.level ?? "b1").toLowerCase();
    const order = ["a1", "a2", "b1", "b2", "c1"];
    const li = Math.max(0, order.indexOf(lvl));
    const stories = STORIES.filter((st) => Math.abs(order.indexOf(st.level) - li) <= 1);
    const story = stories.length ? stories[day % stories.length] : STORIES[day % STORIES.length];
    return { book, video, story };
  })();

  // Инсайт: темп → дата уровня → что осталось сегодня. Объясняем, не стыдим.
  const insight = (() => {
    const parts: string[] = [];
    if (outcome.paceMinPerDay >= 5 && outcome.levelEta) {
      const d = outcome.levelEta;
      const when = L === "en" ? `${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}` : `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
      parts.push(t.today.insightPace(outcome.paceMinPerDay, outcome.levelNext.toUpperCase(), when));
    } else {
      parts.push(t.today.insightNoPace(dailyGoal));
    }
    if (leftMin > 0 && current) {
      parts.push(t.today.insightLeft(leftMin, current[L].title));
    } else if (leftMin === 0) {
      parts.push(t.today.insightDone);
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
            {t.today.title}
          </Text>
          {streak > 0 && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: c.sun }}
              accessibilityLabel={t.today.streak(streak)}
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
            label={t.today.wpmLabel}
            value={wpm.last != null ? String(wpm.last) : "—"}
            unit="WPM"
            pct={wpm.last != null ? Math.min(1, wpm.last / 240) : 0}
            barColor={c.brand}
            onPress={() => openStep("reading", t.today.wpmLabel)}
          />
          <MetricCard
            label={t.today.wordsLabel}
            value={String(outcome.wordsLearned)}
            unit={`/ ${outcome.wordsTarget}`}
            pct={Math.min(1, outcome.wordsLearned / outcome.wordsTarget)}
            barColor={c.accent}
            onPress={() => openStep("session", t.today.wordsLabel)}
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

      {/* Стражи пути: психологическая поддержка изменения (по детектору, ≤1/день) */}
      <GuardianCard />

      {/* Речевой контур: утренняя фраза / статус дня — ежедневный маленький вывод */}
      <OutputCard />

      {/* Продуктивное извлечение: слова, готовые выйти в речь */}
      {srs.produceDue > 0 && (
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/produce" as never);
          }}
          accessibilityRole="button"
          accessibilityLabel={t.today.produceA11y(srs.produceDue)}
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
          <Ionicons name="mic-outline" size={20} color={c.accent} />
          <View style={{ flex: 1, paddingVertical: 10 }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>
              {t.today.produceTitle}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
              {t.today.produceNote(srs.produceDue)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </Pressable>
      )}

      {/* Полка дня: три двери в смыслы (конечная, не лента) */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>
            {t.today.shelf}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: c.muted }}>
            {t.today.shelfNote}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {shelf.book && (
            <ShelfCard
              icon="book"
              kind={t.today.shelfBook}
              title={shelf.book.title}
              tone={sk.reading}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: "/read", params: { book: shelf.book!.bookId } } as never);
              }}
            />
          )}
          {shelf.video && (
            <ShelfCard
              icon="play"
              kind={t.today.shelfVideo}
              title={shelf.video.title}
              tone={sk.video}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: "/listen", params: { video: shelf.video!.id } } as never);
              }}
            />
          )}
          {shelf.story && (
            <ShelfCard
              icon="document-text"
              kind={t.today.shelfText}
              title={shelf.story.title}
              tone={c.brand}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: "/read", params: { story: shelf.story!.id } } as never);
              }}
            />
          )}
        </View>
      </View>

      {/* Герой: следующий шаг */}
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={{ borderRadius: radius.card, padding: 18, gap: 8 }}
      >
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: "#bfe0dd" }}>
          {current ? (current.goalMin > 0 ? t.today.nextStep(current.goalMin) : t.today.nextStepReviews) : t.today.dayDone}
        </Text>
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 23, color: "#ffffff" }}>
          {current ? current[L].title : t.today.allDone}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13.5, color: "#cfe8e6" }}>
          {current ? current[L].note : t.today.allDoneNote}
        </Text>
        {current && (
          <Pressable
            onPress={() => openStep(current.id, current[L].title)}
            accessibilityRole="button"
            accessibilityLabel={`${t.today.start}: ${current[L].title}`}
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
              {t.today.start}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </Pressable>
        )}
      </LinearGradient>

      {/* Разбор недели с тренером — по выходным */}
      {reviewDue && (
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/coach" as never);
          }}
          accessibilityRole="button"
          accessibilityLabel={t.coachX.todayTitle}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: pressed ? c.brandSoft : c.surface,
            borderRadius: radius.soft,
            borderWidth: 1,
            borderColor: c.brand,
            paddingHorizontal: 14,
            minHeight: 56,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <Ionicons name="clipboard-outline" size={20} color={c.brand} />
          <View style={{ flex: 1, paddingVertical: 10 }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>
              {t.coachX.todayTitle}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
              {t.coachX.todayNote}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </Pressable>
      )}

      {/* Роли: сцена героя — эмоция + безопасный output в маске */}
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/roles" as never);
        }}
        accessibilityRole="button"
        accessibilityLabel={t.rolesX.todayTitle}
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
        <Ionicons name="film-outline" size={20} color={sk.video} />
        <View style={{ flex: 1, paddingVertical: 10 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>
            {t.rolesX.todayTitle}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
            {t.rolesX.todayNote}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.muted} />
      </Pressable>

      {/* «3-минутка» */}
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/three" as never);
        }}
        accessibilityRole="button"
        accessibilityLabel={t.today.threeA11y}
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
            {t.today.three}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
            {t.today.threeNote}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.muted} />
      </Pressable>

      {/* Дорожка дня: компактные этапы-точки */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>
          {t.today.trail}
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
                onPress={() => openStep(s.id, s[L].title)}
                accessibilityRole="button"
                accessibilityLabel={`${s[L].title}: ${s.done ? t.today.stepDone : isCurrent ? t.today.stepCurrent : `${s.pct}%`}`}
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
                    <Ionicons name="checkmark" size={15} color={c.onBrand} />
                  ) : isCurrent ? (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.accent }} />
                  ) : null}
                </View>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "Inter_600SemiBold", fontSize: 9.5, color: s.done || isCurrent ? c.ink : c.muted }}
                >
                  {s[L].title.split(" ")[0]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- Карточка полки ---------- */

function ShelfCard({
  icon,
  kind,
  title,
  tone,
  onPress,
}: {
  icon: string;
  kind: string;
  title: string;
  tone: string;
  onPress: () => void;
}) {
  const { c, radius } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${kind}: ${title}`}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed ? c.brandSoft : c.surface,
        borderRadius: radius.soft,
        borderWidth: 1,
        borderColor: c.line,
        padding: 10,
        gap: 6,
        minHeight: 92,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Ionicons name={icon as never} size={13} color={tone} />
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 9.5, letterSpacing: 0.4, textTransform: "uppercase", color: c.muted }}>
          {kind}
        </Text>
      </View>
      <Text
        numberOfLines={3}
        style={{ fontFamily: "Nunito_700Bold", fontSize: 12.5, lineHeight: 17, color: c.ink }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/* ---------- Кольцо дня ---------- */

function DayRing({ pct, doneMin, goalMin }: { pct: number; doneMin: number; goalMin: number }) {
  const { c } = useMarina();
  const { t } = useT();
  const size = 128;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const len = 2 * Math.PI * r;

  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityLabel={t.today.ringA11y(doneMin, goalMin)}
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
          {t.today.ringOf(doneMin, goalMin)}
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
