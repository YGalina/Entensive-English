// «Речевой контур» — ежедневная карточка вывода (Фаза A, 09_architecture_plan.md §3).
// Утро: одна фраза о себе. Вечер: статус дня 1–3 предложения. Текстом или голосом.
// После сохранения — мягкая подсказка (prompts, не красная ручка) или похвала.
// Всё приватно и локально: сервер появится в Фазе C.

import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { addArtifact, useOutputStats } from "@ie/core/output";
import { feedbackFor, type FeedbackHint } from "@ie/core/feedback";
import { todaysTouchedCards } from "@ie/core/srs";
import { useVoiceRecorder } from "@ie/media/recorder";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

export function OutputCard() {
  const { c, radius } = useMarina();
  const { t } = useT();
  const stats = useOutputStats();
  const rec = useVoiceRecorder();

  const [text, setText] = useState("");
  const [audioRef, setAudioRef] = useState<string | null>(null);
  const [hints, setHints] = useState<FeedbackHint[] | null>(null);
  const [micError, setMicError] = useState(false);

  // Режим: утро → фраза; после неё (или с вечера) → статус. Вечером статус
  // закрывает контур сам — «утреннюю фразу» в 21:00 не предлагаем.
  const evening = new Date().getHours() >= 17;
  const mode: "morning" | "status" | "done" =
    stats.statusToday && (stats.morningToday || evening)
      ? "done"
      : !stats.morningToday && !evening
        ? "morning"
        : !stats.statusToday
          ? "status"
          : "morning";

  const o = t.output;
  const title = mode === "morning" ? o.morningTitle : o.statusTitle;
  const prompt = mode === "morning" ? o.morningPrompt : o.statusPrompt;
  const placeholder = mode === "morning" ? o.morningPlaceholder : o.statusPlaceholder;

  // Слова из сегодняшней практики, которые человек употребил сам —
  // мост «узнавание → активный запас».
  const usedWords = useMemo(() => {
    const low = text.toLowerCase();
    return todaysTouchedCards()
      .map((card) => card.en)
      .filter((en) => low.includes(en.toLowerCase()));
  }, [text]);

  async function toggleRecord() {
    setMicError(false);
    if (rec.recording) {
      const uri = await rec.stop();
      if (uri) setAudioRef(uri);
      return;
    }
    const ok = await rec.start();
    if (!ok) setMicError(true);
    else void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function save() {
    if (!text.trim() && !audioRef) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addArtifact({
      type: mode === "morning" ? "morning-phrase" : "status",
      text: text.trim() || undefined,
      audioRef: audioRef ?? undefined,
      words: usedWords,
    });
    setHints(text.trim() ? feedbackFor(text) : []);
    setText("");
    setAudioRef(null);
  }

  if (mode === "done") {
    return (
      <View style={{ backgroundColor: c.surface, borderRadius: radius.soft, borderWidth: 1, borderColor: c.line, padding: 14, gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="chatbubble-ellipses" size={16} color={c.brand} />
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>{o.doneTitle}</Text>
        </View>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, color: c.muted }}>
          {o.doneNote(stats.today)}
        </Text>
        {hints !== null && (hints.length > 0 ? <Hints hints={hints} /> : <Praise />)}
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: c.surface, borderRadius: radius.soft, borderWidth: 1, borderColor: c.line, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="chatbubble-ellipses" size={16} color={c.accent} />
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>{title}</Text>
      </View>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted }}>{prompt}</Text>

      {hints !== null && (hints.length > 0 ? <Hints hints={hints} /> : <Praise />)}

      <TextInput
        value={text}
        onChangeText={(v) => {
          setText(v);
          if (hints !== null) setHints(null);
        }}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        multiline
        style={{
          minHeight: 64,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.bg,
          padding: 12,
          fontFamily: "Inter_400Regular",
          fontSize: 15,
          color: c.ink,
          textAlignVertical: "top",
        }}
      />

      {usedWords.length > 0 && (
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11.5, color: c.brand }}>
          {o.usedWords(usedWords.length)} · {usedWords.join(", ")}
        </Text>
      )}
      {audioRef && (
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11.5, color: c.muted }}>
          <Ionicons name="mic" size={11} color={c.brand} /> {o.recordedNote}
        </Text>
      )}
      {micError && (
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11.5, color: c.accent }}>{o.micDenied}</Text>
      )}

      <View style={{ flexDirection: "row", gap: 8 }}>
        {rec.supported && (
          <Pressable
            onPress={toggleRecord}
            accessibilityRole="button"
            accessibilityLabel={rec.recording ? o.stopRecord : o.record}
            style={({ pressed }) => ({
              minHeight: 44,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: rec.recording ? c.accent : c.line,
              backgroundColor: rec.recording ? c.accent : c.surface,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name={rec.recording ? "stop" : "mic"} size={16} color={rec.recording ? c.onBrand : c.brand} />
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13.5, color: rec.recording ? c.onBrand : c.ink }}>
              {rec.recording ? o.stopRecord : o.record}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={save}
          disabled={!text.trim() && !audioRef}
          accessibilityRole="button"
          accessibilityLabel={o.save}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 44,
            borderRadius: 12,
            backgroundColor: !text.trim() && !audioRef ? c.brandSoft : c.brand,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: "Nunito_700Bold",
              fontSize: 15,
              color: !text.trim() && !audioRef ? c.muted : c.onBrand,
            }}
          >
            {o.save}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Hints({ hints }: { hints: FeedbackHint[] }) {
  const { c } = useMarina();
  const { t } = useT();
  return (
    <View style={{ backgroundColor: c.brandSoft, borderRadius: 12, padding: 10, gap: 4 }}>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: c.brandInk }}>
        {t.output.hintTitle}
      </Text>
      {hints.map((h) => (
        <Text key={h.id} style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: c.brandInk }}>
          • {t.output.hints[h.id] ?? h.id}
        </Text>
      ))}
    </View>
  );
}

function Praise() {
  const { c } = useMarina();
  const { t } = useT();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.brandSoft, borderRadius: 12, padding: 10 }}>
      <Ionicons name="sparkles" size={13} color={c.brand} />
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12.5, color: c.brandInk }}>
        {t.output.praise}
      </Text>
    </View>
  );
}
