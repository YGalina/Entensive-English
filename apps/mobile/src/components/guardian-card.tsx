// Встреча со стражем пути (идея Галины: язык = изменение, у изменения есть
// стражи — обесценивание, запугивание, высмеивание, перфекционизм).
// Карточка появляется по ДЕТЕКТОРУ из реального поведения, максимум раз в
// день, и предлагает короткую практику. Не терапия — поддержка состояния.

import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  activeGuardian,
  canShowGuardian,
  detectGuardian,
  donePractices,
  markGuardianShown,
  markPracticeDone,
  snoozeToday,
  useGuardianLogVersion,
  type GuardianFacts,
} from "@ie/core/barriers";
import { guardianById, practicesFor, type GuardianId } from "@ie/core/data/guardians";
import { useArtifacts } from "@ie/core/output";
import { useTimeStats } from "@ie/core/timelog";
import { usePrefs } from "@ie/core/prefs";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

const WEEK_MS = 7 * 24 * 3600 * 1000;

export function GuardianCard() {
  const { c, radius } = useMarina();
  const { t, lang } = useT();
  const en = lang === "en";
  const prefs = usePrefs();
  const time = useTimeStats();
  const artifacts = useArtifacts(30);
  useGuardianLogVersion(); // реактивность на «прошла»/«не сейчас»

  const [justDone, setJustDone] = useState(false);

  // Факты для детекторов — из уже существующих данных.
  const facts: GuardianFacts = useMemo(() => {
    const weekAgo = Date.now() - WEEK_MS;
    const week = artifacts.filter((a) => a.createdAt >= weekAgo);
    const byDayMin: Record<string, number> = {};
    for (const [d, sec] of Object.entries(time.byDay)) byDayMin[d] = sec / 60;
    return {
      recentTexts: artifacts.map((a) => a.text ?? "").filter(Boolean),
      speech7d: week.filter((a) => a.type === "speech" || a.audioRef).length,
      texts7d: week.filter((a) => a.text).length,
      byDayMin,
      dailyGoalMin: prefs?.dailyGoalMin ?? 30,
    };
  }, [artifacts, time.byDay, prefs?.dailyGoalMin]);

  // Активный страж дня или новая детекция (с троттлингом). Запись «показан» —
  // в эффекте, не в рендере: рендер чистый, журнал пишется после кадра.
  const active = activeGuardian();
  const detected = (() => {
    if (active) return null;
    const det = detectGuardian(facts);
    return det && canShowGuardian(det.id) ? det.id : null;
  })();
  const gid: GuardianId | null = active ?? detected;

  useEffect(() => {
    if (detected) markGuardianShown(detected);
  }, [detected]);

  if (!gid && !justDone) return null;
  if (justDone) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.brandSoft, borderRadius: radius.soft, padding: 14 }}>
        <Ionicons name="shield-checkmark" size={18} color={c.brand} />
        <Text style={{ flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 13, color: c.brandInk }}>
          {t.guardX.passed}
        </Text>
      </View>
    );
  }

  const g = guardianById(gid!);
  const done = donePractices();
  const practices = practicesFor(gid!);
  const practice = practices.find((p) => !done[p.id]) ?? practices[0];

  return (
    <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="shield-half" size={18} color={c.accent} />
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: c.muted }}>
          {t.guardX.met}
        </Text>
      </View>
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 19, color: c.ink }}>
        {en ? g.nameEn : g.name}
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted, fontStyle: "italic" }}>
        {en ? g.voiceEn : g.voice}
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, color: c.ink }}>
        {en ? g.truthEn : g.truth}
      </Text>

      <View style={{ backgroundColor: c.brandSoft, borderRadius: 12, padding: 12, gap: 6 }}>
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.brandInk }}>
          {t.guardX.practice} · {en ? practice.titleEn : practice.title} · {practice.durationMin} {t.common.minutes}
        </Text>
        {(en ? practice.stepsEn : practice.steps).map((step, i) => (
          <Text key={i} style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.brandInk }}>
            {i + 1}. {step}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            snoozeToday();
          }}
          accessibilityRole="button"
          style={({ pressed }) => ({ paddingHorizontal: 14, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13.5, color: c.muted }}>{t.guardX.later}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            markPracticeDone(practice.id);
            setJustDone(true);
          }}
          accessibilityRole="button"
          style={({ pressed }) => ({ flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
        >
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14.5, color: c.onBrand }}>{t.guardX.done}</Text>
        </Pressable>
      </View>
    </View>
  );
}
