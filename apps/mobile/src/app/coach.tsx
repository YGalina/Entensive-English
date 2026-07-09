import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { addArtifact, useArtifacts, useOutputStats } from "@ie/core/output";
import { guardianStats } from "@ie/core/barriers";
import { useSrsStats } from "@ie/core/srs";
import { useTimeStats } from "@ie/core/timelog";
import { useActivityTimer } from "@ie/core/timelog";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// Сессия с тренером (self-guided, идея Галины: тренер — не репетитор).
// Как в спорте: раз в неделю — разбор. Факты недели (без оценок) → три
// вопроса рефлексии по тренерской методологии → один фокус на следующую
// неделю. Позже здесь появятся живые чекпоинты и малые группы (MVP-A).

const WEEK_MS = 7 * 24 * 3600 * 1000;

export default function CoachScreen() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const k = t.coachX;

  useActivityTimer("coach");

  const time = useTimeStats();
  const output = useOutputStats();
  const srs = useSrsStats();
  const artifacts = useArtifacts(60);
  const gstats = guardianStats();

  const facts = useMemo(() => {
    const weekAgo = Date.now() - WEEK_MS;
    const week = artifacts.filter((a) => a.createdAt >= weekAgo);
    let weekMin = 0;
    for (const [d, sec] of Object.entries(time.byDay)) {
      if (new Date(d + "T00:00:00Z").getTime() >= weekAgo) weekMin += sec / 60;
    }
    return {
      minutes: Math.round(weekMin),
      statuses: week.filter((a) => a.type === "status").length,
      voice: week.filter((a) => a.type === "speech" || a.audioRef).length,
      activeWords: srs.activeWords,
      practices: gstats.doneCount,
    };
  }, [artifacts, time.byDay, srs.activeWords, gstats.doneCount]);

  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [saved, setSaved] = useState(false);

  const questions = [k.q1, k.q2, k.q3];
  const canSave = answers.some((a) => a.trim());

  function save() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const text = questions
      .map((q, i) => (answers[i].trim() ? `${q}\n— ${answers[i].trim()}` : null))
      .filter(Boolean)
      .join("\n\n");
    addArtifact({ type: "review", promptId: "weekly-review", text });
    setSaved(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 10 }}>
        <Text style={{ flex: 1, fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: c.ink }}>
          {k.title}
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={k.close}
          hitSlop={8}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close" size={18} color={c.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
        {saved ? (
          <View style={{ alignItems: "center", gap: 10, paddingTop: 60 }}>
            <Ionicons name="clipboard" size={28} color={c.sun} />
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: c.ink, textAlign: "center" }}>
              {k.savedTitle}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
              {k.savedNote}
            </Text>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={({ pressed }) => ({ marginTop: 10, minHeight: 48, paddingHorizontal: 28, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.onBrand }}>{k.home}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted }}>
              {k.intro}
            </Text>

            {/* Факты недели — без оценок */}
            <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 16, gap: 8 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: c.muted }}>
                {k.facts}
              </Text>
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, lineHeight: 24, color: c.ink }}>
                {k.factsLine(facts.minutes, facts.statuses, facts.voice, facts.activeWords, facts.practices)}
              </Text>
            </View>

            {/* Три вопроса тренера */}
            {questions.map((q, i) => (
              <View key={i} style={{ gap: 6 }}>
                <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14.5, color: c.ink }}>{q}</Text>
                <TextInput
                  value={answers[i]}
                  onChangeText={(v) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))}
                  placeholder={k.placeholder}
                  placeholderTextColor={c.muted}
                  multiline
                  style={{ minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, padding: 12, fontFamily: "Inter_400Regular", fontSize: 14.5, color: c.ink, textAlignVertical: "top" }}
                />
              </View>
            ))}

            <Pressable
              onPress={save}
              disabled={!canSave}
              accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, backgroundColor: canSave ? c.brand : c.brandSoft, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: canSave ? c.onBrand : c.muted }}>
                {k.save}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
