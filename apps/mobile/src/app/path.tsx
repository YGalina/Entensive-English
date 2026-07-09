import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGoal, hoursBudget, capabilityProgress, domainFromLegacyGoal } from "@ie/core/goal";
import { guardianStats, useGuardianLogVersion } from "@ie/core/barriers";
import { GUARDIANS } from "@ie/core/data/guardians";
import { useOutputStats } from "@ie/core/output";
import { useSrsStats } from "@ie/core/srs";
import { useOutcome } from "@ie/core/outcome";
import { usePrefs } from "@ie/core/prefs";
import { BotanicalFrame } from "@/components/botanical";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Путь героини» (идея Галины): язык = изменение, изменение = дорога.
// Карта пути: жизненная цель → вехи «что я могу» как этапы тропы →
// встречи со стражами → честный бюджет часов. Нарратив, не геймификация:
// каждый элемент — реальный факт из практики.

export default function PathScreen() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, lang } = useT();
  const en = lang === "en";
  const p = t.pathX;

  const prefs = usePrefs();
  const goal = useGoal();
  const output = useOutputStats();
  const srs = useSrsStats();
  const outcome = useOutcome();
  useGuardianLogVersion();

  const domain = goal?.domain ?? domainFromLegacyGoal(prefs?.goal);
  const caps = capabilityProgress(domain, {
    statuses: output.byType.status ?? 0,
    activeWords: srs.activeWords,
    speech: output.speech,
  });
  const unlocked = caps.filter((x) => x.unlocked).length;
  const budget = goal ? hoursBudget(goal) : null;
  const gstats = guardianStats();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BotanicalFrame />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40, gap: 14 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ flex: 1, fontFamily: "Nunito_800ExtraBold", fontSize: 24, color: c.ink }}>
            {p.title}
          </Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={p.close}
            hitSlop={8}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="close" size={18} color={c.ink} />
          </Pressable>
        </View>

        {/* Куда идём: жизненная цель */}
        <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 16, gap: 6 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: c.muted }}>
            {p.whereTo}
          </Text>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 18, lineHeight: 25, color: c.ink }}>
            {goal?.lifeGoal ?? p.noGoal}
          </Text>
          {goal && (
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
              {goal.currentLevel.toUpperCase()} → {goal.targetLevel.toUpperCase()}
              {budget ? ` · ${p.budget(budget.range[0], budget.range[1], Math.round(outcome.hoursDone))}` : ""}
            </Text>
          )}
        </View>

        {/* Тропа вех */}
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>
          {p.milestones(unlocked, caps.length)}
        </Text>
        <View style={{ gap: 0 }}>
          {caps.map((cap, idx) => (
            <View key={cap.id} style={{ flexDirection: "row", gap: 12 }}>
              {/* Линия тропы */}
              <View style={{ alignItems: "center", width: 28 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: cap.unlocked ? c.brand : c.line,
                    backgroundColor: cap.unlocked ? c.brand : c.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cap.unlocked ? (
                    <Ionicons name="checkmark" size={14} color={c.onBrand} />
                  ) : (
                    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 9, color: c.muted }}>
                      {cap.pct}%
                    </Text>
                  )}
                </View>
                {idx < caps.length - 1 && (
                  <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: cap.unlocked ? c.brand : c.line, opacity: 0.5 }} />
                )}
              </View>
              <View style={{ flex: 1, paddingBottom: 16 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: cap.unlocked ? c.ink : c.muted }}>
                  {t.profile.canNames[cap.id] ?? cap.id}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Стражи пути */}
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: c.ink }}>
          {p.guardians(gstats.doneCount)}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {GUARDIANS.map((g) => {
            const met = !!gstats.met[g.id];
            return (
              <View
                key={g.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: met ? c.brand : c.line,
                  backgroundColor: met ? c.brandSoft : c.surface,
                }}
              >
                <Ionicons name={met ? "shield-checkmark" : "shield-outline"} size={14} color={met ? c.brand : c.muted} />
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: met ? c.brandInk : c.muted }}>
                  {(en ? g.nameEn : g.name).replace(en ? "The Guardian of " : "Страж ", "")}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted }}>
          {p.guardiansNote}
        </Text>
      </ScrollView>
    </View>
  );
}
