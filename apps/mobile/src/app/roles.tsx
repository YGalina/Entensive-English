import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ROLE_SCENES, type RoleScene } from "@ie/core/data/roleScenes";
import { addArtifact } from "@ie/core/output";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { useVoiceRecorder } from "@ie/media/recorder";
import { useT } from "@/lib/i18n";
import { useMarina } from "@/theme";

// «Роли» — сыграй сцену героя (идея Галины): реплику партнёра читает голос,
// СВОЮ реплику говоришь ты — сначала по смыслу на родном, потом сверяешься.
// Роль = маска: ошибается Алиса, а не «я с плохим английским». Эмоция +
// безопасность + produce. Источники — public domain, с атрибуцией.

type Stage = "pick" | "role" | "mode" | "play" | "done";
// «say» — продуктивно: смысл на русском → говоришь по-английски → сверяешь.
// «read» — читаешь свою реплику вслух по-английски (shadowing в лицах, проще).
type PlayMode = "say" | "read";

export default function RolesScreen() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, lang } = useT();
  const en = lang === "en";
  const r = t.rolesX;

  useActivityTimer("roles");

  const [stage, setStage] = useState<Stage>("pick");
  const [scene, setScene] = useState<RoleScene | null>(null);
  const [myRole, setMyRole] = useState<"a" | "b">("a");
  const [playMode, setPlayMode] = useState<PlayMode>("say");
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saidCount, setSaidCount] = useState(0);
  const rec = useVoiceRecorder();
  const [audioRef, setAudioRef] = useState<string | null>(null);

  const line = scene?.lines[i];
  const mine = line?.who === myRole;

  const myLinesTotal = useMemo(
    () => (scene ? scene.lines.filter((l) => l.who === myRole).length : 0),
    [scene, myRole]
  );

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function startScene(s: RoleScene) {
    tap();
    setScene(s);
    setStage("role");
  }

  function chooseRole(role: "a" | "b") {
    tap();
    setMyRole(role);
    setStage("mode");
  }

  function startPlay(mode: PlayMode) {
    tap();
    setPlayMode(mode);
    setI(0);
    setRevealed(false);
    setSaidCount(0);
    setStage("play");
    const first = sceneFirstLine(myRole);
    if (first) speakEnglish(first, { rate: 0.92, interrupt: true });
  }

  function sceneFirstLine(role: "a" | "b"): string | null {
    const l = scene?.lines[0];
    return l && l.who !== role ? l.en : null;
  }

  function advance(said: boolean) {
    tap();
    if (mine && said) setSaidCount((n) => n + 1);
    const next = i + 1;
    if (!scene || next >= scene.lines.length) {
      addArtifact({
        type: "role",
        promptId: scene?.id,
        text: scene ? `${scene.titleEn} — played ${myRole === "a" ? scene.roleA : scene.roleB}` : undefined,
        audioRef: audioRef ?? undefined,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStage("done");
      return;
    }
    setI(next);
    setRevealed(false);
    const nl = scene.lines[next];
    if (nl.who !== myRole) speakEnglish(nl.en, { rate: 0.92, interrupt: true });
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 10 }}>
        <Text style={{ flex: 1, fontFamily: "GolosText_800ExtraBold", fontSize: 22, color: c.ink }}>
          {r.title}
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={r.close}
          hitSlop={8}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close" size={18} color={c.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}>
        {stage === "pick" && (
          <>
            {/* Микро-онбординг: как это работает (3 шага) */}
            <View style={{ backgroundColor: c.brandSoft, borderRadius: radius.card, padding: 16, gap: 8 }}>
              <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 15, color: c.brandInk }}>
                {r.howTitle}
              </Text>
              {[r.how1, r.how2, r.how3].map((line, idx) => (
                <View key={idx} style={{ flexDirection: "row", gap: 8 }}>
                  <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 13, color: c.brand }}>{idx + 1}</Text>
                  <Text style={{ flex: 1, fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.brandInk }}>
                    {line}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted }}>
              {r.intro}
            </Text>
            {ROLE_SCENES.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => startScene(s)}
                accessibilityRole="button"
                style={({ pressed }) => ({ backgroundColor: pressed ? c.brandSoft : c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 16, gap: 4 })}
              >
                <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 17, color: c.ink }}>
                  {en ? s.titleEn : s.title}
                </Text>
                <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>
                  {s.roleA} · {s.roleB} · {s.level.toUpperCase()} · {s.lines.length} {r.lines}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {stage === "role" && scene && (
          <View style={{ gap: 12, justifyContent: "center", flex: 1 }}>
            <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 22, color: c.ink, textAlign: "center" }}>
              {r.whoAreYou}
            </Text>
            {(["a", "b"] as const).map((role) => (
              <Pressable
                key={role}
                onPress={() => chooseRole(role)}
                accessibilityRole="button"
                style={({ pressed }) => ({ minHeight: 64, borderRadius: radius.card, backgroundColor: pressed ? c.brandSoft : c.surface, borderWidth: 2, borderColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
              >
                <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 19, color: c.brand }}>
                  {role === "a" ? scene.roleA : scene.roleB}
                </Text>
              </Pressable>
            ))}
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 11.5, color: c.muted, textAlign: "center" }}>
              {scene.source}
            </Text>
          </View>
        )}

        {/* ——— Выбор режима: сказать самой vs читать вслух ——— */}
        {stage === "mode" && scene && (
          <View style={{ gap: 12, justifyContent: "center", flex: 1 }}>
            <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 20, color: c.ink, textAlign: "center" }}>
              {r.modeTitle}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted, textAlign: "center" }}>
              {r.modeNote}
            </Text>
            <Pressable
              onPress={() => startPlay("read")}
              accessibilityRole="button"
              style={({ pressed }) => ({ borderRadius: radius.card, backgroundColor: pressed ? c.brandSoft : c.surface, borderWidth: 2, borderColor: c.line, padding: 16, gap: 4, transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="book-outline" size={18} color={c.brand} />
                <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.ink }}>{r.modeReadTitle}</Text>
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: c.brandSoft }}>
                  <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, color: c.brand }}>{r.modeEasier}</Text>
                </View>
              </View>
              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>{r.modeReadNote}</Text>
            </Pressable>
            <Pressable
              onPress={() => startPlay("say")}
              accessibilityRole="button"
              style={({ pressed }) => ({ borderRadius: radius.card, backgroundColor: pressed ? c.brandSoft : c.surface, borderWidth: 2, borderColor: c.brand, padding: 16, gap: 4, transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="mic-outline" size={18} color={c.brand} />
                <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 16, color: c.ink }}>{r.modeSayTitle}</Text>
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: c.brand }}>
                  <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 10, color: c.onBrand }}>{r.modeHarder}</Text>
                </View>
              </View>
              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>{r.modeSayNote}</Text>
            </Pressable>
          </View>
        )}

        {stage === "play" && scene && line && (
          <View style={{ gap: 12, flex: 1, justifyContent: "center" }}>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: c.muted, textAlign: "center" }}>
              {i + 1} / {scene.lines.length} · {mine ? r.yourLine : r.partnerLine}
            </Text>
            <View style={{ backgroundColor: mine ? c.brandSoft : c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: mine ? c.brand : c.line, padding: 20, gap: 10 }}>
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13, color: c.brand }}>
                {line.who === "a" ? scene.roleA : scene.roleB}
              </Text>
              {mine && playMode === "read" ? (
                // Читать вслух: английский сразу, снизу перевод, «послушать образец»
                <>
                  <Pressable onPress={() => speakEnglish(line.en, { rate: 0.92, interrupt: true })} accessibilityRole="button" accessibilityLabel={line.en}>
                    <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 19, lineHeight: 27, color: c.brand }}>
                      {line.en}
                    </Text>
                  </Pressable>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted }}>
                    {line.ru}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12, color: c.muted }}>{r.readHint}</Text>
                </>
              ) : mine ? (
                <>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 16, lineHeight: 24, color: c.ink }}>
                    {line.ru}
                  </Text>
                  {revealed ? (
                    <Pressable onPress={() => speakEnglish(line.en, { rate: 0.92, interrupt: true })} accessibilityRole="button">
                      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 19, lineHeight: 27, color: c.brand }}>
                        {line.en}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 12.5, color: c.muted }}>
                      {r.sayHint}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 18, lineHeight: 26, color: c.ink }}>
                    {line.en}
                  </Text>
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 13.5, lineHeight: 20, color: c.muted }}>
                    {line.ru}
                  </Text>
                </>
              )}
            </View>

            {mine && playMode === "read" ? (
              // Читать вслух: одна кнопка — прочитала за героя, дальше
              <Pressable
                onPress={() => advance(true)}
                accessibilityRole="button"
                style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.onBrand }}>{r.readDone}</Text>
              </Pressable>
            ) : mine ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* Голос в роли: записать свою реплику (приватно, остаётся в артефакте сцены) */}
                {rec.supported && !revealed && (
                  <Pressable
                    onPress={async () => {
                      if (rec.recording) {
                        const uri = await rec.stop();
                        if (uri) setAudioRef(uri);
                      } else {
                        tap();
                        await rec.start();
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={rec.recording ? r.stopRec : r.recLine}
                    style={({ pressed }) => ({ width: 52, minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: rec.recording ? c.accent : c.line, backgroundColor: rec.recording ? c.accent : c.surface, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1 })}
                  >
                    <Ionicons name={rec.recording ? "stop" : "mic"} size={18} color={rec.recording ? c.onBrand : c.brand} />
                  </Pressable>
                )}
                {revealed ? (
                  <Pressable
                    onPress={() => advance(true)}
                    accessibilityRole="button"
                    style={({ pressed }) => ({ flex: 1, minHeight: 52, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
                  >
                    <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.onBrand }}>{r.saidIt}</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => { tap(); setRevealed(true); speakEnglish(line.en, { rate: 0.92, interrupt: true }); }}
                    accessibilityRole="button"
                    style={({ pressed }) => ({ flex: 1, minHeight: 52, borderRadius: 14, backgroundColor: c.brandSoft, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1 })}
                  >
                    <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.brandInk }}>{r.check}</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <Pressable
                onPress={() => advance(false)}
                accessibilityRole="button"
                style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1 })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.ink }}>{r.next}</Text>
              </Pressable>
            )}
          </View>
        )}

        {stage === "done" && scene && (
          <View style={{ alignItems: "center", gap: 10, flex: 1, justifyContent: "center" }}>
            <Ionicons name="film" size={28} color={c.sun} />
            <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 22, color: c.ink, textAlign: "center" }}>
              {r.doneTitle}
            </Text>
            <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 300 }}>
              {r.doneNote(saidCount, myLinesTotal)}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={() => setStage("pick")}
                accessibilityRole="button"
                style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 20, borderRadius: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1 })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14.5, color: c.ink }}>{r.another}</Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 24, borderRadius: 14, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.98 : 1 }] })}
              >
                <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14.5, color: c.onBrand }}>{r.home}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
