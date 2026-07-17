import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { anyAssessedItem, SLICE_NEW_CONTEXT } from "@ie/core/data/slice";
import {
  day14TrainedOrder,
  holdoutOrder,
  checkAssessmentAnswer,
  recordAssessmentItem,
  finishDay14,
  finishHoldout,
  recordNewContext,
  assessmentAvailable,
  useSliceState,
} from "@ie/core/slice";
import { addArtifact } from "@ie/core/output";
import { useVoiceRecorder } from "@ie/media/recorder";
import { useMarina } from "@/theme";
import { SliceScreen, SliceCard, SliceBtn, SliceNote } from "@/components/slice-ui";

// День 14 — строго по порядку, раздельными шагами:
// 1) тест 22 ТРЕНИРУЕМЫХ (тот же относительный порядок, что на претесте);
// 2) задача нового контекста (до любой экспозиции контрольных!);
// 3) отдельный тест 6 КОНТРОЛЬНЫХ; 4) финальная выгрузка (на хабе).
// Как и претест — без подсказок и без показа правильных ответов.

type Phase = "test" | "context" | "holdout" | "done";

export default function SliceAssess() {
  const params = useLocalSearchParams<{ phase?: string }>();
  const [phase, setPhase] = useState<Phase>(
    params.phase === "context" ? "context" : params.phase === "holdout" ? "holdout" : "test"
  );
  const s = useSliceState();

  // Протокол охраняется и в ядре (finishDay14/recordNewContext/finishHoldout
  // и запись контрольных бросают), и здесь — чтобы прямой заход по ссылке
  // не открыл шаг раньше времени.
  if (phase === "test" && !assessmentAvailable()) return <NotYetScreen />;
  if (phase === "context" && !s.assessAt) return <NotYetScreen />;
  if (phase === "holdout" && !s.newContextAt) return <NotYetScreen />;

  if (phase === "test") return <Day14Test onDone={() => setPhase("context")} />;
  if (phase === "context") return <NewContextTask onDone={() => setPhase("holdout")} />;
  if (phase === "holdout") return <HoldoutTest onDone={() => setPhase("done")} />;
  return <DoneScreen />;
}

function NotYetScreen() {
  const { c } = useMarina();
  const router = useRouter();
  return (
    <SliceScreen title="Отложенный тест">
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
          Тест ещё не открыт
        </Text>
        <SliceNote text="Он откроется, когда будут выполнены оба условия: все 14 учебных сессий пройдены и с претеста прошло 14 календарных дней. Так сравнение с базовой линией остаётся честным." />
        <SliceBtn label="К пилоту" onPress={() => router.back()} />
      </SliceCard>
    </SliceScreen>
  );
}

function Day14Test({ onDone }: { onDone: () => void }) {
  const { c } = useMarina();
  const order = useMemo(() => day14TrainedOrder(), []);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const item = anyAssessedItem(order[i] ?? "");

  function submit(blank: boolean) {
    if (!item) return;
    const text = blank ? "" : answer;
    recordAssessmentItem("day14", item.id, text, checkAssessmentAnswer(item.id, text));
    setAnswer("");
    if (i + 1 >= order.length) {
      finishDay14();
      onDone();
    } else {
      setI((v) => v + 1);
    }
  }

  if (!item) return null;

  return (
    <SliceScreen title={`Тест · ${i + 1} из ${order.length}`}>
      <SliceNote text="22 учебные единицы, как на претесте: русский смысл → английская форма. Без подсказок, «Не помню» — честно. Контрольные единицы будут отдельным шагом позже." />
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 20, color: c.ink }}>{item.ru}</Text>
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
    </SliceScreen>
  );
}

function NewContextTask({ onDone }: { onDone: () => void }) {
  const { c } = useMarina();
  const rec = useVoiceRecorder();
  const [text, setText] = useState("");
  const [uri, setUri] = useState<string | null>(null);

  async function toggle() {
    if (rec.recording) {
      const u = await rec.stop();
      if (u) {
        setUri(u);
        addArtifact({ type: "speech", promptId: "slice-new-context", audioRef: u, words: [] });
      }
    } else {
      await rec.start();
    }
  }

  return (
    <SliceScreen title="Новый контекст">
      <SliceCard>
        <Text style={{ fontFamily: "Lora_700Bold", fontSize: 20, color: c.ink }}>
          {SLICE_NEW_CONTEXT.en}
        </Text>
        <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 14, lineHeight: 21, color: c.muted }}>
          {SLICE_NEW_CONTEXT.ru}
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Напиши свой ответ…"
          placeholderTextColor={c.muted}
          multiline
          style={{
            minHeight: 130,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.line,
            padding: 12,
            fontFamily: "Lora_500Medium",
            fontSize: 17,
            lineHeight: 25,
            color: c.ink,
            textAlignVertical: "top",
          }}
        />
        {rec.supported && (
          <Pressable
            onPress={() => void toggle()}
            accessibilityRole="button"
            style={{
              alignSelf: "center",
              width: 68,
              height: 68,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: rec.recording ? c.rose : c.brandSoft,
            }}
          >
            <Ionicons name={rec.recording ? "stop" : "mic"} size={28} color={rec.recording ? c.onBrand : c.brand} />
          </Pressable>
        )}
        <SliceNote text="Голос — по желанию и только твой: не оценивается. Считается написанный ответ." />
        <SliceBtn
          label="Отправить"
          disabled={text.trim().length < 10}
          onPress={() => {
            recordNewContext(text, uri ?? undefined);
            onDone();
          }}
        />
      </SliceCard>
    </SliceScreen>
  );
}

// Шаг 3: отдельный тест контрольных — первое предъявление после претеста.
// Идёт строго ПОСЛЕ нового контекста, чтобы их экспозиция не загрязнила
// свободное производство (порядок охраняется и в ядре).
function HoldoutTest({ onDone }: { onDone: () => void }) {
  const { c } = useMarina();
  const order = useMemo(() => holdoutOrder(), []);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const item = anyAssessedItem(order[i] ?? "");

  function submit(blank: boolean) {
    if (!item) return;
    const text = blank ? "" : answer;
    recordAssessmentItem("day14", item.id, text, checkAssessmentAnswer(item.id, text));
    setAnswer("");
    if (i + 1 >= order.length) {
      finishHoldout();
      onDone();
    } else {
      setI((v) => v + 1);
    }
  }

  if (!item) return null;

  return (
    <SliceScreen title={`Контрольные · ${i + 1} из ${order.length}`}>
      <SliceNote text="Последний шаг: 6 контрольных единиц. Они не появлялись в уроках — это честное сравнение, не проверка тебя. «Не помню» — совершенно нормальный ответ." />
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 20, color: c.ink }}>{item.ru}</Text>
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
    </SliceScreen>
  );
}

function DoneScreen() {
  const { c } = useMarina();
  const router = useRouter();
  return (
    <SliceScreen title="Пилот завершён">
      <SliceCard tone="soft">
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 18, color: c.ink }}>
          Это было всё. Спасибо!
        </Text>
        <SliceNote text="Ты прошла претест, сессии, тест учебных единиц, новый контекст и контрольные. На главном экране пилота — кнопка финальной выгрузки: отправь JSON Галине." />
        <SliceBtn label="К пилоту" onPress={() => router.back()} />
      </SliceCard>
    </SliceScreen>
  );
}
