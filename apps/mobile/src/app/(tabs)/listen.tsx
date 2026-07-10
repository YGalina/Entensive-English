import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { YouTube, type YouTubeHandle } from "@/components/youtube";
import {
  SHADOWING,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type ShadowScript,
} from "@ie/core/data/shadowing";
import { useActivityTimer } from "@ie/core/timelog";
import { TEACHER_BLOCKS } from "@ie/core/data/teacherBlocks";
import { useMyLibrary, addMyVideo, removeMyVideo, parseYoutubeId } from "@ie/core/mylibrary";
import { AddLinkSheet } from "@/components/add-link-sheet";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";
import { MotivationBubble } from "@/components/motivation-bubble";

// Shadowing: смотришь живого носителя и ПОВТОРЯЕШЬ ВСЛУХ. Видео закреплено
// сверху (не уезжает), активная строка подсвечивается сама по таймингам
// субтитров (караоке) и список сам подъезжает к ней — листать не нужно.
// Тап по строке — перемотка ролика к этой фразе.

export default function ListenScreen() {
  const { c, sk, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const tone = sk.video;
  const { t, lang } = useT();

  const [videoId, setVideoId] = useState<string | null>(null);
  const [custom, setCustom] = useState<{ youtubeId: string; title: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const myLib = useMyLibrary();
  const [showRu, setShowRu] = useState(false);
  const script = useMemo<ShadowScript | null>(
    () => SHADOWING.find((s) => s.id === videoId) ?? null,
    [videoId]
  );

  // Караоке: время берём у плеера, а если он молчит (замечен случай на
  // устройстве) — ведём РЕЗЕРВНЫЕ ЧАСЫ от событий play/pause и синхронизируем
  // их каждым удачным ответом getCurrentTime и каждым тапом по строке.
  const playerRef = useRef<YouTubeHandle | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const linesScroll = useRef<ScrollView | null>(null);
  const lineY = useRef<Map<number, number>>(new Map());
  const clock = useRef({ base: 0, wall: 0, playing: false });

  function onPlayerState(state: string) {
    const now = Date.now();
    const ck = clock.current;
    if (state === "playing") {
      if (!ck.playing) {
        ck.playing = true;
        ck.wall = now;
      }
    } else if (ck.playing) {
      ck.base += (now - ck.wall) / 1000;
      ck.playing = false;
    }
  }

  useEffect(() => {
    if (!script || !focused) return;
    lineY.current.clear();
    setActiveIdx(null);
    clock.current = { base: 0, wall: 0, playing: false };
    const id = setInterval(async () => {
      // Плеер отвечает не всегда: ждём не дольше 250мс, иначе часы.
      const fromPlayer = await Promise.race<number | null>([
        playerRef.current?.getCurrentTime() ?? Promise.resolve(null),
        new Promise<null>((r) => setTimeout(() => r(null), 250)),
      ]).catch(() => null);
      const ck = clock.current;
      let tSec: number | null = null;
      if (typeof fromPlayer === "number" && fromPlayer > 0) {
        tSec = fromPlayer;
        // синхронизируем часы настоящим временем
        ck.base = fromPlayer;
        ck.wall = Date.now();
      } else if (ck.playing || ck.base > 0) {
        tSec = ck.base + (ck.playing ? (Date.now() - ck.wall) / 1000 : 0);
      }
      if (tSec == null) return;
      // Активная = ПОСЛЕДНЯЯ начавшаяся строка: подсветка живёт и в паузах
      // между репликами (раньше гасла между end и следующим start — казалось,
      // что караоке «не работает»).
      let i = -1;
      for (let k = 0; k < script.lines.length; k++) {
        if (tSec >= script.lines[k].start) i = k;
        else break;
      }
      setActiveIdx((prev) => {
        const next = i >= 0 ? i : prev;
        if (next !== prev && next != null) {
          const y = lineY.current.get(next);
          if (y != null) linesScroll.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
        }
        return next;
      });
    }, 400);
    return () => clearInterval(id);
  }, [script, focused]);

  // Минуты shadowing идут в план дня, пока открыт плеер на этом табе.
  useActivityTimer(focused && (script || custom) ? "shadowing" : null);

  // Полка дня: открыть видео по deep-link параметру (однократно).
  const params = useLocalSearchParams<{ video?: string }>();
  const consumed = useRef<string | null>(null);
  useEffect(() => {
    if (!params.video || consumed.current === params.video) return;
    consumed.current = params.video;
    if (SHADOWING.some((s) => s.id === params.video)) setVideoId(params.video);
  }, [params.video]);

  const playerH = Math.round(((width - 40) * 9) / 16);

  function openVideo(id: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVideoId(id);
    setShowRu(false);
  }

  /* ---------- Своё видео: плеер + инструкция (без караоке) ---------- */
  if (custom) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8 }}>
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCustom(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t.listenX.toVideos}
            hitSlop={8}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="chevron-back" size={18} color={c.muted} />
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.muted }}>
              {t.listenX.toVideos}
            </Text>
          </Pressable>
          <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 20, lineHeight: 26, color: c.ink }} numberOfLines={2}>
            {custom.title}
          </Text>
          <YouTube id={custom.youtubeId} height={playerH} />
          <View style={{ flexDirection: "row", gap: 8, backgroundColor: c.brandSoft, borderRadius: radius.soft, padding: 12 }}>
            <Ionicons name="mic" size={16} color={tone} style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 18, color: c.brandInk }}>
              {t.listenX.customNote}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  /* ---------- Плеер (закреплён) + строки-караоке (скроллятся) ---------- */
  if (script) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8 }}>
        {/* Фиксированная шапка: видео всегда на экране */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setVideoId(null);
              }}
              accessibilityRole="button"
              accessibilityLabel={t.listenX.toVideos}
              hitSlop={8}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                minHeight: 40,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="chevron-back" size={18} color={c.muted} />
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.muted }}>
                {t.listenX.toVideos}
              </Text>
            </Pressable>
            <Text
              style={{
                fontFamily: "GolosText_600SemiBold",
                fontSize: 12,
                color: c.muted,
                fontVariant: ["tabular-nums"],
              }}
            >
              {activeIdx != null ? t.listenX.lineOf(activeIdx + 1, script.lines.length) : t.listenX.linesN(script.lines.length)}
            </Text>
          </View>

          <YouTube ref={playerRef} id={script.youtubeId} height={playerH} onStateChange={onPlayerState} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: c.brandSoft,
              borderRadius: radius.soft,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Ionicons name="mic" size={16} color={tone} />
            <Text style={{ flex: 1, fontFamily: "GolosText_400Regular", fontSize: 12, lineHeight: 17, color: c.brandInk }}>
              {t.listenX.hint}
            </Text>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowRu((v) => !v);
              }}
              accessibilityRole="button"
              accessibilityLabel={showRu ? t.readX.hideRu : t.readX.showRu}
              hitSlop={8}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: showRu ? tone : c.surface,
                borderWidth: 1,
                borderColor: showRu ? tone : c.line,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "GolosText_700Bold",
                  fontSize: 12,
                  color: showRu ? c.onBrand : c.brandD,
                }}
              >
                RU
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Строки: подсветка активной, автоскролл, тап = перемотка */}
        <ScrollView
          ref={linesScroll}
          style={{ flex: 1, marginTop: 10 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 6 }}
        >
          {script.lines.map((l, i) => {
            const active = i === activeIdx;
            return (
              <Pressable
                key={i}
                onLayout={(e) => lineY.current.set(i, e.nativeEvent.layout.y)}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playerRef.current?.seekTo(l.start);
                  clock.current.base = l.start;
                  clock.current.wall = Date.now();
                  clock.current.playing = true;
                  setActiveIdx(i);
                }}
                accessibilityRole="button"
                accessibilityLabel={t.listenX.lineA11y(i + 1, l.en)}
                style={({ pressed }) => ({
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: active ? tone : "transparent",
                  backgroundColor: active ? c.brandSoft : pressed ? c.brandSoft : "transparent",
                })}
              >
                <Text
                  style={{
                    fontFamily: active ? "GolosText_700Bold" : "GolosText_400Regular",
                    fontSize: 16,
                    lineHeight: 24,
                    color: active ? c.ink : c.muted,
                  }}
                >
                  {l.en}
                </Text>
                {showRu && l.ru ? (
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, lineHeight: 18, color: c.muted, marginTop: 2 }}>
                    {l.ru}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  /* ---------- Список видео ---------- */
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 14,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 30, color: c.ink }}>
          {t.listenX.title}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
          {t.listenX.subtitle}
        </Text>
      </View>

      {/* Мотивашка дня */}
      <MotivationBubble slot="listen" />

      {/* «3-минутка» — супер-короткая практика для дороги и очередей */}
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/three" as never);
        }}
        accessibilityRole="button"
        accessibilityLabel={t.today.threeA11y}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: tone,
          borderRadius: radius.soft,
          padding: 16,
          minHeight: 64,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="timer" size={24} color={c.onBrand} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.onBrand }}>
            {t.listenX.three}
          </Text>
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.onBrand }}>
            {t.listenX.threeNote}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.onBrand} />
      </Pressable>

      {/* Блоки с преподавателем: разогрев → ролик → объясни мысль */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
          {t.listenX.teacherBlocks}
        </Text>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>
          {t.listenX.teacherBlocksNote}
        </Text>
      </View>
      {TEACHER_BLOCKS.map((tb) => (
        <Pressable
          key={tb.id}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/block", params: { id: tb.id } } as never);
          }}
          accessibilityRole="button"
          accessibilityLabel={lang === "en" ? tb.topicEn : tb.topic}
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
          <Ionicons name="school-outline" size={22} color={c.brand} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14.5, color: c.ink }} numberOfLines={2}>
              {lang === "en" ? tb.topicEn : tb.topic}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, color: c.muted }}>
              {t.listenX.teacherBlockSteps}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.muted} />
        </Pressable>
      ))}

      {/* Мои видео: своя лента */}
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
        {t.listenX.myVideos}
      </Text>
      {myLib.videos.map((mv) => (
        <Pressable
          key={mv.youtubeId}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCustom({ youtubeId: mv.youtubeId, title: mv.title });
          }}
          accessibilityRole="button"
          accessibilityLabel={mv.title}
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
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="logo-youtube" size={18} color={tone} />
          </View>
          <Text style={{ flex: 1, fontFamily: "GolosText_700Bold", fontSize: 14.5, color: c.ink }} numberOfLines={2}>
            {mv.title}
          </Text>
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              removeMyVideo(mv.youtubeId);
            }}
            accessibilityRole="button"
            accessibilityLabel={t.readX.removeA11y}
            hitSlop={10}
            style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons name="close-circle" size={20} color={c.muted} />
          </Pressable>
        </Pressable>
      ))}
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setAddOpen(true);
        }}
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: radius.soft,
          borderWidth: 1.5,
          borderColor: c.brand,
          borderStyle: "dashed",
          backgroundColor: pressed ? c.brandSoft : "transparent",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
        })}
      >
        <Ionicons name="add" size={18} color={c.brandD} />
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.brandD }}>
          {t.listenX.addVideo}
        </Text>
      </Pressable>

      <AddLinkSheet
        open={addOpen}
        title={t.listenX.addVideo}
        placeholder={t.listenX.addVideoPh}
        hint={t.listenX.addVideoHint}
        errorText={t.listenX.addVideoErr}
        onClose={() => setAddOpen(false)}
        onSubmit={(v) => {
          const id = parseYoutubeId(v);
          if (!id) return false;
          addMyVideo(id, t.listenX.myVideoDefault);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Название подтягиваем через oEmbed (без ключа); не критично при ошибке.
          fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
            .then((r) => (r.ok ? r.json() : null))
            .then((j: { title?: string } | null) => {
              if (j?.title) {
                removeMyVideo(id);
                addMyVideo(id, j.title);
              }
            })
            .catch(() => {});
          return true;
        }}
      />

      {CATEGORY_ORDER.map((cat) => {
        const items = SHADOWING.filter((s) => s.category === cat);
        if (items.length === 0) return null;
        return (
          <View key={cat} style={{ gap: 10 }}>
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
              {t.listenX.cats[cat] ?? CATEGORY_LABEL[cat]}
            </Text>
            {items.map((s) => (
              <VideoCard
                key={s.id}
                youtubeId={s.youtubeId}
                title={s.title}
                subtitle={`${s.author} · ${s.level.toUpperCase()} · ${t.listenX.linesN(s.lines.length)}`}
                onOpen={() => openVideo(s.id)}
              />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

/* ---------- Карточка видео с превью (thumbnail) ---------- */
// Превью-кадр YouTube (hqdefault) с кнопкой Play поверх, как в ленте/витрине.
// Не загрузилось (нет сети) — цветной фолбэк с иконкой.
function VideoCard({
  youtubeId,
  title,
  subtitle,
  onOpen,
}: {
  youtubeId: string;
  title: string;
  subtitle: string;
  onOpen: () => void;
}) {
  const { c, sk, radius } = useMarina();
  const [failed, setFailed] = useState(false);
  const thumbW = 116;
  const thumbH = Math.round((thumbW * 9) / 16);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: 12,
        backgroundColor: pressed ? c.brandSoft : c.surface,
        borderRadius: radius.soft,
        borderWidth: 1,
        borderColor: c.line,
        padding: 10,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View style={{ width: thumbW, height: thumbH, borderRadius: 10, overflow: "hidden", backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center" }}>
        {!failed ? (
          <Image
            source={{ uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <Ionicons name="logo-youtube" size={26} color={sk.video} />
        )}
        <View style={{ position: "absolute", width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="play" size={16} color="#fff" />
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: "center", gap: 3 }}>
        <Text numberOfLines={2} style={{ fontFamily: "GolosText_700Bold", fontSize: 14.5, lineHeight: 20, color: c.ink }}>
          {title}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, color: c.muted }}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
