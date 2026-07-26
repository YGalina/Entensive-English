import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { A11Y } from "@ie/tokens/primitives";
import { useMarina } from "@/theme";
import { saveProfile, isComplete, readProfile, type ProfileSigns, type SignAnswer } from "@ie/core/entryProfile";
import { S3_QUESTIONS, S3_COPY } from "@ie/core/entryProfileContent";

// S3 Profile Entry — full product screen (PR 3).
// Source: frozen `docs/design/exports/batch-a-defaults-final/screens/S3_profile_entry.html` (v4):
// one question per screen, «N из 5» counter, five-segment progress, context card,
// three equal answers, note at the end.
//
// Five observable signs — never a level claim. «Не могу оценить» is a first-class
// answer, not a failure. Saving writes the profile bound to the active local path
// (see @ie/core/entryProfile) and only then opens Path Hub; a write failure is
// reported honestly and the entry stays closed until the profile is saved.

const TOTAL = S3_QUESTIONS.length;

export default function ProfileEntry() {
  const router = useRouter();
  const { c, radius } = useMarina();
  const insets = useSafeAreaInsets();

  // Повторный вход не перезаписывает завершённый профиль молча: если он уже есть
  // на активной траектории, ответы подставляются и меняются явным действием.
  const existing = readProfile();
  const [answers, setAnswers] = useState<Partial<ProfileSigns>>(existing?.signs ?? {});
  const [note, setNote] = useState(existing?.note ?? "");
  const [step, setStep] = useState(0); // 0..TOTAL-1 — вопросы, TOTAL — заметка
  const [failed, setFailed] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);

  const onNote = step >= TOTAL;
  const question = onNote ? null : S3_QUESTIONS[step];

  function answer(key: keyof ProfileSigns, value: SignAnswer) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTranslationOpen(false);
    setStep((s) => s + 1);
  }

  function goBack() {
    setFailed(false);
    // На первом вопросе выход детерминированный: S2 входит сюда через replace(),
    // поэтому router.back() не гарантирует возврат на узнавание.
    if (step === 0) router.replace("/entry/recognition" as Href);
    else {
      setTranslationOpen(false);
      setStep((s) => s - 1);
    }
  }

  function save() {
    if (!isComplete(answers)) return;
    const res = saveProfile(answers, note.trim());
    if (res.ok) {
      setFailed(false);
      router.replace("/entry/path-hub" as Href);
    } else {
      setFailed(true); // ответы остаются на экране; вход не открывается
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 26,
        paddingTop: insets.top + 14,
        paddingBottom: insets.bottom + 24,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Шапка: назад · заголовок · счётчик */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={S3_COPY.back}
          onPress={goBack}
          style={{
            width: A11Y.minTouchTarget,
            height: A11Y.minTouchTarget,
            marginLeft: -12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 22, color: c.muted }}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>{S3_COPY.screenTitle}</Text>
        {!onNote && (
          <Text
            style={{
              marginLeft: "auto",
              fontFamily: "GolosText_600SemiBold",
              fontSize: 14,
              color: c.muted,
              fontVariant: ["tabular-nums"],
            }}
          >
            {S3_COPY.counter(step + 1, TOTAL)}
          </Text>
        )}
      </View>

      {/* Прогресс: пройдено — мята, текущий — амбер, впереди — бумага */}
      <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
        {S3_QUESTIONS.map((q, i) => (
          <View
            key={q.key}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 6,
              backgroundColor: i < step ? c.accent : i === step ? c.amber : c.brandSoft,
            }}
          />
        ))}
      </View>

      {question ? (
        <View style={{ flex: 1, paddingTop: 26 }}>
          <Text
            style={{
              fontFamily: "GolosText_800ExtraBold",
              fontSize: 28,
              lineHeight: 34,
              letterSpacing: -0.7,
              color: c.ink,
            }}
          >
            {question.title}
          </Text>

          {/* Карточка-контекст: ситуация, английская реплика, перевод */}
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 22,
              padding: 22,
              marginTop: 22,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.warn }} />
              <Text
                style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, letterSpacing: 1, color: c.muted }}
              >
                {question.kicker}
              </Text>
            </View>
            <Text
              style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.muted, marginTop: 12 }}
            >
              {question.lead}
            </Text>
            <Text style={{ fontFamily: "Lora_400Regular", fontSize: 28, lineHeight: 38, color: c.ink, marginTop: 10 }}>
              {question.english.before}
              <Text style={{ backgroundColor: c.amber }}>{question.english.highlight}</Text>
              {question.english.after}
            </Text>
            {question.key === "s1" || question.key === "s2" ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: translationOpen }}
                  onPress={() => setTranslationOpen((open) => !open)}
                  style={{
                    minHeight: A11Y.minTouchTarget,
                    marginTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: c.brandSoft,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: c.brand,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 12, color: c.brand }}>RU</Text>
                  </View>
                  <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 15, color: c.brand }}>
                    {translationOpen ? "Скрыть перевод" : "Показать перевод"}
                  </Text>
                  {!translationOpen && (
                    <Text style={{ flex: 1, fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted }}>
                      {question.key === "s1" ? "— сначала попробуй без него" : "— если хочешь проверить себя"}
                    </Text>
                  )}
                </Pressable>
                {translationOpen && (
                  <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.muted }}>
                    {question.translation}
                  </Text>
                )}
              </>
            ) : (
              <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, color: c.muted, marginTop: 10 }}>
                {question.translation}
              </Text>
            )}
          </View>

          {/* Три равноправных ответа */}
          <View style={{ gap: 12, marginTop: 26 }}>
            {(
              [
                ["yes", question.options.yes],
                ["no", question.options.no],
                ["insufficient", question.options.insufficient],
              ] as const
            ).map(([value, label]) => {
              const selected = answers[question.key] === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => answer(question.key, value)}
                  style={{
                    minHeight: 60,
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: selected ? c.brand : c.line,
                    borderRadius: 16,
                    backgroundColor: selected ? c.brandSoft : c.surface,
                    paddingHorizontal: 22,
                  }}
                >
                  <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 18, color: c.ink }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flex: 1, minHeight: 18 }} />
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, paddingBottom: 8 }}>
            {S3_COPY.noteHint}
          </Text>
        </View>
      ) : (
        /* Финальный шаг: необязательная заметка и сохранение */
        <View style={{ flex: 1, paddingTop: 26 }}>
          <Text
            style={{
              fontFamily: "GolosText_800ExtraBold",
              fontSize: 28,
              lineHeight: 34,
              letterSpacing: -0.7,
              color: c.ink,
            }}
          >
            {S3_COPY.noteTitle}
          </Text>
          <Text
            style={{ fontFamily: "GolosText_400Regular", fontSize: 16, lineHeight: 24, color: c.muted, marginTop: 12 }}
          >
            {S3_COPY.noteLead}
          </Text>
          <TextInput
            accessibilityLabel={S3_COPY.noteTitle}
            value={note}
            onChangeText={setNote}
            placeholder={S3_COPY.notePlaceholder}
            placeholderTextColor={c.muted}
            multiline
            style={{
              minHeight: 96,
              borderWidth: 1,
              borderColor: c.line,
              borderRadius: radius.card,
              backgroundColor: c.surface,
              padding: 16,
              marginTop: 18,
              fontFamily: "GolosText_400Regular",
              fontSize: 16,
              lineHeight: 24,
              color: c.ink,
              textAlignVertical: "top",
            }}
          />
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted, marginTop: 10 }}>
            {S3_COPY.noteSkipHint}
          </Text>

          {failed && (
            <View
              style={{
                marginTop: 18,
                borderWidth: 1,
                borderColor: c.rose,
                borderRadius: radius.card,
                backgroundColor: c.surface,
                padding: 16,
              }}
            >
              <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
                {S3_COPY.saveFailedTitle}
              </Text>
              <Text
                style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.muted, marginTop: 6 }}
              >
                {S3_COPY.saveFailedLead}
              </Text>
            </View>
          )}

          <View style={{ flex: 1, minHeight: 24 }} />
          <Pressable
            accessibilityRole="button"
            onPress={save}
            style={{
              height: 56,
              borderRadius: 16,
              backgroundColor: c.brand,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.onBrand }}>
              {failed ? S3_COPY.saveFailedRetry : S3_COPY.save}
            </Text>
          </Pressable>
          {/* Обещание до сохранения; при отказе его не показываем — там честный
              отказ выше. Подтверждения «сохранено» нет: успех сразу уводит в Path Hub. */}
          {!failed && (
            <Text
              style={{
                fontFamily: "GolosText_400Regular",
                fontSize: 14,
                color: c.muted,
                textAlign: "center",
                marginTop: 10,
              }}
            >
              {S3_COPY.saveLocalHint}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
