import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { resolveBlock, TEACHER_BLOCKS } from "@ie/core/data/teacherBlocks";
import { addArtifact } from "@ie/core/output";
import { feedbackFor, type FeedbackHint } from "@ie/core/feedback";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { YouTube, type YouTubeHandle } from "@/components/youtube";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// Блок преподавателя (аудит §8): разогрев chunks → ролик + строки → объясни
// мысль своими словами. Ролик — официальный embed (YouTube), никакого
// рехостинга. Финал пишет OutputArtifact type "explanation" (pushed output).

type Phase = "warmup" | "watch" | "explain" | "done";

export default function BlockScreen() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t, lang } = useT();
  const en = lang === "en";
  const b = t.blockX;
  const params = useLocalSearchParams<{ id?: string }>();

  useActivityTimer("teacher-block");

  const resolved = useMemo(
    () => resolveBlock(params.id ?? TEACHER_BLOCKS[0]?.id ?? ""),
    [params.id]
  );

  const [phase, setPhase] = useState<Phase>("warmup");
  const [text, setText] = useState("");
  const [hints, setHints] = useState<FeedbackHint[] | null>(null);
  const playerRef = useRef<YouTubeHandle | null>(null);
  const playerH = Math.min(240, Math.round(((width - 40) * 9) / 16));

  if (!resolved) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 40, alignItems: "center" }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.muted }}>{b.notFound}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.brand }}>{b.back}</Text>
        </Pressable>
      </View>
    );
  }

  const { block, script } = resolved;

  function save() {
    if (!text.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addArtifact({ type: "explanation", promptId: block.id, text: text.trim() });
    setHints(feedbackFor(text));
    setPhase("done");
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 10 }}>
      {/* Шапка + прогресс фаз */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 19, color: c.ink }} numberOfLines={1}>
            {script.title}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11.5, color: c.muted }} numberOfLines={1}>
            {script.author}
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={b.close}
          hitSlop={8}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close" size={18} color={c.ink} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 20, marginTop: 10 }}>
        {(["warmup", "watch", "explain"] as Phase[]).map((p, i) => {
          const idx = ["warmup", "watch", "explain", "done"].indexOf(phase);
          const active = i <= idx;
          return <View key={p} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: active ? c.brand : c.line }} />;
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
        {/* ——— Фаза 1: разогрев ——— */}
        {phase === "warmup" && (
          <>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: c.muted }}>
              {b.warmupLabel}
            </Text>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 20, lineHeight: 27, color: c.ink }}>
              {en ? block.topicEn : block.topic}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
              {b.warmupNote}
            </Text>
            {block.chunks.map((ch, i) => (
              <Pressable
                key={i}
                onPress={() => speakEnglish(ch.en, { rate: 0.85, interrupt: true })}
                accessibilityRole="button"
                accessibilityLabel={ch.en}
                style={({ pressed }) => ({ backgroundColor: pressed ? c.brandSoft : c.surface, borderRadius: radius.soft, borderWidth: 1, borderColor: c.line, padding: 12, gap: 3 })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="volume-medium-outline" size={14} color={c.brand} />
                  <Text style={{ flex: 1, fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>{ch.en}</Text>
                </View>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted, marginLeft: 22 }}>{ch.ru}</Text>
              </Pressable>
            ))}
            <PhaseButton label={b.toWatch} onPress={() => setPhase("watch")} c={c} />
          </>
        )}

        {/* ——— Фаза 2: смотри и повторяй ——— */}
        {phase === "watch" && (
          <>
            <YouTube ref={playerRef} id={script.youtubeId} height={playerH} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted }}>
              {b.watchNote}
            </Text>
            {script.lines.map((l, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playerRef.current?.seekTo(Math.max(0, l.start - 0.3));
                }}
                accessibilityRole="button"
                accessibilityLabel={l.en}
                style={({ pressed }) => ({ backgroundColor: pressed ? c.brandSoft : c.surface, borderRadius: radius.soft, borderWidth: 1, borderColor: c.line, padding: 12, gap: 3 })}
              >
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Ionicons name="play-circle-outline" size={15} color={c.brand} style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 14.5, lineHeight: 21, color: c.ink }}>{l.en}</Text>
                </View>
                {!!l.ru && (
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, color: c.muted, marginLeft: 23 }}>{l.ru}</Text>
                )}
              </Pressable>
            ))}
            <PhaseButton label={b.toExplain} onPress={() => setPhase("explain")} c={c} />
          </>
        )}

        {/* ——— Фаза 3: объясни мысль ——— */}
        {phase === "explain" && (
          <>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: c.muted }}>
              {b.explainLabel}
            </Text>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, lineHeight: 24, color: c.ink }}>
              {en ? block.outputPromptEn : block.outputPrompt}
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={b.explainPlaceholder}
              placeholderTextColor={c.muted}
              multiline
              style={{ minHeight: 96, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, padding: 12, fontFamily: "Inter_400Regular", fontSize: 15, color: c.ink, textAlignVertical: "top" }}
            />
            <PhaseButton label={b.save} onPress={save} disabled={!text.trim()} c={c} />
          </>
        )}

        {/* ——— Готово ——— */}
        {phase === "done" && (
          <View style={{ alignItems: "center", gap: 10, paddingTop: 20 }}>
            <Ionicons name="school" size={28} color={c.sun} />
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: c.ink, textAlign: "center" }}>
              {b.doneTitle}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
              {b.doneNote}
            </Text>
            {hints !== null && hints.length > 0 && (
              <View style={{ backgroundColor: c.brandSoft, borderRadius: 12, padding: 12, gap: 4, width: "100%" }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: c.brandInk }}>{b.hintTitle}</Text>
                {hints.map((h) => (
                  <Text key={h.id} style={{ fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, color: c.brandInk }}>
                    • {t.output.hints[h.id] ?? h.id}
                  </Text>
                ))}
              </View>
            )}
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={({ pressed }) => ({ marginTop: 10, minHeight: 48, paddingHorizontal: 28, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.onBrand }}>{b.home}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PhaseButton({
  label,
  onPress,
  disabled,
  c,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  c: ReturnType<typeof useMarina>["c"];
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: 14,
        backgroundColor: disabled ? c.brandSoft : c.brand,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: disabled ? c.muted : c.onBrand }}>
        {label}
      </Text>
    </Pressable>
  );
}
