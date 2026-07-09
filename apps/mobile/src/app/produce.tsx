import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { dueProduceCards, recordProduceAnswer, type Card } from "@ie/core/srs";
import { findWord, getPack, translate, type Word } from "@ie/core/data/packs";
import { LEVEL_PACKS } from "@ie/core/data/levelVocab";
import { useNativeLang } from "@ie/core/prefs";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Скажи сама» — продуктивное извлечение (SRS v2, Фаза A). Направление,
// которое закрывает разрыв «понимаю, но не говорю»: смысл на родном →
// человек произносит форму САМ → потом проверяет себя. Retrieval строго
// специфичен направлению — поэтому это отдельный ритуал, не «узнавание».

const SESSION_LIMIT = 10;

export default function ProduceScreen() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const lang = useNativeLang();
  const p = t.produceX;

  useActivityTimer("produce");

  // Очередь фиксируется на входе (не дёргается при ответах).
  const queue = useMemo(() => {
    const levelIndex = new Map<string, Word>();
    for (const pk of LEVEL_PACKS) {
      if (pk.id === "level-mega") continue;
      for (const w of pk.words) levelIndex.set(w.en.toLowerCase(), w);
    }
    const lookup = (en: string): Word | undefined =>
      findWord(en) ?? levelIndex.get(en.toLowerCase());
    return dueProduceCards(SESSION_LIMIT)
      .map((card) => ({ card, word: lookup(card.en) }))
      .filter((x): x is { card: Card; word: Word } => Boolean(x.word));
  }, []);

  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saidCount, setSaidCount] = useState(0);

  const cur = queue[i];
  const done = !cur;

  function reveal() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealed(true);
    speakEnglish(cur.word.en, { rate: 0.9, interrupt: true });
  }

  function answer(known: boolean) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordProduceAnswer(cur.card.packId, cur.card.en, known);
    if (known) setSaidCount((n) => n + 1);
    setRevealed(false);
    setI((n) => n + 1);
  }

  const meaning = cur ? translate(cur.word, lang) : null;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 10 }}>
      {/* Шапка */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 10 }}>
        <Text style={{ flex: 1, fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: c.ink }}>
          {p.title}
        </Text>
        {!done && (
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: c.muted, fontVariant: ["tabular-nums"] }}>
            {p.counter(Math.min(i + 1, queue.length), queue.length)}
          </Text>
        )}
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

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 14, justifyContent: "center" }}>
        {done ? (
          <View style={{ alignItems: "center", gap: 10 }}>
            <Ionicons name="sparkles" size={28} color={c.sun} />
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: c.ink, textAlign: "center" }}>
              {queue.length === 0 ? p.emptyTitle : p.doneTitle}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
              {queue.length === 0 ? p.emptyNote : p.doneNote(saidCount, queue.length)}
            </Text>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={({ pressed }) => ({ marginTop: 10, minHeight: 48, paddingHorizontal: 28, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.onBrand }}>{p.home}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted, textAlign: "center" }}>
              {p.intro}
            </Text>

            {/* Смысл на родном — крупно */}
            <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 24, gap: 14, alignItems: "center" }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: c.muted }}>
                {p.meaningLabel}
              </Text>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 26, lineHeight: 34, color: c.ink, textAlign: "center" }}>
                {meaning?.text}
              </Text>

              {revealed ? (
                <Pressable
                  onPress={() => speakEnglish(cur.word.en, { rate: 0.9, interrupt: true })}
                  accessibilityRole="button"
                  accessibilityLabel={cur.word.en}
                  style={{ alignItems: "center", gap: 4 }}
                >
                  <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.brand }}>
                    {cur.word.en}
                  </Text>
                  {!!cur.word.ipa && (
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>{cur.word.ipa}</Text>
                  )}
                </Pressable>
              ) : (
                <Pressable
                  onPress={reveal}
                  accessibilityRole="button"
                  accessibilityLabel={p.reveal}
                  style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 22, borderRadius: 14, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, opacity: pressed ? 0.85 : 1 })}
                >
                  <Ionicons name="eye" size={16} color={c.brand} />
                  <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.brandInk }}>{p.reveal}</Text>
                </Pressable>
              )}
            </View>

            {revealed && (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => answer(false)}
                  accessibilityRole="button"
                  accessibilityLabel={p.notYet}
                  style={({ pressed }) => ({ flex: 1, minHeight: 52, borderRadius: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
                >
                  <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>{p.notYet}</Text>
                </Pressable>
                <Pressable
                  onPress={() => answer(true)}
                  accessibilityRole="button"
                  accessibilityLabel={p.said}
                  style={({ pressed }) => ({ flex: 1, minHeight: 52, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
                >
                  <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.onBrand }}>{p.said}</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
