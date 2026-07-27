import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { sliceItem, type SliceItem, SLICE_TEXTS } from "@ie/core/data/slice";
import {
  nextSessionPlan,
  startSession,
  completeSessionGuarded,
  recordEncounter,
  recordRetrieval,
  recordProduction,
  recordVoiceArtifact,
  recordSummaryShown,
  loadS5SessionDraft,
  saveS5SessionDraft,
  clearS5SessionDraft,
  itemFoundInText,
  detectFoundItems,
  productionSatisfied,
  type LadderDepth,
  type SessionPlan,
} from "@ie/core/slice";
import { addArtifact } from "@ie/core/output";
import { speakEnglish } from "@ie/media/speech";
import { useVoiceRecorder, playRecording } from "@ie/media/recorder";
import { useMarina } from "@/theme";
import { SliceScreen, SliceCard, SliceBtn, SliceNote, SliceChip } from "@/components/slice-ui";

// Сессия среза — один полный микроцикл (спека §5):
// прайминг → встреча (текст) → извлечение с лесенкой → производство →
// повтор вслух (приватный артефакт, не оценивается) → резюме ПО ТЕКСТУ.
// Recovery-режим: короткий возврат без нового материала.

type Step = "prime" | "text" | "retrieve" | "produce" | "voice" | "summary";

export default function SliceSession() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const recovery = params.mode === "recovery";

  const plan: SessionPlan = useMemo(() => nextSessionPlan(recovery), [recovery]);
  const reviewItems = useMemo(
    () => plan.reviewIds.map((id) => sliceItem(id)).filter((x): x is SliceItem => Boolean(x)),
    [plan]
  );
  const queue = useMemo(() => [...plan.newItems, ...reviewItems], [plan, reviewItems]);
  const dayText = plan.introDay ? SLICE_TEXTS.find((t) => t.day === plan.introDay) : undefined;
  const restored = useMemo(() => loadS5SessionDraft(plan), [plan]);

  const [step, setStep] = useState<Step>(restored?.step ?? (plan.type === "intro" ? "prime" : "retrieve"));
  const [prodText, setProdText] = useState(restored?.productionText ?? "");
  const [foundIds, setFoundIds] = useState<string[]>(restored?.foundIds ?? []);
  const [retrieveIndex, setRetrieveIndex] = useState(restored?.retrieveIndex ?? 0);
  const [retrievalInput, setRetrievalInput] = useState(restored?.retrievalInput ?? "");

  const started = useRef(Boolean(restored?.startedEventId));
  const startedEventId = useRef<string | null>(restored?.startedEventId ?? null);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startedEventId.current = startSession(plan).id;
    if (plan.type === "intro") recordEncounter(plan.newItems.map((i) => i.id), "prime");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!startedEventId.current) return;
    saveS5SessionDraft(plan, {
      step,
      retrieveIndex,
      retrievalInput,
      productionText: prodText,
      foundIds,
      startedEventId: startedEventId.current,
    });
  }, [foundIds, plan, prodText, retrievalInput, retrieveIndex, step]);

  const stepNumber: Record<Step, number> = {
    prime: 1,
    text: 2,
    retrieve: 3,
    produce: 4,
    voice: 5,
    summary: 6,
  };

  function exitSession() {
    const leave = () => router.replace("/entry/path-hub");
    if (step === "produce" && prodText.trim()) {
      Alert.alert("Выйти?", "Черновик сохранён — продолжишь с этого места.", [
        { text: "Остаться", style: "cancel" },
        { text: "Выйти", onPress: leave },
      ]);
      return;
    }
    leave();
  }

  return (
    <SliceScreen
      title={plan.type === "recovery" ? "Мягкий возврат" : "Сессия дня"}
      progress={{ current: stepNumber[step], total: 6 }}
      onBack={exitSession}
    >
      {restored && step === "produce" && (
        <SliceNote text="Продолжаем. Твоя фраза ждёт на месте." />
      )}
      {step === "prime" && (
        <PrimeStep plan={plan} onNext={() => setStep("text")} />
      )}
      {step === "text" && dayText && (
        <TextStep
          plan={plan}
          text={dayText}
          onNext={() => {
            recordEncounter(plan.newItems.map((i) => i.id), "text");
            setStep(queue.length ? "retrieve" : "produce");
          }}
        />
      )}
      {step === "retrieve" && (
        <RetrieveStep
          queue={queue}
          initialIndex={retrieveIndex}
          initialInput={retrievalInput}
          onProgress={(index, input) => {
            setRetrieveIndex(index);
            setRetrievalInput(input);
          }}
          onDone={() => setStep("produce")}
        />
      )}
      {step === "produce" && (
        <ProduceStep
          plan={plan}
          initialText={prodText}
          onDraft={setProdText}
          onDone={(text, ids) => {
            setProdText(text);
            setFoundIds(ids);
            setStep("voice");
          }}
        />
      )}
      {step === "voice" && (
        <VoiceStep text={prodText} foundIds={foundIds} onNext={() => setStep("summary")} />
      )}
      {step === "summary" && (
        <SummaryStep
          plan={plan}
          text={prodText}
          foundIds={foundIds}
          onFinish={() => {
            const result = completeSessionGuarded(plan, startedEventId.current ?? "");
            if (result.completed) {
              clearS5SessionDraft();
              router.replace("/entry/path-hub");
            }
          }}
        />
      )}
    </SliceScreen>
  );
}

