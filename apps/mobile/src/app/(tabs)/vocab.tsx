import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { vocabEntries, useSrsStats, type VocabState } from "@ie/core/srs";
import { lookupWord } from "@ie/core/data/levelVocab";
import { speakEnglish } from "@ie/media/speech";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Мой словарь» (макет 25a): слова как накопленный живой опыт, не список
// долгов. Сила слова — три состояния: новое (терракота) → узнаю (амбер) →
// моё (мята, только после активного вывода). Повторение подаётся как «пора
// вернуть слова», не как красный счётчик.

type Filter = "all" | VocabState;

export default function VocabScreen() {
  const { c, sk } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const v = t.vocabX;
  const srs = useSrsStats();
  const [filter, setFilter] = useState<Filter>("all");

  const entries = useMemo(() => vocabEntries(), []);
  const counts = useMemo(() => {
    const cnt = { new: 0, recog: 0, mine: 0 };
    for (const e of entries) cnt[e.state]++;
    return cnt;
  }, [entries]);
  const list = filter === "all" ? entries : entries.filter((e) => e.state === filter);

  // Цвета силы слова (дизайн: новое — терракота, узнаю — амбер, моё — мята).
  const stateColor: Record<VocabState, string> = {
    new: c.brand,
    recog: sk.sounds,
    mine: c.accent,
  };

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, gap: 12 }}
      >
        {/* Шапка — «Словарь» теперь таб, кнопка «назад» не нужна */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 24, letterSpacing: -0.4, color: c.ink }}>
            {v.title}
          </Text>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted, marginTop: 1 }}>
            {v.subtitle(entries.length)}
          </Text>
        </View>

        {/* Фильтры силы слова */}
        <View style={{ flexDirection: "row", gap: 7, flexWrap: "wrap" }}>
          <FilterChip label={v.fAll} active={filter === "all"} onPress={() => { tap(); setFilter("all"); }} />
          <FilterChip label={v.fNew(counts.new)} dot={stateColor.new} active={filter === "new"} onPress={() => { tap(); setFilter("new"); }} />
          <FilterChip label={v.fRecog(counts.recog)} dot={stateColor.recog} active={filter === "recog"} onPress={() => { tap(); setFilter("recog"); }} />
          <FilterChip label={v.fMine(counts.mine)} dot={stateColor.mine} active={filter === "mine"} onPress={() => { tap(); setFilter("mine"); }} />
        </View>

        {/* Пора вернуть слова — мягкий SRS-зов, не долг */}
        {srs.dueToday > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: c.warnSoft,
              borderRadius: 15,
              paddingHorizontal: 15,
              paddingVertical: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13.5, color: c.ink }}>
                {v.dueTitle(srs.dueToday)}
              </Text>
              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, color: c.muted, marginTop: 1 }}>
                {v.dueNote}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                tap();
                router.push("/session" as never);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                minHeight: 40,
                borderRadius: 11,
                backgroundColor: c.brand,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 12.5, color: c.onBrand }}>
                {v.dueCta}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Пусто совсем — макет «пусто · словарь»: приглашение, не упрёк */}
        {entries.length === 0 ? (
          <View style={{ alignItems: "center", gap: 12, paddingVertical: 44, paddingHorizontal: 8 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="book-outline" size={28} color={c.brandD} />
            </View>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 20, color: c.ink, textAlign: "center" }}>
              {v.emptyTitle}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
              {v.emptyBody}
            </Text>
            <Pressable
              onPress={() => {
                tap();
                router.push("/session" as never);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({
                alignSelf: "stretch",
                marginTop: 8,
                minHeight: 54,
                borderRadius: 16,
                backgroundColor: c.brand,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.onBrand }}>
                {v.emptyCta}
              </Text>
            </Pressable>
          </View>
        ) : list.length === 0 ? (
          <View style={{ alignItems: "center", gap: 10, paddingVertical: 48 }}>
            <Ionicons name="book-outline" size={34} color={c.muted} />
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted, textAlign: "center", maxWidth: 280 }}>
              {v.empty}
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.line,
              paddingHorizontal: 16,
            }}
          >
            {list.slice(0, 200).map((e, i) => {
              const entry = lookupWord(e.en);
              const ru = entry?.tr?.ru?.tr;
              const meta = e.said
                ? v.metaSaid
                : e.noticed > 0
                  ? v.metaNoticed(e.noticed)
                  : e.recogReps > 0
                    ? v.metaRecog(e.recogReps)
                    : v.metaNew;
              return (
                <Pressable
                  key={e.en}
                  onPress={() => {
                    tap();
                    speakEnglish(e.en, { interrupt: true, rate: 0.95 });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${e.en}${ru ? `, ${ru}` : ""}`}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: c.line,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: stateColor[e.state] }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Lora_500Medium", fontSize: 15.5, color: c.ink }}>{e.en}</Text>
                    <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 10.5, color: c.muted, marginTop: 1 }}>
                      {meta}
                    </Text>
                  </View>
                  {!!ru && (
                    <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted, maxWidth: 130, textAlign: "right" }} numberOfLines={2}>
                      {ru}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Как слово становится «моим» */}
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, lineHeight: 17, color: c.muted }}>
          {v.foot}
        </Text>
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  dot,
  active,
  onPress,
}: {
  label: string;
  dot?: string;
  active: boolean;
  onPress: () => void;
}) {
  const { c } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minHeight: 38,
        paddingHorizontal: 13,
        borderRadius: 19,
        backgroundColor: active ? c.ink : c.surface,
        borderWidth: 1,
        borderColor: active ? c.ink : c.line,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {!!dot && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />}
      <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 12, color: active ? c.bg : c.brandInk }}>
        {label}
      </Text>
    </Pressable>
  );
}
