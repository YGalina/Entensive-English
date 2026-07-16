import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { recordPilotEntry, type ProfileKey, type ProfileMark } from "@ie/core/slice";
import { useMarina } from "@/theme";
import { SliceScreen, SliceCard, SliceBtn, SliceNote } from "@/components/slice-ui";

// Вход в пилот: пять НАБЛЮДАЕМЫХ проверок профиля (спека §2, Г-1).
// Заполняется на живом разговоре с Галиной. Три исхода на признак:
// да / нет / недостаточно данных — численных порогов нет, решение о
// включении принимает человек. Это данные пилота, не гейт приложения.

const CRITERIA: { key: ProfileKey; title: string; check: string }[] = [
  {
    key: "P1",
    title: "Понимает текст среза",
    check: "Прочитала текст дня 1 и пересказала по-русски суть без словаря.",
  },
  {
    key: "P2",
    title: "Узнаёт конструкцию",
    check: "Видит разницу «I've been doing / I did»: какая про процесс, какая про факт.",
  },
  {
    key: "P3",
    title: "Дефицит извлечения",
    check: "«Скажи: мы уложились в срок» — пауза, калька или отказ, хотя в тексте узнала.",
  },
  {
    key: "P4",
    title: "Устная задача с опорой посильна",
    check: "С карточкой-фреймом произносит 1–2 предложения о своей работе.",
  },
  {
    key: "P5",
    title: "Есть конкретная цель",
    check: "Называет реальную ситуацию, где ей зададут вопрос среза.",
  },
];

const MARKS: { value: ProfileMark; label: string }[] = [
  { value: "yes", label: "Да" },
  { value: "no", label: "Нет" },
  { value: "insufficient", label: "Недостаточно данных" },
];

export default function SliceEntry() {
  const { c } = useMarina();
  const router = useRouter();
  const [marks, setMarks] = useState<Partial<Record<ProfileKey, ProfileMark>>>({});
  const [note, setNote] = useState("");
  const allMarked = CRITERIA.every((cr) => marks[cr.key]);

  return (
    <SliceScreen title="Вход в пилот">
      <SliceNote text="Заполняется вместе с Галиной на разговоре. «Недостаточно данных» — честный ответ, он никого не отсеивает автоматически." />
      {CRITERIA.map((cr) => (
        <SliceCard key={cr.key}>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.ink }}>
            {cr.key} · {cr.title}
          </Text>
          <SliceNote text={cr.check} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {MARKS.map((m) => {
              const active = marks[cr.key] === m.value;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => setMarks((prev) => ({ ...prev, [cr.key]: m.value }))}
                  accessibilityRole="button"
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: active ? c.brand : c.line,
                    backgroundColor: active ? c.brand : c.surface,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "GolosText_600SemiBold",
                      fontSize: 13,
                      color: active ? c.onBrand : c.ink,
                    }}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SliceCard>
      ))}
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.ink }}>Заметка</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Цель, контекст, наблюдения…"
          placeholderTextColor={c.muted}
          multiline
          style={{
            minHeight: 70,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.line,
            padding: 12,
            fontFamily: "GolosText_400Regular",
            fontSize: 14,
            color: c.ink,
            textAlignVertical: "top",
          }}
        />
      </SliceCard>
      <SliceNote text="Данные пилота хранятся только на этом устройстве и выгружаются вручную кнопкой на главном экране пилота." />
      <SliceBtn
        label="Сохранить и войти в пилот"
        disabled={!allMarked}
        onPress={() => {
          recordPilotEntry(marks as Record<ProfileKey, ProfileMark>, note);
          router.back();
        }}
      />
    </SliceScreen>
  );
}
