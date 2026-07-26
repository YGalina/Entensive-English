import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { anyAssessedItem } from "@ie/core/data/slice";
import {
  assessmentOrder,
  checkAssessmentAnswer,
  finishPretest,
  recordedAssessmentIds,
  recordAssessmentItem,
  sliceState,
} from "@ie/core/slice";
import {
  ENTRY_ASSESSMENT_COPY,
  handoffFromPretestToFirstSession,
  setOpenAssessmentStage,
} from "@ie/core/entryAssessment";
import { useMarina } from "@/theme";

export default function EntryPretest() {
  const { c } = useMarina();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const total = useMemo(() => assessmentOrder().length, []);
  const order = useMemo(() => {
    const recorded = new Set(recordedAssessmentIds("pretest"));
    return assessmentOrder().filter((id) => !recorded.has(id));
  }, []);
  const completedBeforeOpen = total - order.length;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [message, setMessage] = useState<string | null>(null);
  const item = order[index] ? anyAssessedItem(order[index]) : undefined;
  const number = completedBeforeOpen + index + 1;

  useEffect(() => {
    if (sliceState().pretestAt) {
      handoffFromPretestToFirstSession();
      router.replace("/entry/path-hub");
      return;
    }
    setOpenAssessmentStage("S7");
  }, [router]);

  function submit(blank: boolean) {
    if (!item || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setMessage(null);
    const text = blank ? "" : answer.trim();
    try {
      recordAssessmentItem("pretest", item.id, text, checkAssessmentAnswer(item.id, text));
      const last = index + 1 >= order.length;
      if (last) {
        finishPretest();
        handoffFromPretestToFirstSession();
        router.replace("/entry/path-hub");
        return;
      }
      setAnswer("");
      setIndex((value) => value + 1);
    } catch (error) {
      const duplicate = error instanceof Error && error.message.includes("повторная запись");
      setMessage(
        duplicate
          ? ENTRY_ASSESSMENT_COPY.duplicate
          : ENTRY_ASSESSMENT_COPY.recordFailed
      );
      if (duplicate) {
        setAnswer("");
        setIndex((value) => value + 1);
      }
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        paddingTop: insets.top + 18,
        paddingHorizontal: 26,
        paddingBottom: insets.bottom + 18,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
          {ENTRY_ASSESSMENT_COPY.pretestTitle}
        </Text>
        <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.muted }}>
          {Math.min(number, total)} из {total}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: Math.min(number - 1, total) }}
        style={{ height: 6, borderRadius: 6, backgroundColor: c.brandSoft, marginTop: 12, overflow: "hidden" }}
      >
        <View
          style={{
            width: `${Math.round(((number - 1) / total) * 100)}%`,
            height: "100%",
            backgroundColor: c.ink,
          }}
        />
      </View>

      <View style={{ flex: 1, paddingTop: 36 }}>
        {number === 1 ? (
          <View style={{ backgroundColor: c.brandSoft, borderRadius: 16, padding: 16, marginBottom: 24 }}>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 15, lineHeight: 22, color: c.ink }}>
              {ENTRY_ASSESSMENT_COPY.pretestContract}
            </Text>
          </View>
        ) : null}
        <Text
          style={{
            fontFamily: "GolosText_600SemiBold",
            fontSize: 14,
            letterSpacing: 0.8,
            color: c.muted,
          }}
        >
          {ENTRY_ASSESSMENT_COPY.pretestInstruction}
        </Text>
        <Text
          style={{
            fontFamily: "GolosText_700Bold",
            fontSize: 32,
            lineHeight: 41,
            letterSpacing: -0.6,
            color: c.ink,
            marginTop: 14,
          }}
        >
          {item?.ru ?? ""}
        </Text>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          editable={!submitting}
          placeholder={ENTRY_ASSESSMENT_COPY.inputPlaceholder}
          placeholderTextColor={c.muted}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="done"
          onSubmitEditing={() => answer.trim() && submit(false)}
          style={{
            minHeight: 76,
            borderWidth: 1.5,
            borderColor: c.ink,
            borderRadius: 16,
            backgroundColor: c.surface,
            paddingHorizontal: 18,
            paddingVertical: 14,
            fontFamily: "GolosText_400Regular",
            fontSize: 18,
            color: c.ink,
            marginTop: 24,
          }}
        />
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 10 }}>
          {ENTRY_ASSESSMENT_COPY.autocorrectOff}
        </Text>
        {message ? (
          <Text accessibilityRole="alert" style={{ fontFamily: "GolosText_500Medium", fontSize: 14, color: c.muted, marginTop: 12 }}>
            {message}
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", gap: 10, marginTop: "auto" }}>
          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => submit(true)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 56,
              borderWidth: 1.5,
              borderColor: c.line,
              borderRadius: 16,
              backgroundColor: pressed ? c.brandSoft : c.surface,
              alignItems: "center",
              justifyContent: "center",
              opacity: submitting ? 0.55 : 1,
            })}
          >
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 17, color: c.ink }}>
              {ENTRY_ASSESSMENT_COPY.skip}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!answer.trim() || submitting}
            onPress={() => submit(false)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 56,
              borderRadius: 16,
              backgroundColor: answer.trim() ? c.ink : c.brandSoft,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: "GolosText_700Bold",
                fontSize: 17,
                color: answer.trim() ? c.bg : c.muted,
              }}
            >
              {ENTRY_ASSESSMENT_COPY.next}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