// ───────── шаг 1: прайминг ─────────

function PrimeStep({ plan, onNext }: { plan: SessionPlan; onNext: () => void }) {
  const { c } = useMarina();
  return (
    <>
      <SliceNote text="Единицы дня. Послушай каждую — заданий пока нет." />
      {plan.newItems.map((item) => (
        <SliceCard key={item.id}>
          <Pressable
            onPress={() => speakEnglish(item.en.replace(/…$/, ""), { rate: 0.9, interrupt: true })}
            accessibilityRole="button"
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <Ionicons name="volume-medium" size={18} color={c.brand} />
            <Text style={{ fontFamily: "Lora_700Bold", fontSize: 24, color: c.ink, flex: 1 }}>
              {item.en}
            </Text>
          </Pressable>
          <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 14, color: c.muted }}>
            {item.ru}
          </Text>
          {item.note && <SliceNote text={item.note} />}
        </SliceCard>
      ))}
      <SliceBtn label="К тексту дня" onPress={onNext} />
    </>
  );
}

// ───────── шаг 2: встреча (связный текст) ─────────

function TextStep({
  plan,
  text,
  onNext,
}: {
  plan: SessionPlan;
  text: { title: string; en: string; ru: string };
  onNext: () => void;
}) {
  const { c } = useMarina();
  const [showRu, setShowRu] = useState(false);
  return (
    <>
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.muted }}>
          {text.title}
        </Text>
        <Pressable onPress={() => speakEnglish(text.en, { rate: 0.92, interrupt: true })}>
          <Text style={{ fontFamily: "Lora_500Medium", fontSize: 18, lineHeight: 28, color: c.ink }}>
            {text.en}
          </Text>
        </Pressable>
        <Pressable onPress={() => setShowRu((v) => !v)} accessibilityRole="button">
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.brand }}>
            {showRu ? "Скрыть перевод" : "Показать перевод"}
          </Text>
        </Pressable>
        {showRu && (
          <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 21, color: c.muted }}>
            {text.ru}
          </Text>
        )}
        <SliceNote text="Тап по тексту — озвучка целиком." />
      </SliceCard>
      {plan.grammar && (
        <SliceCard tone="soft">
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.ink }}>
            Два прошедших — две разные мысли
          </Text>
          <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 15, color: c.ink }}>
            {plan.grammar.ppc}
          </Text>
          <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 15, color: c.ink }}>
            {plan.grammar.past}
          </Text>
          <SliceNote text={plan.grammar.note} />
        </SliceCard>
      )}
      <SliceBtn label="Теперь достань сама" onPress={onNext} />
    </>
  );
}

// ───────── шаг 3: извлечение с лесенкой ─────────

function hintFor(item: SliceItem): string {
  const canonical = item.en.replace(/…$/, "");
  const words = canonical.split(" ");
  if (words.length > 1) return `${words[0]} … (${words.length} слова)`;
  return `${canonical.slice(0, 2)}… (${canonical.length} букв)`;
}

function choicesFor(item: SliceItem, all: SliceItem[]): string[] {
  const others = all.filter((i) => i.id !== item.id && i.kind === item.kind);
  const pool = others.length >= 2 ? others : all.filter((i) => i.id !== item.id);
  const opts = [item.en, pool[0]?.en ?? "—", pool[1]?.en ?? "—"];
  return [...opts].sort();
}

