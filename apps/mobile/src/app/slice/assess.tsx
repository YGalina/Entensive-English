import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { sliceItem, SLICE_NEW_CONTEXT } from "@ie/core/data/slice";
import {
  assessmentOrder,
  checkAssessmentAnswer,
  recordAssessmentItem,
  finishDay14,
  recordNewContext,
  detectFoundItems,
} from "@ie/core/slice";
import { addArtifact } from "@ie/core/output";
import { useVoiceRecorder } from "@ie/media/recorder";
import { useMarina } from "@/theme";
import { SliceScreen, SliceCard, SliceBtn, SliceNote } from "@/components/slice-ui";

// Отложенный тест (≥14 дней от претеста): те же 22 единицы, тот же порядок,
// тот же протокол — retention тренированных. Затем задача нового контекста:
// употребление тренированных единиц там, где мы не тренировались.
// Как и претест — без подсказок и без показа правильных ответов.

type Phase = "test" | "context" | "done";

export default function SliceAssess() {
  const params = useLocalSearchParams<{ phase?: string }>();
  const [phase, setPhase] = useState<Phase>(params.phase === "context" ? "context" : "test");

  if (phase === "test") return <Day14Test onDone={() => setPhase("context")} />;
  if (phase === "context") return <NewContextTask onDone={() => setPhase("done")} />;
  return <DoneScreen />;
}

function Day14Test({ onDone }: { onDone: () => void }) {
  const { c } = useMarina();
  const order = useMemo(() => assessmentOrder(), []);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const item = sliceItem(order[i] ?? "");

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
      <SliceNote text="Как на претесте: русский смысл → английская форма. Без подсказок, «Не помню» — честно." />
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
            recordNewContext(text, detectFoundItems(text).map((x) => x.id), uri ?? undefined);
            onDone();
          }}
        />
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
        <SliceNote text="Ты прошла претест, сессии, отложенный тест и новый контекст. На главном экране пилота — кнопка выгрузки данных: отправь JSON Галине." />
        <SliceBtn label="К пилоту" onPress={() => router.back()} />
      </SliceCard>
    </SliceScreen>
  );
}
