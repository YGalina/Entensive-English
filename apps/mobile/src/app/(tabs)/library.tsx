import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePrefs } from "@ie/core/prefs";
import { knownWordSet } from "@ie/core/srs";
import { STORIES, storiesByLevel, wordCount, type Story } from "@ie/core/data/reading";
import { booksForReader } from "@ie/core/data/gutenberg";
import { SHADOWING, CATEGORY_LABEL } from "@ie/core/data/shadowing";
import { addMyBook, addMyVideo, parseGutenbergId, parseYoutubeId, removeMyVideo } from "@ie/core/mylibrary";
import { AddLinkSheet } from "@/components/add-link-sheet";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Библиотека» — 1:1 по макету Экраны-v2 «БИБЛИОТЕКА»: поиск, рубрики-чипы,
// «Сегодня на полке» (терракотовая рамка), карточки материалов с живым
// отрывком и честным «% моих» (считается по словам SRS — только там, где
// текст лежит локально), импорт своей ссылки. Звуки — внутри, как тренажёр.

type Kind = "all" | "read" | "listen";

/** Честная доля знакомых слов в тексте (по SRS). null — текст не локален. */
function pctMine(text: string, known: Set<string>): number | null {
  const uniq = new Set((text.toLowerCase().match(/[a-z][a-z']+/g) ?? []).filter((w) => w.length > 2));
  if (uniq.size < 20) return null;
  let hit = 0;
  for (const w of uniq) if (known.has(w)) hit++;
  return Math.round((hit / uniq.size) * 100);
}

function storyText(s: Story): string {
  return s.paras.map((p) => p.en).join(" ");
}

export default function LibraryScreen() {
  const { c, sk } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const prefs = usePrefs();
  const { t } = useT();
  const L = t.libX;

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [addOpen, setAddOpen] = useState(false);

  const known = useMemo(() => knownWordSet(), []);

  // «Сегодня на полке» — детерминированное приглашение по дате (не лента).
  const levelStories = useMemo(() => {
    const byLevel = storiesByLevel(prefs?.level ?? "b1");
    return byLevel.length > 0 ? byLevel : STORIES;
  }, [prefs?.level]);
  const shelf = levelStories[Math.floor(Date.now() / 86400000) % levelStories.length];

  // Весь каталог под уровень — не обрезаем (библиотека должна быть настоящей).
  const books = useMemo(
    () => booksForReader(prefs?.topics ?? [], prefs?.level),
    [prefs?.topics, prefs?.level]
  );

  const q = query.trim().toLowerCase();
  const looksLikeLink = /^https?:\/\/|youtu|gutenberg/.test(q);

  const allStories = useMemo(() => {
    const seen = new Set(levelStories.map((s) => s.id));
    return [...levelStories, ...STORIES.filter((s) => !seen.has(s.id))];
  }, [levelStories]);
  const stories = allStories.filter((s) => s.id !== shelf?.id);
  const videos = SHADOWING;

  function match(...hay: (string | undefined)[]): boolean {
    if (!q || looksLikeLink) return true;
    return hay.some((h) => h?.toLowerCase().includes(q));
  }

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function open(route: string) {
    tap();
    router.push(route as never);
  }

  /** Цвет честного процента: мята — почти моё, охра — в работе. */
  function pctColor(p: number): string {
    return p >= 70 ? c.accent : p >= 40 ? sk.sounds : c.muted;
  }

  const showRead = kind !== "listen";
  const showListen = kind !== "read";

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 30, paddingTop: insets.top + 18, paddingBottom: 32, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 30, letterSpacing: -0.6, color: c.ink }}>
          {L.title}
        </Text>

        {/* Поиск: слово, тема или ссылка */}
        <View
          style={{
            backgroundColor: c.surface,
            borderWidth: 1.5,
            borderColor: c.line,
            borderRadius: 15,
            paddingHorizontal: 16,
            paddingVertical: 2,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons name="search" size={17} color={c.muted} style={{ opacity: 0.7 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={L.searchPh}
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            style={{ flex: 1, minHeight: 46, fontFamily: "GolosText_400Regular", fontSize: 15, color: c.ink }}
          />
        </View>

        {/* Ссылка в поиске → сразу предлагаем собрать урок */}
        {looksLikeLink && (
          <Pressable
            onPress={() => {
              tap();
              setAddOpen(true);
            }}
            accessibilityRole="button"
            style={({ pressed }) => ({
              backgroundColor: c.brand,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.onBrand }}>
              {L.buildFromLink}
            </Text>
          </Pressable>
        )}

        {/* Рубрики-чипы: активная — чернильная, как в макете */}
        <View style={{ flexDirection: "row", gap: 9, flexWrap: "wrap" }}>
          {(
            [
              { id: "all" as Kind, label: L.chipAll },
              { id: "read" as Kind, label: L.read },
              { id: "listen" as Kind, label: L.listen },
            ] as const
          ).map((ch) => {
            const on = kind === ch.id;
            return (
              <Pressable
                key={ch.id}
                onPress={() => {
                  tap();
                  setKind(ch.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={{
                  paddingHorizontal: 15,
                  minHeight: 36,
                  justifyContent: "center",
                  borderRadius: 20,
                  backgroundColor: on ? c.ink : c.brandSoft,
                }}
              >
                <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: on ? c.bg : c.muted }}>
                  {ch.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Сегодня на полке — терракотовая рамка, живой отрывок */}
        {showRead && shelf && match(shelf.title, storyText(shelf)) && (
          <Pressable
            onPress={() => open(`/read?story=${shelf.id}`)}
            accessibilityRole="button"
            accessibilityLabel={shelf.title}
            style={({ pressed }) => ({
              borderWidth: 2,
              borderColor: c.brand,
              borderRadius: 22,
              backgroundColor: c.surface,
              paddingHorizontal: 22,
              paddingVertical: 20,
              shadowColor: c.brand,
              shadowOpacity: 0.28,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 9 },
              elevation: 4,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: c.brand }}>
                {L.shelfLabel}
              </Text>
              <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 12, color: c.muted, opacity: 0.85 }}>
                {L.metaText(wordCount(shelf))}
              </Text>
            </View>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 19, lineHeight: 24, color: c.ink, marginTop: 8 }}>
              {shelf.title}
            </Text>
            <Text
              numberOfLines={2}
              style={{ fontFamily: "Lora_400Regular", fontSize: 15, lineHeight: 23, color: c.ink, marginTop: 10 }}
            >
              {shelf.paras[0]?.en}
            </Text>
          </Pressable>
        )}

        {/* Тексты — честный «% моих» по SRS */}
        {showRead &&
          stories
            .filter((s) => match(s.title, storyText(s)))
            .map((s) => {
              const pct = pctMine(storyText(s), known);
              return (
                <MaterialCard
                  key={s.id}
                  title={s.title}
                  right={pct !== null && pct > 0 ? L.myPct(pct) : undefined}
                  rightColor={pct !== null ? pctColor(pct) : undefined}
                  excerpt={`“${s.paras[0]?.en ?? ""}”`}
                  meta={`${L.metaStory} · ${wordCount(s)} ${L.words}`}
                  onPress={() => open(`/read?story=${s.id}`)}
                />
              );
            })}

        {/* Книги — целиком, главами (текст приходит по сети, % не обещаем) */}
        {showRead &&
          books
            .filter((b) => match(b.title, b.author))
            .map((b) => (
              <MaterialCard
                key={b.bookId}
                title={b.title}
                excerpt={b.author}
                meta={L.metaBook}
                onPress={() => open(`/read?book=${b.bookId}`)}
              />
            ))}

        {/* Видео · shadowing */}
        {showListen &&
          videos
            .filter((v) => match(v.title, v.lines[0]?.en))
            .map((v) => (
              <MaterialCard
                key={v.id}
                title={v.title}
                excerpt={`“${v.lines[0]?.en ?? ""}”`}
                meta={`▶ ${L.metaVideo} · ${CATEGORY_LABEL[v.category]}`}
                onPress={() => open(`/listen?video=${v.id}`)}
              />
            ))}

        {/* Звуки — тренажёр темпа живёт в Библиотеке */}
        {showListen && match(L.sounds, L.soundsNote) && (
          <Pressable
            onPress={() => open("/sounds")}
            accessibilityRole="button"
            accessibilityLabel={L.sounds}
            style={({ pressed }) => ({
              backgroundColor: c.surface,
              borderRadius: 20,
              paddingHorizontal: 20,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              shadowColor: "#3c280f",
              shadowOpacity: 0.13,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 5 },
              elevation: 2,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: `${sk.sounds}22`, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="mic" size={20} color={sk.sounds} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>{L.sounds}</Text>
              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, color: c.muted, marginTop: 2 }}>
                {L.soundsNote}
              </Text>
            </View>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 22, color: sk.sounds }}>›</Text>
          </Pressable>
        )}

        {/* Импорт своего — wash-карточка с плюсом (макет) */}
        <Pressable
          onPress={() => {
            tap();
            setAddOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={L.addTitle}
          style={({ pressed }) => ({
            backgroundColor: c.brandSoft,
            borderRadius: 20,
            paddingHorizontal: 20,
            paddingVertical: 18,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              backgroundColor: c.surface,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#3c280f",
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 24, color: c.brand, marginTop: -2 }}>+</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.ink }}>{L.addTitle}</Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, color: c.brandInk, opacity: 0.8, marginTop: 2 }}>
              {L.addNote}
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Ссылка → урок: YouTube в «Слушать», Gutenberg в «Читать» */}
      <AddLinkSheet
        open={addOpen}
        title={L.addTitle}
        placeholder={L.addPh}
        hint={L.addHint}
        errorText={L.addErr}
        onClose={() => setAddOpen(false)}
        onSubmit={(v) => {
          const value = v.trim() || query.trim();
          const yt = parseYoutubeId(value);
          if (yt) {
            addMyVideo(yt, L.myVideoDefault);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${yt}&format=json`)
              .then((r) => (r.ok ? r.json() : null))
              .then((j: { title?: string } | null) => {
                if (j?.title) {
                  removeMyVideo(yt);
                  addMyVideo(yt, j.title);
                }
              })
              .catch(() => {});
            router.push(`/listen?video=${yt}` as never);
            return true;
          }
          const gb = parseGutenbergId(value);
          if (gb) {
            addMyBook(gb, L.myBookDefault);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push("/read" as never);
            return true;
          }
          return false;
        }}
      />
    </View>
  );
}

/* ---------- Карточка материала: title · % моих · отрывок · мета ---------- */

function MaterialCard({
  title,
  right,
  rightColor,
  excerpt,
  meta,
  onPress,
}: {
  title: string;
  right?: string;
  rightColor?: string;
  excerpt?: string;
  meta: string;
  onPress: () => void;
}) {
  const { c } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({
        backgroundColor: c.surface,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        shadowColor: "#3c280f",
        shadowOpacity: 0.14,
        shadowRadius: 11,
        shadowOffset: { width: 0, height: 5 },
        elevation: 2,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
          {title}
        </Text>
        {right && (
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: rightColor ?? c.muted }}>
            {right}
          </Text>
        )}
      </View>
      {excerpt && (
        <Text
          numberOfLines={2}
          style={{ fontFamily: "Lora_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, marginTop: 9 }}
        >
          {excerpt}
        </Text>
      )}
      <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 12, color: c.muted, opacity: 0.8, marginTop: 12 }}>
        {meta}
      </Text>
    </Pressable>
  );
}