function RetrieveStep({
  queue,
  initialIndex,
  initialInput,
  onProgress,
  onDone,
}: {
  queue: SliceItem[];
  initialIndex: number;
  initialInput: string;
  onProgress: (index: number, input: string) => void;
  onDone: () => void;
}) {
  const { c } = useMarina();
  const [qi, setQi] = useState(initialIndex);
  const [input, setInput] = useState(initialInput);
  const [depth, setDepth] = useState<LadderDepth>(0);
  const [flash, setFlash] = useState<"ok" | "retry" | null>(null);
  const shownAt = useRef(Date.now());

  const item = queue[qi];
  useEffect(() => {
    shownAt.current = Date.now();
  }, [qi]);

  useEffect(() => {
    if (!item) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);
  if (!item) return null;

  function next() {
    setInput("");
    setDepth(0);
    setFlash(null);
    const nextIndex = qi + 1;
    setQi(nextIndex);
    onProgress(nextIndex, "");
  }

  function submit() {
    if (!input.trim()) return;
    const ok = itemFoundInText(item, input);
    if (ok) {
      recordRetrieval(item.id, depth, Date.now() - shownAt.current);
      setFlash("ok");
      speakEnglish(item.en.replace(/…$/, ""), { rate: 0.9, interrupt: true });
      setTimeout(next, 700);
    } else if (depth < 3) {
      setDepth((d) => Math.min(d + 1, 3) as LadderDepth);
      setFlash("retry");
      if (depth + 1 === 3) setInput("");
    }
  }

  const canonical = item.en.replace(/…$/, "");

  return (
    <>
      <SliceNote
        text={`Извлечение ${qi + 1} из ${queue.length}. Русский смысл → напиши английскую форму.`}
      />
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 20, color: c.ink }}>
          {item.ru}
        </Text>

        {depth === 1 && (
          <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 16, color: c.brandInk }}>
            Подсказка: {hintFor(item)}
          </Text>
        )}
        {depth === 2 && (
          <View style={{ gap: 8 }}>
            <SliceNote text="Выбери и впиши:" />
            {choicesFor(item, queue).map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setInput(opt.replace(/…$/, ""))}
                accessibilityRole="button"
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.line,
                  padding: 12,
                  backgroundColor: c.surface,
                }}
              >
                <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 16, color: c.ink }}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        {depth === 3 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: "Lora_700Bold", fontSize: 22, color: c.brandInk }}>
              {item.en}
            </Text>
            <SliceNote text="Вот форма. Впиши её сама — рука тоже запоминает." />
          </View>
        )}

        <TextInput
          value={input}
          onChangeText={(v) => {
            setInput(v);
            onProgress(qi, v);
            if (flash === "retry") setFlash(null);
          }}
          placeholder="Напиши по-английски…"
          placeholderTextColor={c.muted}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={submit}
          style={{
            minHeight: 52,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: flash === "ok" ? c.accent : c.line,
            paddingHorizontal: 14,
            fontFamily: "Lora_600SemiBold",
            fontSize: 18,
            color: c.ink,
          }}
        />
        {flash === "ok" && (
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.accentD }}>
            Есть. {canonical}
          </Text>
        )}
        {flash === "retry" && depth < 3 && (
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.rose }}>
            Ещё раз — подсказка выше.
          </Text>
        )}
        <SliceBtn label="Проверить" disabled={!input.trim()} onPress={submit} />
      </SliceCard>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: c.brandSoft, overflow: "hidden" }}>
        <View
          style={{ width: `${Math.round((qi / Math.max(queue.length, 1)) * 100)}%`, height: 4, backgroundColor: c.accent }}
        />
      </View>
    </>
  );
}

// ───────── шаг 4: производство (письменно, о себе) ─────────

function ProduceStep({
  plan,
  initialText,
  onDraft,
  onDone,
}: {
  plan: SessionPlan;
  initialText: string;
  onDraft: (text: string) => void;
  onDone: (text: string, foundIds: string[]) => void;
}) {
  const { c } = useMarina();
  const [text, setText] = useState(initialText);
  const [nudged, setNudged] = useState(false);
  const target = plan.production.itemId ? sliceItem(plan.production.itemId) : undefined;

  function finish(force: boolean) {
    const satisfied = productionSatisfied(plan.production, text);
    if (!satisfied && !force && !nudged) {
      setNudged(true);
      return;
    }
    const found = detectFoundItems(text).map((i) => i.id);
    recordProduction(plan.production.kind, text, found, satisfied);
    onDone(text, found);
  }

  const nudgeText = target
    ? `Попробуй вписать: ${target.en}`
    : plan.production.grammar === "ppc"
      ? "Попробуй форму I've been + глагол-ing (I've been working on…)"
      : "Попробуй past simple + когда это было (last week, yesterday, in June…)";

  return (
    <>
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
          Теперь — о тебе
        </Text>
        <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 15, lineHeight: 22, color: c.ink }}>
          {plan.production.ru}
        </Text>
        <TextInput
          value={text}
          onChangeText={(value) => {
            setText(value);
            onDraft(value);
          }}
          placeholder="Напиши 1–3 предложения…"
          placeholderTextColor={c.muted}
          multiline
          autoCapitalize="sentences"
          style={{
            minHeight: 110,
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
        {nudged && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.brandInk }}>
              {nudgeText}
            </Text>
            <SliceBtn kind="ghost" label="Оставить как есть" onPress={() => finish(true)} />
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accent }} />
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 14, color: c.muted }}>
            Сохранено на устройстве
          </Text>
        </View>
        <SliceBtn label="Сохранить и дальше" disabled={text.trim().length < 5} onPress={() => finish(false)} />
      </SliceCard>
    </>
  );
}

