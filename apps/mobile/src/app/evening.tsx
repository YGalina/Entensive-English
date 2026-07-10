import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDayPlan } from "@ie/core/dayplan";
import { addArtifact, useOutputStats } from "@ie/core/output";
import { todaysTouchedCards } from "@ie/core/srs";
import { useT } from "@/lib/i18n";

// «Вечерний круг» — единственный экран в ночном режиме «свет лампы» (макет 4a,
// docs/design): не ночная глубина, а тёплая тёмная бумага и латунный акцент.
// Три шага: состояние (взрослые слова, без смайликов) → кто из стражей
// приходил + факт «ты прошла» → статус дня по-английски с подсказками из
// сегодняшних слов. Активный вывод закрывает день.

// Ночная палитра — фиксированная, не зависит от темы приложения (дизайн §02).
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

type GuardianId = "devalue" | "fear" | "mock" | "perfect";

const GUARDIANS: {
  id: GuardianId;
  colors: [string, string];
  eye: string;
  radii: [number, number, number, number];
}[] = [
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
  const outStats = useOutputStats();

  const [mood, setMood] = useState<"hard" | "even" | "easy" | null>(null);
  const [guardian, setGuardian] = useState<GuardianId | null>(null);
  const [text, setText] = useState("");
  const [closed, setClosed] = useState(false);

  const chips = useMemo(
    () => todaysTouchedCards().slice(0, 3).map((card) => card.en),
    []
  );
  const wordsToday = useMemo(() => todaysTouchedCards().length, []);
  const spokeToday = outStats.today > 0;

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function addChip(w: string) {
    tap();
    setText((v) => (v.trim().length ? `${v.trimEnd()} ${w}` : w));
  }

  function closeDay() {
    const trimmed = text.trim();
    if (trimmed) {
      addArtifact({ type: "status", text: trimmed, words: chips.filter((w) => trimmed.toLowerCase().includes(w.toLowerCase())) });
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setClosed(true);
    setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }, 900);
  }

  return (
    <LinearGradient colors={[N.bgTop, N.bg]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: insets.top + 14, paddingBottom: insets.bottom + 20, gap: 14 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Шапка */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, letterSpacing: 1.1, textTransform: "uppercase", color: N.brassLabel }}>
                {e.label}
              </Text>
              <Text style={{ fontFamily: "Lora_500Medium", fontSize: 23, lineHeight: 29, color: N.ink, marginTop: 7 }}>
                {e.titleA}
                {"\n"}
                <Text style={{ fontFamily: "Lora_500Medium_Italic" }}>{e.titleB}</Text>
              </Text>
            </View>
            <Pressable
              onPress={() => {
                tap();
                router.back();
              }}
              accessibilityRole="button"
              accessibilityLabel={t.diaryX.close}
              hitSlop={8}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: N.surface,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="close" size={18} color={N.soft} />
            </Pressable>
          </View>

          {/* Факты дня */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Fact value={e.factMin(plan.todayMin)} label={e.factMinLabel} />
            <Fact value={e.factWords(wordsToday)} label={e.factWordsLabel} />
            <Fact value={spokeToday ? e.factSpeechYes : "—"} label={e.factSpeechLabel} tone={spokeToday ? N.mint : N.soft} />
          </View>

          {/* Состояние */}
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: N.muted, marginTop: 2 }}>
            {e.stateLabel}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([
              ["hard", e.stateHard],
              ["even", e.stateEven],
              ["easy", e.stateEasy],
            ] as const).map(([id, label]) => {
              const on = mood === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    tap();
                    setMood(id);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 44,
                    borderRadius: 12,
                    backgroundColor: on ? N.brass : N.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text style={{ fontFamily: on ? "GolosText_600SemiBold" : "GolosText_500Medium", fontSize: 12, color: on ? N.brassInk : N.soft }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Кто сегодня приходил */}
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: N.muted, marginTop: 2 }}>
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
                    style={{
                      flex: 1,
                      borderTopLeftRadius: g.radii[0],
                      borderTopRightRadius: g.radii[1],
                      borderBottomRightRadius: g.radii[2],
                      borderBottomLeftRadius: g.radii[3],
                    }}
                  >
                    <View style={{ position: "absolute", left: "28%", top: "40%", width: 4, height: 4, borderRadius: 2, backgroundColor: g.eye }} />
                    <View style={{ position: "absolute", right: "28%", top: "40%", width: 4, height: 4, borderRadius: 2, backgroundColor: g.eye }} />
                  </LinearGradient>
                </Pressable>
              );
            })}
            <Text style={{ flex: 1, fontFamily: "GolosText_500Medium", fontSize: 11, lineHeight: 15, color: N.soft, marginLeft: 4 }}>
              {guardian ? e.guardianPassed(e.guardianNames[guardian]) : e.guardianNone}
            </Text>
          </View>

          {/* Статус дня по-английски */}
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: N.muted, marginTop: 2 }}>
            {e.statusLabel}
          </Text>
          <View style={{ backgroundColor: N.surfaceHi, borderWidth: 1, borderColor: N.line, borderRadius: 15, padding: 13, minHeight: 74 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={e.statusPlaceholder}
              placeholderTextColor={N.muted}
              multiline
              style={{ fontFamily: "Lora_400Regular", fontSize: 14.5, lineHeight: 22, color: N.ink, minHeight: 48 }}
            />
          </View>
          {chips.length > 0 && (
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {chips.map((w) => (
                <Pressable
                  key={w}
                  onPress={() => addChip(w)}
                  accessibilityRole="button"
                  accessibilityLabel={w}
                  style={({ pressed }) => ({
                    paddingHorizontal: 11,
                    minHeight: 32,
                    justifyContent: "center",
                    borderRadius: 16,
                    backgroundColor: N.surfaceHi,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text style={{ fontFamily: "Lora_500Medium", fontSize: 11.5, color: N.soft }}>{w}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ flex: 1 }} />

          {/* Закрыть день */}
          <Pressable
            onPress={closeDay}
            disabled={closed}
            accessibilityRole="button"
            style={({ pressed }) => ({
              minHeight: 50,
              borderRadius: 14,
              backgroundColor: N.brass,
              alignItems: "center",
              justifyContent: "center",
              opacity: closed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: N.brassInk }}>
              {closed ? e.closed : e.closeCta}
            </Text>
          </Pressable>
          <Text style={{ textAlign: "center", fontFamily: "GolosText_400Regular", fontSize: 11, color: N.muted }}>
            {e.tomorrow}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Fact({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: N.surface, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 4, alignItems: "center" }}>
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: tone ?? N.ink, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 10, color: N.muted, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
