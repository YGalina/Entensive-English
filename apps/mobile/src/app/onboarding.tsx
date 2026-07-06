import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  NATIVE_LANGUAGES,
  GOALS,
  LEVELS,
  INTERESTS,
  type LangCode,
} from "@ie/core/data/catalog";
import { savePrefs } from "@ie/core/prefs";
import {
  buildCheckWords,
  scoreLevel,
  type CheckLevel,
  type RawWord,
} from "@ie/core/levelcheck";
import { speakEnglish } from "@ie/media/speech";
import b1 from "@ie/core/data/vocab-b1.json";
import b2 from "@ie/core/data/vocab-b2.json";
import c1 from "@ie/core/data/vocab-c1.json";
import { useMarina } from "@/theme";

// Мобильный онбординг: тот же смысл, что на web (язык → цель → темы → уровень),
// но под палец: вертикальные списки, крупные цели ≥48pt, лёгкие haptic-отклики.
// Финал — рецептивный «ага-момент»: фраза уровня звучит и понимается сразу,
// вместо пустого экрана (аффективный фильтр вниз, время-до-ценности ~ноль).

const STEPS = ["Родной язык", "Цель", "Темы", "Уровень"] as const;

/** Фраза «ага-момента» по уровню: понятная чуть выше текущего (i+1), тёплая. */
const AHA: Record<string, { en: string; ru: string }> = {
  a1: { en: "You are here. And this is your English.", ru: "Ты здесь. И это — твой английский." },
  a2: { en: "You are here. And this is your English.", ru: "Ты здесь. И это — твой английский." },
  b1: {
    en: "Your brain already knows more English than you think.",
    ru: "Твой мозг уже знает больше английского, чем ты думаешь.",
  },
  b2: {
    en: "Everything you understand today becomes yours tomorrow.",
    ru: "Всё, что ты понимаешь сегодня, завтра становится твоим.",
  },
  c1: {
    en: "Fluency is not a talent — it is a rhythm you are about to enter.",
    ru: "Беглость — не талант, а ритм, в который ты сейчас входишь.",
  },
  c2: {
    en: "Fluency is not a talent — it is a rhythm you are about to enter.",
    ru: "Беглость — не талант, а ритм, в который ты сейчас входишь.",
  },
};

