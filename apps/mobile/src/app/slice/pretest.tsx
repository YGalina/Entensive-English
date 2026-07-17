import { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { anyAssessedItem } from "@ie/core/data/slice";
import {
  assessmentOrder,
  checkAssessmentAnswer,
  recordAssessmentItem,
  recordedAssessmentIds,
  finishPretest,
  sliceState,
} from "@ie/core/slice";
import { useMarina } from "@/theme";
import { SliceScreen, SliceCard, SliceBtn, SliceNote } from "@/components/slice-ui";

// Претест (день 0): базовая линия письменного продуктивного извлечения.
// ВАЖНО: без подсказок и без показа правильных ответов — претест не учит,
// иначе он сам станет экспозицией и испортит сравнение с днём 14.
// Вердикт считается молча; «Не помню» — легальный ответ (blank).

export default function SlicePretest() {
  const { c } = useMarina();
  const router = useRouter();
  // Возобновление после прерывания: уже записанные единицы пропускаются —
  // свидетельства иммутабельны, повторная запись отклоняется ядром.
  const total = useMemo(() => assessmentOrder().length, []);
  const order = useMemo(() => {
    const doneIds = new Set(recordedAssessmentIds("pretest"));
    return assessmentOrder().filter((id) => !doneIds.has(id));
  }, []);
  const startedAt = total - order.length;
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const done = i >= order.length;
  const item = done ? undefined : anyAssessedItem(order[i]);

  function submit(blank: boolean) {
    if (!item) return;
    const text = blank ? "" : answer;
    recordAssessmentItem("pretest", item.id, text, checkAssessmentAnswer(item.id, text));
    setAnswer("");
    setI((v) => v + 1);
  }

  if (done) {
    return (
      <SliceScreen title="Претест">
        <SliceCard tone="soft">
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>
            Готово. Ответы записаны.
          </Text>
          <SliceNote text="Это была базовая линия — правильные ответы мы намеренно не показываем. Всё, что сегодня не вспомнилось, придёт в сессиях. Первая — уже доступна." />
          <SliceBtn
            label="К пилоту"
            onPress={() => {
              if (!sliceState().pretestAt) finishPretest();
              router.back();
            }}
          />
        </SliceCard>
      </SliceScreen>
    );
  }

  return (
    <SliceScreen title={`Претест · ${startedAt + i + 1} из ${total}`}>
      <SliceCard>
        <SliceNote text="Как это сказать по-английски? Напиши форму — слово, сочетание или начало фразы. Часть единиц — контрольные: они не появятся в уроках, но важны для честного сравнения." />
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 20, color: c.ink }}>
          {item?.ru}
        </Text>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          placeholder="Напиши по-английски…"
          placeholderTextColor={c.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            minHeight: 52,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.line,
            paddingHorizontal: 14,
            fontFamily: "Lora_600SemiBold",
            fontSize: 18,
            color: c.ink,
          }}
        />
        <SliceBtn label="Дальше" disabled={!answer.trim()} onPress={() => submit(false)} />
        <SliceBtn kind="ghost" label="Не помню — дальше" onPress={() => submit(true)} />
      </SliceCard>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: c.brandSoft, overflow: "hidden" }}>
        <View
          style={{
            width: `${Math.round(((startedAt + i) / total) * 100)}%`,
            height: 4,
            backgroundColor: c.brand,
          }}
        />
      </View>
    </SliceScreen>
  );
}
