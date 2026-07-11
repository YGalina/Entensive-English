import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { addArtifact, listArtifacts } from "@ie/core/output";
import { todaysTouchedCards } from "@ie/core/srs";
import { storage } from "@ie/core/storage";
import { useT } from "@/lib/i18n";

// «Вечерний круг» v2 (макет 38a): три шага в focus-палитре «лампы».
//   1) Состояние — 4 варианта, «что-то мешало» открывает стражей;
//   2) Статус дня по-английски с подсказками из сегодняшних слов;
//   3) Тёплое закрытие: факты дня, твой статус N-й записью, строчка про
//      часть, которой дали место. Состояние сохраняется (ie_evening_mood) —
//      завтрашний план сможет подстроиться: «устала» → короче.

const N = {
  bgTop: "#26221b",
  bg: "#211d16",
  surface: "rgba(255,255,255,.06)",
  surfaceHi: "rgba(255,255,255,.07)",
  line: "rgba(255,255,255,.1)",
  ink: "#f5efe2",
  muted: "#9c937d",
  soft: "#c9c0ab",
  brass: "#e8b36a",
  brassInk: "#2a2214",
  brassLabel: "#d9a75f",
  mint: "#7fc9a4",
};

type Mood = "calm" | "tired" | "charged" | "blocked";
type GuardianId = "devalue" | "fear" | "mock" | "perfect";

const MOOD_DOT: Record<Mood, string> = {
  calm: "#e8b36a",
  tired: "#7C93B8",
  charged: "#7fc9a4",
  blocked: "#E8934D",
};

const GUARDIANS: { id: GuardianId; colors: [string, string]; eye: string; radii: [number, number, number, number] }[] = [
  { id: "devalue", colors: ["#93A7C9", "#7C93B8"], eye: "#26303f", radii: [21, 19, 18, 22] },
  { id: "fear", colors: ["#F2B45E", "#E8934D"], eye: "#3a2c14", radii: [18, 22, 21, 19] },
  { id: "mock", colors: ["#EC93B4", "#E07AA0"], eye: "#4a2233", radii: [19, 21, 22, 18] },
  { id: "perfect", colors: ["#AE9BE2", "#9B84D9"], eye: "#33265a", radii: [20, 20, 20, 20] },
];

