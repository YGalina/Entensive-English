import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { useArtifacts, useOutputStats } from "@ie/core/output";
import { speakingDue, useAssessVersion } from "@ie/core/assess";
import { booksForReader } from "@ie/core/data/gutenberg";
import { SHADOWING } from "@ie/core/data/shadowing";
import { STORIES } from "@ie/core/data/reading";
import { useSrsStats } from "@ie/core/srs";
import { useOutcome } from "@ie/core/outcome";
import { usePrefs } from "@ie/core/prefs";
import { useT } from "@/lib/i18n";
import { useMarina, skillTone } from "@/theme";
import { OutputCard } from "@/components/output-card";
import { GuardianCard } from "@/components/guardian-card";

// «Сегодня» — по макету 24a (docs/design, Living Content): утро и вечер одного
// дня. Утром — один следующий шаг и честные часы до уровня; вечером экран сам
// меняется: сделанное сворачивается, остаётся статус дня (вечерний круг) и
// мягкое приглашение. Без стриков и огоньков: прогресс — часы и способности.

// «Набор» — принципиально только web (виртуальная клавиатура не тренирует
// пальцевую память); на мобильном шаг не показываем.
const WEB_ONLY_STEPS = new Set(["typing"]);

const STEP_ROUTE: Record<string, string> = {
  session: "/session",
  pronunciation: "/sounds",
  reading: "/read",
  shadowing: "/listen",
};

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
  const prefs = usePrefs();
  const outcome = useOutcome();
  const srs = useSrsStats();
  const artifacts = useArtifacts(40);
  const weekday = new Date().getDay();
  const reviewDue =
    (weekday === 0 || weekday === 6) &&
    !artifacts.some((a) => a.type === "review" && a.createdAt >= Date.now() - 6 * 864e5);
  const outStats = useOutputStats();
  useAssessVersion();
  const checkupDue = speakingDue(outStats.activeDays);

  const steps = plan.steps.filter((s) => !WEB_ONLY_STEPS.has(s.id));
  const current = steps.find((s) => !s.done) ?? null;

  // Вечерний режим экрана: после 17:00 и главный шаг сделан (или всё сделано).
  const hour = new Date().getHours();
  const evening = hour >= 17;
  const mainDone = steps.length > 0 && (steps[0]?.done ?? false);
  const eveningView = evening && (mainDone || !current);

  const now = new Date();
  const dateLine = en
    ? `${WEEKDAYS_EN[now.getDay()]}, ${MONTHS_EN[now.getMonth()]} ${now.getDate()}`
    : `${WEEKDAYS_RU[now.getDay()]}, ${now.getDate()} ${MONTHS_GEN_RU[now.getMonth()]}`;

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function openStep(id: string, title: string) {
    tap();
    const route = STEP_ROUTE[id];
    if (route) {
      router.push(route as never);
      return;
    }
    Alert.alert(title, t.today.soonBody, [{ text: t.today.ok, style: "default" }]);
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

  // «Полка дня»: конечная (НЕ лента) — три двери в смыслы на сегодня.
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 14, paddingBottom: 32, gap: 13 }}
    >
      {/* Шапка: дата · Сегодня · аватар */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 12.5, color: c.muted }}>
            {dateLine}
          </Text>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 25, letterSpacing: -0.5, color: c.ink, marginTop: 3 }}>
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
            width: 38,
            height: 38,
            borderRadius: 19,
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
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 11, letterSpacing: 0.7, textTransform: "uppercase", color: c.muted }}>
            {t.homeX.pathTo(outcome.levelNext.toUpperCase())}
          </Text>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 12, color: c.ink, fontVariant: ["tabular-nums"] }}>
            {t.homeX.hoursOf(Math.round(outcome.hoursDone), outcome.hoursGoal)}
          </Text>
        </View>
        <View style={{ height: 6, borderRadius: 6, backgroundColor: c.brandSoft, marginTop: 8, overflow: "hidden", flexDirection: "row" }}>
          {/* градиент терракота→амбер двумя сегментами (без linear-gradient зависимости) */}
          <View style={{ width: `${Math.max(2, hoursPct * 60)}%`, backgroundColor: c.brand }} />
          <View style={{ width: `${hoursPct * 40}%`, backgroundColor: sk.sounds }} />
        </View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, color: c.muted, marginTop: 7 }}>
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
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#e8b36a" }}>
              {t.homeX.circleLabel}
            </Text>
            <Text style={{ fontFamily: "Lora_400Regular", fontSize: 16, lineHeight: 23, color: "#f5efe2", marginTop: 7 }}>
              {t.homeX.circleQuote}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, lineHeight: 17, color: "#9c937d", marginTop: 6 }}>
              {t.homeX.circleNote}
            </Text>
            <Pressable
              onPress={() => {
                tap();
                router.push("/evening" as never);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({
                marginTop: 12,
                minHeight: 48,
                borderRadius: 13,
                backgroundColor: "#e8b36a",
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: "#2a2214" }}>
                {outStats.statusToday ? t.homeX.circleOpenAgain : t.homeX.circleCta}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {/* ОДИН СЛЕДУЮЩИЙ ШАГ */}
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
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: c.brand }}>
                {t.homeX.oneStep}
              </Text>
              {current && current.goalMin > 0 && (
                <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 11.5, color: c.muted }}>
                  {t.homeX.min(current.goalMin)}
                </Text>
              )}
            </View>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 18, lineHeight: 22, color: c.ink, marginTop: 7 }}>
              {current ? current[L].title : t.today.allDone}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 18.5, color: c.muted, marginTop: 4 }}>
              {current ? current[L].note : t.today.allDoneNote}
            </Text>
            {current && (
              <Pressable
                onPress={() => openStep(current.id, current[L].title)}
                accessibilityRole="button"
                accessibilityLabel={`${t.today.start}: ${current[L].title}`}
                style={({ pressed }) => ({
                  marginTop: 12,
                  minHeight: 48,
                  borderRadius: 13,
                  backgroundColor: c.brand,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.onBrand }}>
                  {t.today.start}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Потом · Вечером — две малые карточки */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <SmallCard
              label={srs.produceDue > 0 ? t.homeX.later(5) : t.homeX.later(4)}
              labelColor={c.accent}
              title={srs.produceDue > 0 ? t.homeX.sayWords : t.homeX.playScene}
              onPress={() => {
                tap();
                router.push((srs.produceDue > 0 ? "/produce" : "/roles") as never);
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

          {/* Утренняя фраза — маленький вывод дня. Вечером статус живёт в
              вечернем круге (тёмный экран) — инлайн-карточку не дублируем. */}
          {!evening && <OutputCard />}
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
        <Text style={{ flex: 1, fontFamily: "GolosText_500Medium", fontSize: 12, lineHeight: 17, color: c.brandInk }}>
          {t.homeX.communityLine}
        </Text>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 12, color: c.brandD }}>
          {t.homeX.communityCta}
        </Text>
      </Pressable>

      {/* Полка дня: три двери в смыслы (конечная, не лента) */}
      <View style={{ gap: 8, marginTop: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
            {t.today.shelf}
          </Text>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, color: c.muted }}>
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
                tap();
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
                tap();
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
                tap();
                router.push({ pathname: "/read", params: { story: shelf.story!.id } } as never);
              }}
            />
          )}
        </View>
      </View>

      {/* Дорожка дня: компактные этапы-точки */}
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
                  borderColor: s.done ? tone : isCurrent ? c.brand : c.line,
                  backgroundColor: s.done ? tone : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.done ? (
                  <Ionicons name="checkmark" size={15} color={c.onBrand} />
                ) : isCurrent ? (
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.brand }} />
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={{ fontFamily: "GolosText_600SemiBold", fontSize: 9.5, color: s.done || isCurrent ? c.ink : c.muted }}
              >
                {s[L].title.split(" ")[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ещё практика: роли · 3-минутка · срез · разбор — тихой строкой */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <MoreChip icon="film-outline" label={t.homeX.chipRoles} onPress={() => { tap(); router.push("/roles" as never); }} />
        <MoreChip icon="timer-outline" label={t.homeX.chipThree} onPress={() => { tap(); router.push("/three" as never); }} />
        {srs.produceDue > 0 && (
          <MoreChip icon="mic-outline" label={t.homeX.chipProduce(srs.produceDue)} onPress={() => { tap(); router.push("/produce" as never); }} />
        )}
        {checkupDue && (
          <MoreChip icon="pulse-outline" label={t.homeX.chipCheckup} onPress={() => { tap(); router.push("/checkup" as never); }} />
        )}
        {reviewDue && (
          <MoreChip icon="clipboard-outline" label={t.homeX.chipReview} onPress={() => { tap(); router.push("/coach" as never); }} />
        )}
      </View>
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

/* ---------- Чип «ещё практика» ---------- */

function MoreChip({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { c } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minHeight: 40,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: pressed ? c.brandSoft : c.surface,
      })}
    >
      <Ionicons name={icon as never} size={14} color={c.muted} />
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: c.brandInk }}>{label}</Text>
    </Pressable>
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
        <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 9.5, letterSpacing: 0.4, textTransform: "uppercase", color: c.muted }}>
          {kind}
        </Text>
      </View>
      <Text
        numberOfLines={3}
        style={{ fontFamily: "GolosText_700Bold", fontSize: 12.5, lineHeight: 17, color: c.ink }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
