import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  addAssessment,
  lastSpeaking,
  SPEAKING_PROMPTS,
  type SelfScores,
} from "@ie/core/assess";
import { addArtifact } from "@ie/core/output";
import { useActivityTimer } from "@ie/core/timelog";
import { useVoiceRecorder } from "@ie/media/recorder";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// Speaking-срез (Фаза D): раз в месяц — 2 минуты речи о своей жизни +
// самооценка по рубрике. Сравнение с СОБОЙ прошлой, не с носителем и не
// с оценщиком. Запись приватна; человеческие срезы (MVP-A) придут позже.

type Stage = "intro" | "record" | "rate" | "done";

const SCALE = [1, 2, 3, 4, 5];

export default function CheckupScreen() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, lang } = useT();
  const en = lang === "en";
  const k = t.checkX;

  useActivityTimer("checkup");
  const rec = useVoiceRecorder();

  const prompt = useMemo(
    () => SPEAKING_PROMPTS[Math.floor(Date.now() / 864e5) % SPEAKING_PROMPTS.length],
    []
  );
  const prev = useMemo(() => lastSpeaking(), []);

  const [stage, setStage] = useState<Stage>("intro");
  const [sampleRef, setSampleRef] = useState<string | null>(null);
  const [scores, setScores] = useState<SelfScores>({ fluency: 0, confidence: 0, vocabulary: 0 });

  const canFinish = scores.fluency > 0 && scores.confidence > 0 && scores.vocabulary > 0;

  async function toggleRecord() {
    if (rec.recording) {
      const uri = await rec.stop();
      if (uri) setSampleRef(uri);
      setStage("rate");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await rec.start();
    }
  }

  function finish() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAssessment({
      kind: "speaking-sample",
      sampleRef: sampleRef ?? undefined,
      selfScores: scores,
      promptId: prompt.id,
    });
    if (sampleRef) {
      addArtifact({ type: "speech", audioRef: sampleRef, promptId: `checkup-${prompt.id}` });
    }
    setStage("done");
  }

  const rubric: { key: keyof SelfScores; label: string }[] = [
    { key: "fluency", label: k.rFluency },
    { key: "confidence", label: k.rConfidence },
    { key: "vocabulary", label: k.rVocabulary },
  ];

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

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 14, justifyContent: "center" }}>
        {stage === "intro" && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted }}>
              {k.intro}
            </Text>
            <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 20, gap: 8 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: c.muted }}>
                {k.promptLabel}
              </Text>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 19, lineHeight: 27, color: c.ink }}>
                {prompt.en}
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19, color: c.muted }}>
                {prompt.ru}
              </Text>
            </View>
            <Pressable
              onPress={() => setStage("record")}
              accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.onBrand }}>{k.start}</Text>
            </Pressable>
          </View>
        )}

        {stage === "record" && (
          <View style={{ alignItems: "center", gap: 16 }}>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 17, lineHeight: 25, color: c.ink, textAlign: "center" }}>
              {prompt.en}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted, textAlign: "center", maxWidth: 300 }}>
              {rec.recording ? k.recording : k.recordHint}
            </Text>
            <Pressable
              onPress={toggleRecord}
              accessibilityRole="button"
              accessibilityLabel={rec.recording ? k.stop : k.record}
              style={({ pressed }) => ({
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: rec.recording ? c.accent : c.brand,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Ionicons name={rec.recording ? "stop" : "mic"} size={40} color={c.onBrand} />
            </Pressable>
            {/* Всегда доступный обход: нет разрешения на микрофон — срез всё равно случится */}
            {!rec.recording && (
              <Pressable onPress={() => setStage("rate")} accessibilityRole="button" hitSlop={8}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: c.muted }}>
                  {k.skipRecord}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {stage === "rate" && (
          <View style={{ gap: 14 }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 20, color: c.ink }}>{k.rateTitle}</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
              {k.rateNote}
            </Text>
            {rubric.map((r) => (
              <View key={r.key} style={{ gap: 8 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>{r.label}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {SCALE.map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setScores((s) => ({ ...s, [r.key]: n }));
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${r.label}: ${n}`}
                      style={{
                        flex: 1,
                        minHeight: 44,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: scores[r.key] === n ? c.brand : c.line,
                        backgroundColor: scores[r.key] >= n && scores[r.key] > 0 ? c.brandSoft : c.surface,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: scores[r.key] >= n ? c.brand : c.muted }}>
                        {n}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            <Pressable
              onPress={finish}
              disabled={!canFinish}
              accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, backgroundColor: canFinish ? c.brand : c.brandSoft, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: canFinish ? c.onBrand : c.muted }}>
                {k.finish}
              </Text>
            </Pressable>
          </View>
        )}

        {stage === "done" && (
          <View style={{ alignItems: "center", gap: 10 }}>
            <Ionicons name="pulse" size={28} color={c.sun} />
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: c.ink, textAlign: "center" }}>
              {k.doneTitle}
            </Text>
            {prev?.selfScores ? (
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
                {k.doneCompare(
                  prev.selfScores.fluency + prev.selfScores.confidence + prev.selfScores.vocabulary,
                  scores.fluency + scores.confidence + scores.vocabulary
                )}
              </Text>
            ) : (
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
                {k.doneFirst}
              </Text>
            )}
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={({ pressed }) => ({ marginTop: 10, minHeight: 48, paddingHorizontal: 28, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.onBrand }}>{k.home}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