export default function EveningScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const e = t.eveningX;
  const plan = useDayPlan();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mood, setMood] = useState<Mood | null>(null);
  const [guardian, setGuardian] = useState<GuardianId | null>(null);
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");

  const chips = useMemo(() => todaysTouchedCards().slice(0, 3).map((card) => card.en), []);
  const statusCount = useMemo(
    () => listArtifacts().filter((a) => a.type === "status").length,
    []
  );
  const spokeToday = useMemo(
    () => listArtifacts(20).some((a) => a.createdAt >= Date.now() - 18 * 36e5 && a.audioRef),
    []
  );

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function next1() {
    if (!mood) return;
    tap();
    // Состояние — на завтра: план сможет подстроиться («устала» → короче).
    storage().setItem("ie_evening_mood", JSON.stringify({ day: new Date().toISOString().slice(0, 10), mood }));
    setStep(2);
  }

  function saveStatus() {
    const trimmed = text.trim();
    if (trimmed) {
      addArtifact({
        type: "status",
        text: trimmed,
        words: chips.filter((w) => trimmed.toLowerCase().includes(w.toLowerCase())),
      });
      setSavedText(trimmed);
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep(3);
  }

  function closeDay() {
    tap();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  const dateLabel = (() => {
    const d = new Date();
    const M_RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
    return `${d.getDate()} ${M_RU[d.getMonth()]}`;
  })();

  return (
    <LinearGradient colors={[N.bgTop, N.bg]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: insets.top + 14, paddingBottom: insets.bottom + 20, gap: 14, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Шапка шага */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, letterSpacing: 1.1, textTransform: "uppercase", color: N.brassLabel }}>
                {step === 3 ? e.doneLabel : e.stepLabel(step)}
              </Text>
              {step !== 3 && (
                <Text style={{ fontFamily: "Lora_500Medium", fontSize: 23, lineHeight: 30, color: N.ink, marginTop: 7 }}>
                  {step === 1 ? e.q1Title : e.q2Title}
                </Text>
              )}
              {step !== 3 && (
                <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 18, color: N.muted, marginTop: 6 }}>
                  {step === 1 ? e.q1Note : e.q2Note}
                </Text>
              )}
            </View>
            <Pressable
              onPress={closeDay}
              accessibilityRole="button"
              accessibilityLabel={t.diaryX.close}
              hitSlop={8}
              style={({ pressed }) => ({ width: 34, height: 34, borderRadius: 17, backgroundColor: N.surface, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="close" size={18} color={N.soft} />
            </Pressable>
          </View>

          {step === 1 && (
            <>
              <View style={{ gap: 10, marginTop: 4 }}>
                {(["calm", "tired", "charged", "blocked"] as Mood[]).map((m) => {
                  const on = mood === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => {
                        tap();
                        setMood(m);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 13,
                        borderRadius: 16,
                        borderWidth: 1.5,
                        borderColor: on ? N.brass : "transparent",
                        backgroundColor: on ? "rgba(232,179,106,.12)" : N.surface,
                        paddingHorizontal: 15,
                        minHeight: 62,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      })}
                    >
                      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: MOOD_DOT[m], opacity: on ? 1 : 0.55 }} />
                      <View style={{ flex: 1, paddingVertical: 10 }}>
                        <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14.5, color: N.ink }}>
                          {e.moods[m].title}
                        </Text>
                        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, color: N.muted, marginTop: 1 }}>
                          {e.moods[m].note}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* «Что-то мешало» — вход к стражам */}
              {mood === "blocked" && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: N.muted }}>
                    {e.guardianLabel}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 9, alignItems: "center" }}>
                    {GUARDIANS.map((g) => {
                      const on = guardian === g.id;
                      return (
                        <Pressable
                          key={g.id}
                          onPress={() => {
                            tap();
                            setGuardian(on ? null : g.id);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={e.guardianNames[g.id]}
                          accessibilityState={{ selected: on }}
                          style={{ width: on ? 46 : 40, height: on ? 46 : 40, opacity: on ? 1 : 0.4 }}
                        >
                          <LinearGradient
                            colors={g.colors}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0.8, y: 1 }}
                            style={{ flex: 1, borderTopLeftRadius: g.radii[0], borderTopRightRadius: g.radii[1], borderBottomRightRadius: g.radii[2], borderBottomLeftRadius: g.radii[3] }}
                          >
                            <View style={{ position: "absolute", left: "28%", top: "40%", width: 4, height: 4, borderRadius: 2, backgroundColor: g.eye }} />
                            <View style={{ position: "absolute", right: "28%", top: "40%", width: 4, height: 4, borderRadius: 2, backgroundColor: g.eye }} />
                          </LinearGradient>
                        </Pressable>
                      );
                    })}
                    <Text style={{ flex: 1, fontFamily: "GolosText_500Medium", fontSize: 11, lineHeight: 15, color: N.soft, marginLeft: 4 }}>
                      {guardian ? e.guardianPassed(e.guardianNames[guardian]) : e.guardianAsk}
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ flex: 1 }} />
              <Pressable
                onPress={next1}
                disabled={!mood}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: 50,
                  borderRadius: 14,
                  backgroundColor: N.brass,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: mood ? 1 : 0.4,
                  transform: [{ scale: pressed && mood ? 0.98 : 1 }],
                })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: N.brassInk }}>{e.next}</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <>
              {chips.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: N.muted }}>
                    {e.chipsLabel}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                    {chips.map((w) => (
                      <Pressable
                        key={w}
                        onPress={() => {
                          tap();
                          setText((v) => (v.trim().length ? `${v.trimEnd()} ${w}` : w));
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={w}
                        style={({ pressed }) => ({ paddingHorizontal: 11, minHeight: 34, justifyContent: "center", borderRadius: 17, backgroundColor: N.surfaceHi, opacity: pressed ? 0.6 : 1 })}
                      >
                        <Text style={{ fontFamily: "Lora_500Medium", fontSize: 12, color: N.soft }}>{w}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
              <View style={{ backgroundColor: N.surfaceHi, borderWidth: 1, borderColor: N.line, borderRadius: 15, padding: 13, minHeight: 110 }}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={e.statusPlaceholder}
                  placeholderTextColor={N.muted}
                  multiline
                  autoFocus
                  style={{ fontFamily: "Lora_400Regular", fontSize: 15, lineHeight: 23, color: N.ink, minHeight: 84 }}
                />
              </View>
              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, lineHeight: 17, color: N.muted }}>
                {e.emptyHint}
              </Text>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={saveStatus}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: 50,
                  borderRadius: 14,
                  backgroundColor: N.brass,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: N.brassInk }}>
                  {text.trim() ? e.saveStatus : e.skipStatus}
                </Text>
              </Pressable>
            </>
          )}

          {step === 3 && (
            <>
              <View style={{ alignItems: "center", gap: 12, marginTop: 18 }}>
                {/* тёплый свет лампы */}
                <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: N.brass, shadowColor: N.brass, shadowOpacity: 0.55, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 8 }} />
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 26, letterSpacing: -0.4, color: N.ink, marginTop: 8 }}>
                  {e.doneTitle}
                </Text>
                <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, color: N.muted, textAlign: "center" }}>
                  {e.doneFacts(plan.todayMin, spokeToday, savedText.length > 0)}
                </Text>
              </View>

              {savedText.length > 0 && (
                <View style={{ backgroundColor: N.surfaceHi, borderWidth: 1, borderColor: N.line, borderRadius: 16, padding: 15, gap: 6 }}>
                  <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, letterSpacing: 0.9, textTransform: "uppercase", color: N.brassLabel }}>
                    {e.yourStatus(dateLabel)}
                  </Text>
                  <Text style={{ fontFamily: "Lora_400Regular_Italic", fontSize: 14.5, lineHeight: 22, color: N.ink }}>
                    “{savedText}”
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11, color: N.muted }}>
                    {e.entryN(statusCount)}
                  </Text>
                </View>
              )}

              {mood === "blocked" && (
                <View style={{ flexDirection: "row", gap: 11, alignItems: "center", backgroundColor: N.surface, borderRadius: 15, padding: 13 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#E8934D", opacity: 0.85, alignItems: "center", justifyContent: "center" }}>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: "#3a2c14" }} />
                      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: "#3a2c14" }} />
                    </View>
                  </View>
                  <Text style={{ flex: 1, fontFamily: "Lora_400Regular_Italic", fontSize: 12.5, lineHeight: 18, color: N.soft }}>
                    {e.guardianClosing}
                  </Text>
                </View>
              )}

              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: N.muted, textAlign: "center", marginTop: 4 }}>
                {e.tomorrow}
              </Text>

              <View style={{ flex: 1 }} />
              <Pressable
                onPress={closeDay}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: 50,
                  borderRadius: 14,
                  backgroundColor: N.surfaceHi,
                  borderWidth: 1,
                  borderColor: N.line,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: N.ink }}>{e.closeCta}</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