export default function Onboarding() {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [nativeLang, setNativeLang] = useState<LangCode>("ru");
  const [langOpen, setLangOpen] = useState(false);
  const [goal, setGoal] = useState("");
  // Интересы-смыслы (§8). Лексические слои метода не выбираются — они вшиты.
  const [topics, setTopics] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [checking, setChecking] = useState(false);
  const [aha, setAha] = useState(false);

  const curLang = NATIVE_LANGUAGES.find((l) => l.code === nativeLang) ?? NATIVE_LANGUAGES[0];

  const canNext =
    (step === 0 && !!nativeLang) ||
    (step === 1 && !!goal) ||
    (step === 2 && topics.length > 0) ||
    (step === 3 && !!level);

  function tap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function toggleTopic(id: string) {
    tap();
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  function next() {
    tap();
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Настройка готова: сохраняем сразу (даже если выйдет с «ага»-экрана).
    savePrefs({ nativeLang, uiLang: "ru", goal, topics, level });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAha(true);
  }

  function finish() {
    tap();
    router.replace("/");
  }

  if (aha) {
    return <AhaMoment level={level} onDone={finish} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      {/* Прогресс */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: c.brandSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="sparkles" size={15} color={c.brand} />
          </View>
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.ink }}>
            Настроим под тебя
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: i <= step ? c.brand : c.line,
              }}
            />
          ))}
        </View>
      </View>

      {checking ? (
        <LevelCheck
          onDone={(lvl) => {
            setLevel(lvl);
            setChecking(false);
          }}
          onCancel={() => setChecking(false)}
        />
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 10 }}
          >
            {step === 0 && (
              <StepFade>
                <Section
                  title="Какой у тебя родной язык?"
                  note="Учим только английский. Переводы слов и примеров будут на этом языке."
                >
                  {/* Не стена из 17 кнопок, а карточка + вылетающая шторка выбора. */}
                  <Pressable
                    onPress={() => {
                      tap();
                      setLangOpen(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Родной язык: ${curLang.native}. Нажми, чтобы сменить`}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      minHeight: 72,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderRadius: radius.soft,
                      borderWidth: 1,
                      borderColor: c.brand,
                      backgroundColor: c.brandSoft,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Text style={{ fontSize: 30 }}>{curLang.flag}</Text>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: c.ink }}>
                        {curLang.native}
                      </Text>
                      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
                        переводы слов — на этом языке
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: c.surface,
                        borderWidth: 1,
                        borderColor: c.line,
                      }}
                    >
                      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13, color: c.brand }}>
                        изменить
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={c.brand} />
                    </View>
                  </Pressable>
                </Section>
              </StepFade>
            )}

            {step === 1 && (
              <StepFade>
                <Section title="Зачем тебе английский?" note="Подберём контент и темп под цель.">
                  {GOALS.map((g) => (
                    <OptionRow
                      key={g.id}
                      active={goal === g.id}
                      onPress={() => {
                        tap();
                        setGoal(g.id);
                      }}
                      title={g.title}
                      desc={g.desc}
                    />
                  ))}
                </Section>
              </StepFade>
            )}

            {step === 2 && (
              <StepFade>
              <Section
                title="Про что тебе интересно?"
                note="Выбери, что любишь, — слова, тексты и примеры придут из этих смыслов. Можно несколько."
              >
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {INTERESTS.map((t) => {
                    const on = topics.includes(t.id);
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => toggleTopic(t.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        style={({ pressed }) => ({
                          minHeight: 44,
                          borderRadius: 22,
                          borderWidth: 1,
                          paddingHorizontal: 14,
                          justifyContent: "center",
                          borderColor: on ? c.brand : c.line,
                          backgroundColor: on ? c.brand : c.surface,
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                        })}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 13,
                            color: on ? "#ffffff" : c.ink,
                          }}
                        >
                          {t.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>
              </StepFade>
            )}

            {step === 3 && (
              <StepFade>
              <Section
                title="Какой у тебя уровень?"
                note="Без экзамена. Не уверена — определим за минуту по словам."
              >
                {LEVELS.map((l) => (
                  <OptionRow
                    key={l.id}
                    active={level === l.id}
                    onPress={() => {
                      tap();
                      setLevel(l.id);
                    }}
                    title={l.title}
                    desc={l.desc}
                  />
                ))}
                <Pressable
                  onPress={() => {
                    tap();
                    setChecking(true);
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    minHeight: 52,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: c.brand,
                    backgroundColor: c.brandSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    marginTop: 4,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Ionicons name="sparkles" size={16} color={c.brandD} />
                  <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.brandD }}>
                    Не знаю уровень — определить за минуту
                  </Text>
                </Pressable>
              </Section>
              </StepFade>
            )}
          </ScrollView>

          <LanguageSheet
            open={langOpen}
            value={nativeLang}
            onSelect={(code) => {
              tap();
              setNativeLang(code);
              setLangOpen(false);
            }}
            onClose={() => setLangOpen(false)}
          />

          {/* Навигация */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom + 12,
              backgroundColor: c.bg,
            }}
          >
            {step > 0 && (
              <Pressable
                onPress={() => {
                  tap();
                  setStep((s) => s - 1);
                }}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: c.line,
                  backgroundColor: c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.muted }}>
                  Назад
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={next}
              disabled={!canNext}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 54,
                borderRadius: 16,
                backgroundColor: c.accent,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                opacity: canNext ? 1 : 0.45,
                transform: [{ scale: pressed && canNext ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#ffffff" }}>
                {step === STEPS.length - 1 ? "Поехали" : "Дальше"}
              </Text>
              <Ionicons
                name={step === STEPS.length - 1 ? "checkmark" : "arrow-forward"}
                size={18}
                color="#ffffff"
              />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

/* ---------- Мини-определение уровня (yes/no, 18 слов) — логика в @ie/core ---------- */

function LevelCheck({
  onDone,
  onCancel,
}: {
  onDone: (level: string) => void;
  onCancel: () => void;
}) {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const words = useMemo(
    () =>
      buildCheckWords({
        b1: b1 as RawWord[],
        b2: b2 as RawWord[],
        c1: c1 as RawWord[],
      }),
    []
  );
  const [i, setI] = useState(0);
  const [known, setKnown] = useState<Record<CheckLevel, number>>({ b1: 0, b2: 0, c1: 0 });

  const finished = i >= words.length;
  const result = finished ? scoreLevel(known) : null;
  const item = finished ? null : words[i];

  function answer(yes: boolean) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (yes && item) setKnown((k) => ({ ...k, [item.lvl]: k[item.lvl] + 1 }));
    setI((p) => p + 1);
  }

  useEffect(() => {
    if (finished) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [finished]);

  if (finished && result) {
    const title = LEVELS.find((l) => l.id === result)?.title ?? result.toUpperCase();
    return (
      <View style={{ flex: 1, padding: 20, paddingBottom: insets.bottom + 12 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: c.brandSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark" size={30} color={c.brand} />
          </View>
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 24,
              color: c.ink,
              textAlign: "center",
            }}
          >
            Похоже, твой уровень — {result.toUpperCase()}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              lineHeight: 21,
              color: c.muted,
              textAlign: "center",
              maxWidth: 300,
            }}
          >
            {title}. Это стартовая настройка, не приговор: программа сама подстроится по мере
            практики.
          </Text>
        </View>
        <Pressable
          onPress={() => onDone(result)}
          accessibilityRole="button"
          style={({ pressed }) => ({
            minHeight: 54,
            borderRadius: 16,
            backgroundColor: c.accent,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#ffffff" }}>
            Принять
          </Text>
          <Ionicons name="checkmark" size={18} color="#ffffff" />
        </Pressable>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={{ minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 6 }}
        >
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: c.muted }}>
            Выберу сама
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!item) return null;

  return (
    <View style={{ flex: 1, padding: 20, paddingBottom: insets.bottom + 12, gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted, flex: 1 }}>
          Понимаешь смысл — жми «Знаю». Честно, без словаря 🙂
        </Text>
        <Text
          style={{
            fontFamily: "Nunito_700Bold",
            fontSize: 14,
            color: c.ink,
            fontVariant: ["tabular-nums"],
          }}
        >
          {i + 1} / {words.length}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Nunito_800ExtraBold",
            fontSize: 34,
            color: c.accent,
            textAlign: "center",
          }}
        >
          {item.w.en}
        </Text>
        <Pressable
          onPress={() => speakEnglish(item.w.en, { interrupt: true })}
          accessibilityRole="button"
          accessibilityLabel="Озвучить слово"
          hitSlop={10}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            opacity: pressed ? 0.6 : 1,
            minHeight: 44,
          })}
        >
          <Ionicons name="volume-medium" size={18} color={c.muted} />
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: c.muted }}>
            {item.w.ipa}
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={() => answer(false)}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 56,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.muted }}>
            Ещё нет
          </Text>
        </Pressable>
        <Pressable
          onPress={() => answer(true)}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 56,
            borderRadius: 16,
            backgroundColor: c.brand,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Ionicons name="checkmark" size={18} color="#ffffff" />
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: "#ffffff" }}>
            Знаю
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
          ← вернуться к выбору вручную
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- «Ага-момент»: первая понятая фраза + голос — сразу ценность ---------- */

function AhaMoment({ level, onDone }: { level: string; onDone: () => void }) {
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();
  const phrase = AHA[level] ?? AHA.b1;
  const [spoken, setSpoken] = useState(false);

  useEffect(() => {
    // Голос — сразу: первый вход в язык через ухо, не через кнопку.
    const t = setTimeout(() => {
      speakEnglish(phrase.en, { onEnd: () => setSpoken(true), onError: () => setSpoken(true) });
    }, 600);
    return () => clearTimeout(t);
  }, [phrase.en]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        padding: 20,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 12,
      }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: c.brandSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="ear" size={28} color={c.brand} />
        </View>

        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: c.line,
            padding: 24,
            gap: 14,
            alignSelf: "stretch",
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 24,
              lineHeight: 32,
              color: c.ink,
              textAlign: "center",
            }}
          >
            {phrase.en}
          </Text>
          <Pressable
            onPress={() => speakEnglish(phrase.en, { interrupt: true })}
            accessibilityRole="button"
            accessibilityLabel="Послушать ещё раз"
            style={({ pressed }) => ({
              alignSelf: "center",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: 22,
              backgroundColor: c.brandSoft,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="volume-high" size={18} color={c.brandD} />
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13, color: c.brandD }}>
              послушать ещё раз
            </Text>
          </Pressable>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              lineHeight: 21,
              color: c.muted,
              textAlign: "center",
            }}
          >
            {phrase.ru}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            lineHeight: 21,
            color: c.muted,
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          Ты только что поняла английский — без словаря и без напряжения. Так и будет каждый
          день: понятный вход, маленький шаг, большой массив.
        </Text>
      </View>

      <Pressable
        onPress={onDone}
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
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#ffffff" }}>
          Начать путь
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

/* ---------- Вылетающая шторка выбора родного языка (bottom sheet) ---------- */

function LanguageSheet({
  open,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  value: LangCode;
  onSelect: (code: LangCode) => void;
  onClose: () => void;
}) {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      {/* Скрим ~55% — фон гаснет, фокус на выборе (и тап по нему закрывает) */}
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(8,14,26,0.55)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Закрыть выбор языка" />
        <View
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "75%",
            paddingBottom: insets.bottom + 8,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.line,
              marginTop: 10,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: c.ink }}>
              Родной язык
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Закрыть"
              hitSlop={8}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: c.brandSoft,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="close" size={18} color={c.brandD} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            {NATIVE_LANGUAGES.map((l) => {
              const active = l.code === value;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => onSelect(l.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    minHeight: 54,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: pressed || active ? c.brandSoft : "transparent",
                  })}
                >
                  <Text style={{ fontSize: 24 }}>{l.flag}</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: active ? "Nunito_700Bold" : "Inter_400Regular",
                      fontSize: 16,
                      color: c.ink,
                    }}
                  >
                    {l.native}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={22} color={c.brand} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Плавное появление шага (уважает reduced motion) ---------- */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        if (alive) setReduced(!!v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v) =>
      setReduced(!!v)
    );
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduced;
}

function StepFade({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      anim.setValue(1);
      return;
    }
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [anim, reduced]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/* ---------- Мелкие блоки ---------- */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 10 }}>
      <SectionTitle title={title} note={note} />
      {children}
    </View>
  );
}

function SectionTitle({ title, note }: { title: string; note: string }) {
  const { c } = useMarina();
  return (
    <View style={{ gap: 6, marginBottom: 4 }}>
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 24, lineHeight: 30, color: c.ink }}>
        {title}
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: c.muted }}>
        {note}
      </Text>
    </View>
  );
}

function OptionRow({
  active,
  title,
  desc,
  onPress,
}: {
  active: boolean;
  title: string;
  desc?: string;
  onPress: () => void;
}) {
  const { c, radius } = useMarina();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 56,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.soft,
        borderWidth: 1,
        borderColor: active ? c.brand : c.line,
        backgroundColor: active ? c.brandSoft : c.surface,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15, color: c.ink }}>{title}</Text>
        {desc ? (
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.muted }}>
            {desc}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: active ? c.brand : c.line,
          backgroundColor: active ? c.brand : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {active && <Ionicons name="checkmark" size={14} color="#ffffff" />}
      </View>
    </Pressable>
  );
}
