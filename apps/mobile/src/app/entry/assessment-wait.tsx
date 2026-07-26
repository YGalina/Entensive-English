import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ASSESSMENT_TOTAL_DAYS,
  ASSESSMENT_TOTAL_SESSIONS,
  ENTRY_ASSESSMENT_COPY,
  assessmentGateView,
} from "@ie/core/entryAssessment";
import { sliceState } from "@ie/core/slice";
import { useMarina } from "@/theme";

function Segments({ value, total, color, empty }: { value: number; total: number; color: string; empty: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 3, marginTop: 16 }}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={{ flex: 1, height: 12, borderRadius: 3, backgroundColor: index < value ? color : empty }}
        />
      ))}
    </View>
  );
}

export default function AssessmentWait() {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const state = sliceState();
  const started = state.pretestAt ?? Date.now();
  const gate = assessmentGateView(started, state.sessionsCompleted);
  const date = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(gate.opensAt));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        paddingTop: insets.top + 28,
        paddingHorizontal: 26,
        paddingBottom: insets.bottom + 28,
      }}
    >
      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 32, lineHeight: 38, color: c.ink }}>
        {ENTRY_ASSESSMENT_COPY.waitTitle}
      </Text>
      <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 17, lineHeight: 25, color: c.muted, marginTop: 12 }}>
        Откроется после 14 сессий, но не раньше {date}.
      </Text>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 20, padding: 20, marginTop: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c.accent }} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink, marginLeft: 9 }}>
            {ENTRY_ASSESSMENT_COPY.sessions}
          </Text>
          <Text style={{ marginLeft: "auto", fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
            {gate.sessions} из {ASSESSMENT_TOTAL_SESSIONS}
          </Text>
        </View>
        <Segments value={gate.sessions} total={ASSESSMENT_TOTAL_SESSIONS} color={c.accent} empty={c.brandSoft} />
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 10 }}>
          осталось {gate.sessionsRemaining} сессии
        </Text>
      </View>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 20, padding: 20, marginTop: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c.amber }} />
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink, marginLeft: 9 }}>
            {ENTRY_ASSESSMENT_COPY.days}
          </Text>
          <Text style={{ marginLeft: "auto", fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
            {gate.days} из {ASSESSMENT_TOTAL_DAYS}
          </Text>
        </View>
        <Segments value={gate.days} total={ASSESSMENT_TOTAL_DAYS} color={c.amber} empty={c.brandSoft} />
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 10 }}>
          осталось {gate.daysRemaining} дней · {date}
        </Text>
      </View>

      <View style={{ backgroundColor: c.brandSoft, borderRadius: 14, padding: 18, marginTop: 14 }}>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 16, lineHeight: 24, color: c.ink }}>
          {ENTRY_ASSESSMENT_COPY.waitNote}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/entry/path-hub")}
        style={({ pressed }) => ({
          minHeight: 56,
          borderWidth: 1.5,
          borderColor: c.line,
          borderRadius: 16,
          backgroundColor: pressed ? c.brandSoft : c.surface,
          alignItems: "center",
          justifyContent: "center",
          marginTop: "auto",
        })}
      >
        <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 17, color: c.ink }}>
          {ENTRY_ASSESSMENT_COPY.backToPractice}
        </Text>
      </Pressable>
    </View>
  );
}
