import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { STORIES, type Story } from "@ie/core/data/reading";
import {
  booksForReader,
  chunkGutenbergText,
  gutenbergChunkToStory,
  gutenbergTextCandidates,
  type GutenbergBook,
} from "@ie/core/data/gutenberg";
import { usePrefs } from "@ie/core/prefs";
import { useActivityTimer } from "@ie/core/timelog";
import { recordWpm, useWpmStats } from "@ie/core/wpm";
import { nowMs } from "@ie/core/now";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Читать» — массив текста потоком, не по слову. Замер WPM — главный
// измеримый KPI метода. Два уровня: короткие тексты (вшиты, с переводом) и
// ЦЕЛЫЕ КНИГИ — реальный текст Project Gutenberg главами (загрузка на лету,
// разбивка — общий с web конвейер @ie/core). Читаем ради удовольствия.

function wordCount(s: Story): number {
  return s.paras.reduce((a, p) => a + p.en.split(/\s+/).filter(Boolean).length, 0);
}

export default function ReadScreen() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const tone = sk.reading;
  const wpmStats = useWpmStats();
  const prefs = usePrefs();
  const { t } = useT();

  const books = useMemo(
    () => booksForReader(prefs?.topics ?? [], prefs?.level),
    [prefs?.topics, prefs?.level]
  );

  // Читалка открыта, когда задан activeStory (короткий текст ИЛИ глава книги).
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showRu, setShowRu] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [resultWpm, setResultWpm] = useState<number | null>(null);

  // Режим книги: выбранная книга + её главы (фрагменты).
  const [book, setBook] = useState<GutenbergBook | null>(null);
  const [chunks, setChunks] = useState<Story[]>([]);
  const [loadingBook, setLoadingBook] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  const words = activeStory ? wordCount(activeStory) : 0;
  const reading = !!activeStory && startedAt !== null && resultWpm === null;
  const hasRu = !!activeStory?.paras.some((p) => p.ru);

  useActivityTimer(focused && reading ? "reading" : null);
  const scrollRef = useRef<ScrollView | null>(null);

  function openStory(s: Story) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveStory(s);
    setShowRu(false);
    setResultWpm(null);
    setStartedAt(nowMs());
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function finish() {
    if (!activeStory || startedAt === null) return;
    const elapsedSec = (nowMs() - startedAt) / 1000;
    const wpm = Math.round((words / Math.max(1, elapsedSec)) * 60);
    recordWpm(wpm, words, elapsedSec);
    setResultWpm(wpm);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function closeReader() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveStory(null);
    setStartedAt(null);
    setResultWpm(null);
  }

  async function openBook(b: GutenbergBook) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBook(b);
    setChunks([]);
    setBookError(null);
    setLoadingBook(true);
    try {
      let raw: string | null = null;
      for (const url of gutenbergTextCandidates(b.gutenbergId)) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const text = await res.text();
          if (text.length > 10000 || text.includes("Project Gutenberg")) {
            raw = text;
            break;
          }
        } catch {}
      }
      if (!raw) throw new Error("no text");
      const cs = chunkGutenbergText(b, raw).map(gutenbergChunkToStory);
      if (cs.length === 0) throw new Error("no chunks");
      setChunks(cs);
    } catch {
      setBookError("err");
    } finally {
      setLoadingBook(false);
    }
  }

  function closeBook() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBook(null);
    setChunks([]);
    setBookError(null);
  }

  useEffect(() => {
    if (!focused && reading) setStartedAt(nowMs());
  }, [focused, reading]);

  /* ---------- Читалка (короткий текст или глава книги) ---------- */
  if (activeStory) {
    const s = activeStory;
    return (
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 32, gap: 14 }}
      >
        <Pressable
          onPress={closeReader}
          accessibilityRole="button"
          accessibilityLabel={book ? t.readX.toChapters : t.readX.toTexts}
          hitSlop={8}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="chevron-back" size={18} color={c.muted} />
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>
            {book ? t.readX.toChapters : t.readX.toTexts}
          </Text>
        </Pressable>

        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 26, lineHeight: 32, color: c.ink }}>
            {s.title}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
            {s.author} · {words} {t.readX.words} · {t.readX.genres[s.genre]} · {s.level.toUpperCase()}
          </Text>
        </View>

        {resultWpm === null ? (
          <>
            <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 20, gap: 16 }}>
              {s.paras.map((p, i) => (
                <View key={i} style={{ gap: 8 }}>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 17, lineHeight: 27, color: c.ink }}>
                    {p.en}
                  </Text>
                  {showRu && p.ru ? (
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted }}>
                      {p.ru}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>

            {hasRu ? (
              <Pressable
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowRu((v) => !v);
                }}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: 48,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: c.line,
                  backgroundColor: showRu ? c.brandSoft : c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Ionicons name="language" size={16} color={c.brandD} />
                <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.brandD }}>
                  {showRu ? t.readX.hideRu : t.readX.showRu}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={finish}
              accessibilityRole="button"
              style={({ pressed }) => ({
                minHeight: 56,
                borderRadius: 16,
                backgroundColor: c.accent,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Ionicons name="checkmark" size={18} color="#ffffff" />
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#ffffff" }}>
                {t.readX.finished}
              </Text>
            </Pressable>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, color: c.muted, textAlign: "center" }}>
              {t.readX.flowHint}
            </Text>
          </>
        ) : (
          <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 24, gap: 12, alignItems: "center" }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="speedometer" size={26} color={tone} />
            </View>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 40, color: tone, fontVariant: ["tabular-nums"] }}>
              {resultWpm}
            </Text>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.ink }}>{t.readX.wpmUnit}</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, color: c.muted, textAlign: "center" }}>
              {resultWpm >= 200 ? t.readX.praiseHigh : resultWpm >= 140 ? t.readX.praiseMid : t.readX.praiseLow}
              {wpmStats.best && resultWpm >= wpmStats.best ? t.readX.record : ""}
            </Text>
            <Pressable
              onPress={closeReader}
              accessibilityRole="button"
              style={({ pressed }) => ({ alignSelf: "stretch", minHeight: 52, borderRadius: 16, backgroundColor: c.accent, alignItems: "center", justifyContent: "center", marginTop: 6, transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#ffffff" }}>
                {book ? t.readX.nextChapter : t.readX.anotherText}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  }

  /* ---------- Книга: список глав (фрагментов) ---------- */
  if (book) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 32, gap: 14 }}
      >
        <Pressable
          onPress={closeBook}
          accessibilityRole="button"
          accessibilityLabel={t.readX.toLibrary}
          hitSlop={8}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="chevron-back" size={18} color={c.muted} />
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>{t.readX.toLibrary}</Text>
        </Pressable>

        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 26, lineHeight: 32, color: c.ink }}>
            {book.title}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
            {book.author} · {book.level.toUpperCase()} · Project Gutenberg
          </Text>
        </View>

        {loadingBook ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 12 }}>
            <ActivityIndicator color={tone} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: c.muted }}>
              {t.readX.loading}
            </Text>
          </View>
        ) : bookError ? (
          <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 20, gap: 12, alignItems: "center" }}>
            <Ionicons name="cloud-offline-outline" size={28} color={c.muted} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center" }}>
              {t.readX.loadError}
            </Text>
            <Pressable
              onPress={() => openBook(book)}
              accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 22, borderRadius: 14, backgroundColor: c.accent, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: "#ffffff" }}>{t.common.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
              {t.readX.chaptersMeta(chunks.length)}
            </Text>
            {chunks.map((ch, i) => (
              <Pressable
                key={ch.id}
                onPress={() => openStory(ch)}
                accessibilityRole="button"
                accessibilityLabel={t.readX.chapterN(i + 1)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: pressed ? c.brandSoft : c.surface,
                  borderRadius: radius.soft,
                  borderWidth: 1,
                  borderColor: c.line,
                  padding: 14,
                  minHeight: 60,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                })}
              >
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: tone }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>
                    {t.readX.chapterN(i + 1)}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
                    {t.readX.approxWords(wordCount(ch))}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.muted} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    );
  }

  /* ---------- Библиотека: книги (по интересам) + короткие тексты ---------- */
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 32, gap: 12 }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 30, color: c.ink }}>{t.readX.title}</Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
          {t.readX.subtitle}
          {wpmStats.last ? t.readX.lastWpm(wpmStats.last) : ""}
        </Text>
      </View>

      {/* Книги целиком (реальный текст Gutenberg главами), под интересы */}
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 17, color: c.ink, marginTop: 6 }}>{t.readX.books}</Text>
      {books.map((b) => (
        <Pressable
          key={b.bookId}
          onPress={() => openBook(b)}
          accessibilityRole="button"
          accessibilityLabel={`${b.title}, ${b.author}, уровень ${b.level.toUpperCase()}`}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: pressed ? c.brandSoft : c.surface,
            borderRadius: radius.soft,
            borderWidth: 1,
            borderColor: c.line,
            padding: 14,
            minHeight: 64,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="book" size={20} color={tone} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>{b.title}</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
              {b.author} · {b.level.toUpperCase()} · {t.readX.byChapters}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </Pressable>
      ))}

      {/* Короткие тексты (с переводом) */}
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 17, color: c.ink, marginTop: 10 }}>
        {t.readX.shorts}
      </Text>
      {STORIES.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => openStory(s)}
          accessibilityRole="button"
          accessibilityLabel={`${s.title}, ${s.author}, уровень ${s.level.toUpperCase()}`}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: pressed ? c.brandSoft : c.surface,
            borderRadius: radius.soft,
            borderWidth: 1,
            borderColor: c.line,
            padding: 14,
            minHeight: 64,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 12, color: tone }}>
              {s.level.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>{s.title}</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
              {s.author} · {wordCount(s)} {t.readX.words} · {t.readX.genres[s.genre]} · {s.excerpt ? t.readX.fragment : t.readX.whole}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}