// ───────── шаг 5: повтор вслух (приватный артефакт) ─────────

function VoiceStep({
  text,
  foundIds,
  onNext,
}: {
  text: string;
  foundIds: string[];
  onNext: () => void;
}) {
  const { c } = useMarina();
  const rec = useVoiceRecorder();
  const [uri, setUri] = useState<string | null>(null);

  async function toggle() {
    if (rec.recording) {
      const u = await rec.stop();
      if (u) {
        setUri(u);
        addArtifact({ type: "speech", promptId: "slice-say", audioRef: u, words: foundIds });
        recordVoiceArtifact(u, "slice-say");
      }
    } else {
      await rec.start();
    }
  }

  return (
    <>
      <SliceCard>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
          Скажи это вслух
        </Text>
        <Text style={{ fontFamily: "Lora_500Medium", fontSize: 18, lineHeight: 27, color: c.ink }}>
          {text}
        </Text>
        <SliceNote text="Запись — только твоя: остаётся на устройстве, никуда не уходит и не оценивается. Это опыт «я это произнесла», не экзамен." />
        {rec.supported ? (
          <Pressable
            onPress={() => void toggle()}
            accessibilityRole="button"
            style={{
              alignSelf: "center",
              width: 84,
              height: 84,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: rec.recording ? c.rose : c.brand,
            }}
          >
            <Ionicons name={rec.recording ? "stop" : "mic"} size={34} color={c.onBrand} />
          </Pressable>
        ) : (
          <SliceNote text="На этом устройстве запись недоступна — можно просто произнести вслух." />
        )}
        {uri && (
          <SliceBtn kind="ghost" label="Послушать себя" onPress={() => void playRecording(uri)} />
        )}
      </SliceCard>
      <SliceBtn label={uri ? "Дальше" : "Дальше (без записи — можно)"} onPress={onNext} />
    </>
  );
}

// ───────── шаг 6: резюме по написанному ответу ─────────

function SummaryStep({
  plan,
  text,
  foundIds,
  onFinish,
}: {
  plan: SessionPlan;
  text: string;
  foundIds: string[];
  onFinish: () => void;
}) {
  const { c } = useMarina();
  const logged = useRef(false);
  useEffect(() => {
    if (!logged.current) {
      logged.current = true;
      recordSummaryShown(foundIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const foundItems = foundIds
    .map((id) => sliceItem(id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const variantsFrom = foundItems.slice(0, 3);

  return (
    <>
      <SliceCard tone="soft">
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>
          Твоя фраза готова.
        </Text>
        <SliceNote text="Разбор — по твоему написанному ответу. Голос остаётся личным: мы его не анализируем." />
        {text.length > 0 && (
          <Text
            style={{
              fontFamily: "Lora_500Medium_Italic",
              fontSize: 17,
              lineHeight: 26,
              color: c.ink,
            }}
          >
            «{text}»
          </Text>
        )}
      </SliceCard>

      {foundItems.length > 0 && (
        <SliceCard>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.ink }}>
            В твоём тексте нашлись
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {foundItems.map((i) => (
              <SliceChip key={i.id} label={i.en} tone="found" />
            ))}
          </View>
        </SliceCard>
      )}

      {variantsFrom.length > 0 && (
        <SliceCard>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.ink }}>
            А ещё так говорят
          </Text>
          {variantsFrom.map((i) => (
            <View key={i.id} style={{ gap: 2 }}>
              <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 12, color: c.muted }}>
                {i.en}
              </Text>
              <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 15, color: c.ink }}>
                {i.variants.join(" · ")}
              </Text>
            </View>
          ))}
        </SliceCard>
      )}

      {plan.transform && (
        <SliceCard>
          <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 14, color: c.ink }}>
            Образец трансформации
          </Text>
          <Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 15, color: c.ink }}>
            {plan.transform.sample}
          </Text>
        </SliceCard>
      )}

      <SliceNote text="Это автоматический разбор написанного текста. Голосовая запись не анализировалась." />
      <SliceBtn label="Вернуться к плану" onPress={onFinish} />
    </>
  );
}
