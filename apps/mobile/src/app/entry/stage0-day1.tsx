import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useVoiceRecorder, playRecording } from "@ie/media/recorder";
import {
  DAY1_FULL_FACTS,
  DAY1_MINUTES,
  DAY1_SHORT_FACTS,
  answerStage0Day1Comprehension,
  completeStage0Day1,
  confirmStage0Day1FluencyVersion,
  continueStage0Day1AfterComprehension,
  continueStage0Day1AfterGuidedVariation,
  areStage0Day1GuidedAnswersValid,
  finishStage0Day1Core,
  isStage0Day1GuidedAnswer,
  loadStage0Day1,
  markStage0Day1TextRead,
  saveStage0Day1,
  saveStage0Day1GuidedSlot,
  skipStage0Day1GuidedVariation,
  startStage0Day1,
  submitStage0Day1GuidedVariation,
  submitStage0Day1Production,
  submitStage0Day1Retrieval,
  switchStage0Day1Mode,
  type Day1Mode,
  type Stage0Day1State,
} from "@ie/core/stage0Day1";
import { useMarina } from "@/theme";

const PRIME = [
  ["I've been working on…", "— последнее время работаю над…"],
  ["run a project", "— вести проект"],
  ["meet a deadline", "— уложиться в срок"],
  ["come up with", "— придумать (решение, идею)"],
] as const;

const DIALOGUE = [
  ["— So, what are you working on at the moment?", "— Над чем ты сейчас работаешь?"],
  ["— I've been working on the new onboarding flow. It's a bigger job than I expected.", "— Последнее время работаю над новым онбордингом. Задача больше, чем я думала."],
  ["— And you're running that project on your own?", "— И ты ведёшь этот проект сама?"],
  ["— More or less. I get help with the design, but the planning is mine.", "— Более или менее. С дизайном помогают, планирование — моё."],
  ["— What about the date? Still the fifteenth?", "— А дата? Всё ещё пятнадцатое?"],
  ["— Yes. We should meet the deadline, but it'll be tight.", "— Да. Должны уложиться в срок, но будет впритык."],
  ["— If it slips, tell me early. That's all I ask.", "— Если поедет — скажи заранее. Только об этом прошу."],
  ["— Of course. Actually, I came up with a way to cut one step — I'll show you tomorrow.", "— Конечно. Я, кстати, придумала, как убрать один шаг — покажу завтра."],
  ["— That makes sense. Send me a note before the call.", "— Логично. Пришли записку до созвона."],
] as const;

const RETRIEVALS = [
  {
    prompt: "Скажи: последнее время я работаю над новым онбордингом.",
    answer: "I've been working on the new onboarding.",
    first: "I've … (7 слов)",
    choices: ["I've been working on…", "I working on…", "I have work on…"],
  },
  {
    prompt: "Скажи: мы должны уложиться в срок.",
    answer: "We should meet the deadline.",
    first: "We … (5 слов)",
    choices: ["We should meet the deadline.", "We need the deadline.", "We meet to deadline."],
  },
  {
    prompt: "Скажи: я придумала способ убрать один шаг.",
    answer: "I came up with a way to cut one step.",
    first: "I came … (10 слов)",
    choices: ["I came up with…", "I came with up…", "I did come up…"],
  },
] as const;

const SUPPORTS = ["I've been working on…", "run a project", "meet a deadline", "come up with"] as const;

function normalize(value: string) {
  return value.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { c } = useMarina();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: disabled ? c.brandSoft : c.brand,
        opacity: pressed ? 0.86 : 1,
      })}
    >
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: disabled ? c.muted : c.bg }}>{label}</Text>
    </Pressable>
  );
}

function QuietButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useMarina();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: c.line,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        backgroundColor: pressed ? c.brandSoft : c.surface,
      })}
    >
      <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 16, color: c.ink }}>{label}</Text>
    </Pressable>
  );
}

function Card({ children, soft = false }: { children: React.ReactNode; soft?: boolean }) {
  const { c } = useMarina();
  return (
    <View style={{ borderRadius: 20, padding: 18, gap: 12, backgroundColor: soft ? c.brandSoft : c.surface, borderWidth: soft ? 0 : 1, borderColor: c.line }}>
      {children}
    </View>
  );
}

function DayProgress({ block }: { block: number }) {
  const { c } = useMarina();
  return (
    <View accessibilityLabel={`Блок ${block} из 4`} style={{ flexDirection: "row", gap: 7 }}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={{ flex: 1, height: 4, borderRadius: 4, backgroundColor: item <= block ? c.brand : c.line }} />
      ))}
    </View>
  );
}

function PhaseProgress({ current, total }: { current: number; total: number }) {
  const { c } = useMarina();
  return (
    <View accessibilityLabel={`Фаза ${current} из ${total}`} style={{ flexDirection: "row", gap: 5 }}>
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={{ flex: 1, height: 7, borderRadius: 7, backgroundColor: index < current ? c.ink : c.brandSoft }} />
      ))}
    </View>
  );
}

function Shell({ state, title, children, onBack, phase }: { state: Stage0Day1State; title: string; children: React.ReactNode; onBack: () => void; phase?: number }) {
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  const block = state.block === "core" ? 1 : state.block === "guided-variation" ? 2 : state.block === "fluency-mini" ? 3 : 4;
  const visibleBlock = state.mode === "short" ? (state.block === "closing" ? 2 : 1) : block;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 12, gap: 12 }}>
        {state.mode === "full" && <DayProgress block={block} />}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={onBack} hitSlop={8} style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.line, backgroundColor: c.surface }}>
            <Ionicons name="chevron-back" size={21} color={c.ink} />
          </Pressable>
          <Text style={{ flex: 1, fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>{title}</Text>
          <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.muted }}>{visibleBlock} из {state.mode === "full" ? 4 : 2}</Text>
        </View>
        {phase && <PhaseProgress current={phase} total={state.mode === "short" ? 5 : 6} />}
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 28, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Heading({ overline, title, body }: { overline?: string; title: string; body?: string }) {
  const { c } = useMarina();
  return (
    <View style={{ gap: 8 }}>
      {overline && <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 12, letterSpacing: 1, color: c.muted }}>{overline}</Text>}
      <Text style={{ fontFamily: "GolosText_800ExtraBold", fontSize: 29, lineHeight: 34, letterSpacing: -0.5, color: c.ink }}>{title}</Text>
      {body && <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 16, lineHeight: 23, color: c.muted }}>{body}</Text>}
    </View>
  );
}

export default function Stage0Day1Screen() {
  const router = useRouter();
  const { c } = useMarina();
  const insets = useSafeAreaInsets();
  const recorder = useVoiceRecorder();
  const initialState = useRef<Stage0Day1State | null>(loadStage0Day1());
  const [state, setState] = useState<Stage0Day1State | null>(initialState.current);
  const [showPlan, setShowPlan] = useState(() => !initialState.current);
  const [input, setInput] = useState(() => initialState.current?.retrievalDraft ?? "");
  const [productionDraft, setProductionDraft] = useState(() => initialState.current?.productionText ?? "");
  const [guidedDrafts, setGuidedDrafts] = useState<[string, string, string]>(() => [...(initialState.current?.guidedDrafts ?? ["", "", ""])]);
  const [guidedOptionalDraft, setGuidedOptionalDraft] = useState(() => initialState.current?.guidedOptionalDraft ?? "");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [guidedFrameError, setGuidedFrameError] = useState(false);
  const [revealedLine, setRevealedLine] = useState<number | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [showFluencySupports, setShowFluencySupports] = useState(false);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingActive = useRef(false);
  const stopRecorder = useRef(recorder.stop);
  stopRecorder.current = recorder.stop;

  useEffect(() => () => {
    if (recordingTimer.current) clearTimeout(recordingTimer.current);
    if (recordingActive.current) void stopRecorder.current();
  }, []);

  function accept(next: Stage0Day1State | null) {
    if (next) setState(next);
    return next;
  }

  function start(mode: Day1Mode) {
    const next = accept(state ? switchStage0Day1Mode(mode) : startStage0Day1(mode));
    if (next) {
      setProductionDraft(next.productionText);
      setGuidedDrafts([...next.guidedDrafts]);
      setGuidedOptionalDraft(next.guidedOptionalDraft);
      setShowPlan(false);
    }
  }

  function returnToPlan() {
    if (recordingActive.current) {
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
      void stopRecorder.current();
      recordingActive.current = false;
      setVoiceUri(null);
      setVoiceMessage("Запись прервалась. Можно записать ещё раз или продолжить без записи.");
    } else {
      resetVoiceUi();
    }
    setShowPlan(true);
  }

  async function beginRecording() {
    setVoiceUri(null);
    setVoiceMessage(null);
    const ok = await recorder.start();
    if (!ok) {
      setVoiceMessage("Записать сейчас не получится — микрофон недоступен. Скажи фразу вслух и продолжай: запись здесь не обязательна.");
      return;
    }
    recordingActive.current = true;
    setVoiceMessage(null);
    recordingTimer.current = setTimeout(() => void stopRecording(), 60_000);
  }

  function resetVoiceUi() {
    setVoiceUri(null);
    setVoiceMessage(null);
  }

  function resumeBlockName(value: Stage0Day1State) {
    if (value.block === "guided-variation") return "Три фразы по одной рамке";
    if (value.block === "fluency-mini") return "Своя фраза вслух";
    if (value.block === "closing") return "Что стало ближе";
    if (value.corePhase === "text") return "Текст дня";
    if (value.corePhase === "retrieve") return "Вспомни и напиши";
    if (value.corePhase === "produce" || value.corePhase === "voice") return "Своя фраза";
    if (value.corePhase === "summary") return "Резюме";
    return "Четыре фразы на сегодня";
  }

  async function stopRecording() {
    if (recordingTimer.current) clearTimeout(recordingTimer.current);
    recordingTimer.current = null;
    const result = await recorder.stopDetailed();
    recordingActive.current = false;
    setVoiceUri(result.uri);
    setVoiceMessage(result.status === "saved"
      ? null
      : result.status === "empty"
        ? "В этой записи не оказалось звука. Можно записать ещё раз или продолжить без записи."
        : "Эта запись не сохранилась, и вернуть её не получится. Можно записать заново или продолжить без записи.");
  }

  if (showPlan || !state) {
    const existing = state && !state.completed;
    const afterEight = new Date().getHours() >= 20;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 22, paddingBottom: insets.bottom + 28, paddingHorizontal: 24, gap: 18 }}>
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 13, letterSpacing: 1, color: c.muted }}>РАЗГОВОР О РАБОТЕ · 7 ДНЕЙ</Text>
        <Heading title={afterEight && !existing ? "День не начат" : "Что у меня в процессе"} body={afterEight && !existing ? "Он остаётся на месте. Можно пройти его целиком или коротко — как получится." : "К вечеру ты скажешь двумя фразами, над чем работаешь и как идут сроки."} />
        <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 15, color: c.ink }}>Сегодня · {existing && state.mode === "short" ? DAY1_MINUTES.short : DAY1_MINUTES.full} минут</Text>
        {!existing && [
          ["Четыре фразы на сегодня", "Текст дня · Вспомни и напиши · Своя фраза", "16 мин"],
          ["Продолжи про себя: «I’ve been working on …». Три раза — три разных дела.", "", "8 мин"],
          ["Своя фраза вслух", "Попробуй уложиться немного короче — не гонись, просто меньше пауз.", "4 мин"],
          ["Что стало ближе", "", "2 мин"],
        ].map(([title, body, minutes]) => (
          <Card key={title}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, gap: 4 }}><Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>{title}</Text>{body ? <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, lineHeight: 20, color: c.muted }}>{body}</Text> : null}</View>
              <Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 13, color: c.muted }}>{minutes}</Text>
            </View>
          </Card>
        ))}
        {existing && <Card soft><Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 15, lineHeight: 21, color: c.ink }}>Ты остановилась на «{resumeBlockName(state)}». Продолжим оттуда.</Text></Card>}
        <View style={{ marginTop: "auto", gap: 10 }}>
          <PrimaryButton label="Дальше" onPress={() => start(state?.mode ?? "full")} />
          {existing && state.mode === "short"
            ? <QuietButton label="Сегодня · 30 минут" onPress={() => start("full")} />
            : <QuietButton label="Сегодня короче" onPress={() => start("short")} />}
          <Pressable accessibilityRole="button" onPress={() => router.replace("/entry/path-hub")} style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: "GolosText_600SemiBold", color: c.muted }}>Вернуться</Text></Pressable>
        </View>
      </ScrollView>
    );
  }

  if (state.completed) {
    const short = state.completionMode === "short";
    const facts = short ? DAY1_SHORT_FACTS : DAY1_FULL_FACTS;
    return (
      <Shell state={state} title="День 1" onBack={() => router.replace("/entry/path-hub")}>
        <Heading title={short ? "День закрыт коротко" : "День закрыт"} body={short ? "На сегодня достаточно. День сохранён в коротком формате." : "Всё, что было в плане на сегодня, сделано."} />
        <Card>{facts.map((fact) => <Text key={fact} style={{ fontFamily: "GolosText_600SemiBold", fontSize: 16, lineHeight: 23, color: c.ink }}>✓  {fact}</Text>)}</Card>
        <View style={{ marginTop: "auto" }}><PrimaryButton label="Дальше" onPress={() => router.replace("/entry/path-hub")} /></View>
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "prime") {
    return (
      <Shell state={state} title="Сессия дня" phase={1} onBack={returnToPlan}>
        <Heading title="Четыре фразы на сегодня" body="Просто послушай. Заданий здесь нет." />
        {PRIME.map(([en, ru]) => <Card key={en}><View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><View style={{ flex: 1, gap: 6 }}><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 22, color: c.ink }}>{en}</Text><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, color: c.muted }}>{ru}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Прослушать ${en}`} onPress={() => setAudioMessage("Озвучка сейчас недоступна. Текст можно читать — звук вернётся.")} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.line }}><Ionicons name="play" size={18} color={c.ink} /></Pressable></View></Card>)}
        {audioMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{audioMessage}</Text></Card>}
        <PrimaryButton label="Дальше" onPress={() => accept(saveStage0Day1({ corePhase: "text", evidence: { primeSeen: true } }))} />
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "text" && !state.evidence.textRead) {
    return (
      <Shell state={state} title="Сессия дня" phase={2} onBack={returnToPlan}>
        <Heading title="Текст дня" body="Нажми фразу — перевод рядом" />
        <QuietButton label="Прослушать текст" onPress={() => setAudioMessage("Озвучка сейчас недоступна. Текст можно читать — звук вернётся.")} />
        {audioMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{audioMessage}</Text></Card>}
        <Card>{DIALOGUE.map(([line, translation], index) => <Pressable key={line} accessibilityRole="button" accessibilityLabel={`${line}. Показать перевод`} onPress={() => setRevealedLine(revealedLine === index ? null : index)} style={{ minHeight: 44, justifyContent: "center", gap: 4 }}><Text style={{ fontFamily: "Lora_400Regular", fontSize: 18, lineHeight: 27, color: c.ink }}>{line}</Text>{revealedLine === index && <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.muted }}>{translation}</Text>}</Pressable>)}</Card>
        <PrimaryButton label="Дальше" onPress={() => accept(markStage0Day1TextRead())} />
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "text" && state.comprehension === "shown") {
    return (
      <Shell state={state} title="Сессия дня" phase={2} onBack={returnToPlan}>
        <Heading title="О чём договорились в конце разговора?" body="Посмотри ещё раз на последние две реплики." />
        <Card soft>{DIALOGUE.slice(-2).map(([line, translation]) => <View key={line} style={{ gap: 4 }}><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 18, lineHeight: 27, color: c.ink }}>{line}</Text><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.muted }}>{translation}</Text></View>)}</Card>
        <PrimaryButton label="Дальше" onPress={() => accept(continueStage0Day1AfterComprehension())} />
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "text") {
    const retry = state.comprehension === "retry";
    return (
      <Shell state={state} title="Сессия дня" phase={2} onBack={returnToPlan}>
        <Heading title="О чём договорились в конце разговора?" body={retry ? "Посмотри ещё раз на последние две реплики." : undefined} />
        {["прислать записку до созвона", "отменить проект", "нанять человека"].map((choice, index) => <QuietButton key={choice} label={choice} onPress={() => accept(answerStage0Day1Comprehension(index === 0))} />)}
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "retrieve") {
    const index = Math.min(state.evidence.retrievalsCompleted, (state.mode === "short" ? 1 : 3) - 1);
    const item = RETRIEVALS[index];
    const support = state.retrievalSupportLevel;
    const correct = normalize(input) === normalize(item.answer) || normalize(input).startsWith(normalize(item.answer).replace(" flow", ""));
    function submit() {
      if (!correct) {
        const next = saveStage0Day1({ retrievalDraft: input, retrievalSupportLevel: Math.min(3, support + 1) as 0 | 1 | 2 | 3 });
        if (next) {
          accept(next);
          setSaveMessage(null);
        } else {
          setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз.");
        }
        return;
      }
      const next = submitStage0Day1Retrieval(input);
      if (!next) {
        setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз.");
        return;
      }
      accept(next);
      setSaveMessage(null);
      setInput(next.retrievalDraft);
    }
    return (
      <Shell state={state} title="Сессия дня" phase={3} onBack={returnToPlan}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><Text style={{ flex: 1, fontFamily: "GolosText_700Bold", fontSize: 12, letterSpacing: 1, color: c.muted }}>ВСПОМНИ И НАПИШИ</Text>{state.mode === "full" && <View style={{ height: 24, borderRadius: 999, paddingHorizontal: 10, justifyContent: "center", backgroundColor: "#EFE7D7" }}><Text style={{ fontFamily: "GolosText_700Bold", fontSize: 12, color: c.muted }}>{index + 1} из 3</Text></View>}</View>
        <Heading title={item.prompt} body="Автоисправление выключено" />
        {support >= 1 && <Card soft><Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 15, color: c.ink }}>Подсказка — первая буква</Text><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 17, color: c.ink }}>{item.first}</Text></Card>}
        {support >= 2 && <Card><Text style={{ fontFamily: "GolosText_600SemiBold", fontSize: 15, color: c.ink }}>Подсказка — выбери из трёх</Text>{item.choices.map((choice) => <Pressable key={choice} accessibilityRole="button" accessibilityLabel={choice} onPress={() => setInput(choice)} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 16, color: c.ink }}>{choice}</Text></Pressable>)}</Card>}
        {support >= 3 && <Card soft><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 18, color: c.ink }}>{item.answer}</Text><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted }}>Перепечатай своими руками — так запоминается.</Text></Card>}
        <TextInput accessibilityLabel="Ответ по-английски" value={input} onChangeText={(value) => { setInput(value); const next = saveStage0Day1({ retrievalDraft: value }); if (next) setSaveMessage(null); else setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз."); }} autoCapitalize="none" autoCorrect={false} placeholder="Ответ по-английски" placeholderTextColor={c.muted} style={{ minHeight: 58, borderRadius: 16, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, paddingHorizontal: 16, fontFamily: "Lora_600SemiBold", fontSize: 18, color: c.ink }} />
        {saveMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{saveMessage}</Text><QuietButton label="Попробуй ещё раз" onPress={submit} /></Card>}
        <PrimaryButton label="Проверить" disabled={!input.trim()} onPress={submit} />
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "produce") {
    return (
      <Shell state={state} title="Сессия дня" phase={4} onBack={returnToPlan}>
        <Heading overline="СВОЯ ФРАЗА" title="Над чем ты работаешь прямо сейчас — на работе или дома? Две-три фразы." />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{SUPPORTS.map((label) => <View key={label} accessible accessibilityLabel={label} style={{ minHeight: 44, justifyContent: "center", borderRadius: 999, paddingHorizontal: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }}><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 14, color: c.ink }}>{label}</Text></View>)}</View>
        <Text style={{ fontFamily: "GolosText_400Regular", fontSize: 14, color: c.muted }}>Пока ты пишешь, никто не подсказывает и не поправляет.</Text>
        <TextInput accessibilityLabel="Своя фраза по-английски" value={productionDraft} onChangeText={(value) => { setProductionDraft(value); const next = saveStage0Day1({ productionText: value }); if (next) setSaveMessage(null); else setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз."); }} multiline autoCapitalize="sentences" autoCorrect={false} placeholder="Напиши по-английски…" placeholderTextColor={c.muted} style={{ minHeight: 190, textAlignVertical: "top", borderRadius: 18, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, padding: 16, fontFamily: "Lora_400Regular", fontSize: 18, lineHeight: 27, color: c.ink }} />
        {saveMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{saveMessage}</Text><QuietButton label="Попробуй ещё раз" onPress={() => { const next = saveStage0Day1({ productionText: productionDraft }); if (next) { accept(next); setSaveMessage(null); } }} /></Card>}
        <PrimaryButton label="Готово" disabled={!productionDraft.trim()} onPress={() => { const next = accept(submitStage0Day1Production(productionDraft)); if (!next) { setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз."); return; } setSaveMessage(null); if (next.mode === "short") accept(finishStage0Day1Core()); }} />
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "voice") {
    return (
      <Shell state={state} title="Сессия дня" phase={5} onBack={returnToPlan}>
        <Heading title="Теперь скажи её вслух — по желанию" body="Запись — только твоя. Её никто не слушает и не оценивает." />
        <Card soft><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 20, lineHeight: 29, color: c.ink }}>{state.productionText}</Text></Card>
        {voiceUri && <QuietButton label="Прослушать запись" onPress={() => void playRecording(voiceUri)} />}
        {voiceMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{voiceMessage}</Text></Card>}
        <PrimaryButton label={recorder.recording ? "Остановить" : "Записать"} onPress={() => recorder.recording ? void stopRecording() : void beginRecording()} />
        {!recorder.recording && !voiceUri && <QuietButton label="Дальше без записи" onPress={() => { resetVoiceUi(); accept(saveStage0Day1({ corePhase: "summary" })); }} />}
        {voiceUri && <QuietButton label="Дальше" onPress={() => { resetVoiceUi(); accept(saveStage0Day1({ corePhase: "summary" })); }} />}
      </Shell>
    );
  }

  if (state.block === "core" && state.corePhase === "summary") {
    return (
      <Shell state={state} title="Сессия дня" phase={6} onBack={returnToPlan}>
        <Heading title="Резюме сейчас не собралось." body="Твой текст сохранён — можно попробовать ещё раз." />
        <Card><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 20, lineHeight: 29, color: c.ink }}>{state.productionText}</Text></Card>
        <PrimaryButton label="Дальше" onPress={() => { resetVoiceUi(); accept(finishStage0Day1Core()); }} />
      </Shell>
    );
  }

  if (state.block === "guided-variation") {
    const slot = state.currentGuidedSlot;
    if (state.evidence.guidedSubmitted) {
      const optionalFrameError = guidedFrameError && !!guidedOptionalDraft.trim();
      return (
        <Shell state={state} title="Три фразы по одной рамке" onBack={returnToPlan}>
          <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>Понятно. В речи встречается и «I've been busy with…» — это другой оборот; сегодняшняя рамка — «I've been working on…».</Text></Card>
          <Heading title="Если хочешь — сделай вторую версию. Не хочешь — задание уже сделано." />
          <TextInput accessibilityLabel="Опциональная вторая версия по рамке I've been working on" value={guidedOptionalDraft} onChangeText={(value) => { setGuidedOptionalDraft(value); setGuidedFrameError(false); const next = saveStage0Day1({ guidedOptionalDraft: value }); if (next) setSaveMessage(null); else setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз."); }} multiline autoCorrect={false} autoCapitalize="sentences" placeholder="I've been working on…" placeholderTextColor={c.muted} style={{ minHeight: 120, textAlignVertical: "top", borderRadius: 18, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, padding: 16, fontFamily: "Lora_400Regular", fontSize: 18, lineHeight: 27, color: c.ink }} />
          {optionalFrameError && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>Рамка чуть съехала — верни «I've been …».</Text></Card>}
          {saveMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{saveMessage}</Text><QuietButton label="Попробуй ещё раз" onPress={() => { const next = saveStage0Day1({ guidedOptionalDraft }); if (next) { accept(next); setSaveMessage(null); } }} /></Card>}
          <PrimaryButton label="Дальше" onPress={() => { if (guidedOptionalDraft.trim() && !isStage0Day1GuidedAnswer(guidedOptionalDraft)) { setGuidedFrameError(true); return; } const next = continueStage0Day1AfterGuidedVariation(guidedOptionalDraft); if (next) { accept(next); setSaveMessage(null); } else setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз."); }} />
        </Shell>
      );
    }
    return (
      <Shell state={state} title="Три фразы по одной рамке" onBack={returnToPlan}>
        <Heading overline={`${slot + 1} ИЗ 3`} title="I've been working on …" body="Продолжи про себя: «I've been working on …». Три раза — три разных дела." />
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>{[0, 1, 2].map((index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Фраза ${index + 1} из 3`} onPress={() => accept(saveStage0Day1({ currentGuidedSlot: index as 0 | 1 | 2 }))} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: index === slot ? c.brand : c.line, backgroundColor: c.surface }}><Text style={{ fontFamily: "GolosText_700Bold", color: c.ink }}>{index + 1}</Text></Pressable>)}</View>
        <TextInput accessibilityLabel={`Фраза ${slot + 1} по рамке I've been working on`} value={guidedDrafts[slot]} onChangeText={(value) => { const nextDrafts: [string, string, string] = [...guidedDrafts]; nextDrafts[slot] = value; setGuidedDrafts(nextDrafts); setGuidedFrameError(false); const next = saveStage0Day1GuidedSlot(slot, value); if (next) setSaveMessage(null); else setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз."); }} multiline autoCorrect={false} autoCapitalize="sentences" placeholder="I've been working on…" placeholderTextColor={c.muted} style={{ minHeight: 150, textAlignVertical: "top", borderRadius: 18, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, padding: 16, fontFamily: "Lora_400Regular", fontSize: 18, lineHeight: 27, color: c.ink }} />
        {guidedFrameError && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>Рамка чуть съехала — верни «I've been …».</Text></Card>}
        {saveMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{saveMessage}</Text><QuietButton label="Попробуй ещё раз" onPress={() => { const next = saveStage0Day1GuidedSlot(slot, guidedDrafts[slot]); if (next) { accept(next); setSaveMessage(null); } }} /></Card>}
        <PrimaryButton label={slot === 2 ? "Отправить" : "Дальше"} disabled={!guidedDrafts[slot].trim()} onPress={() => { if (slot < 2) { accept(saveStage0Day1({ currentGuidedSlot: (slot + 1) as 1 | 2 })); return; } if (!areStage0Day1GuidedAnswersValid(guidedDrafts)) { setGuidedFrameError(true); return; } const next = submitStage0Day1GuidedVariation(); if (next) { accept(next); setSaveMessage(null); } else setSaveMessage("Не сохранилось. Всё, что ты написала, — на экране. Попробуй ещё раз."); }} />
        <QuietButton label="Пропустить это задание" onPress={() => accept(skipStage0Day1GuidedVariation())} />
      </Shell>
    );
  }

  if (state.block === "fluency-mini") {
    const version = state.currentFluencyVersion;
    return (
      <Shell state={state} title="Своя фраза вслух" onBack={returnToPlan}>
        <Heading title="Своя фраза вслух" body={version === 1 ? "Попробуй уложиться немного короче — не гонись, просто меньше пауз." : undefined} />
        {(version === 0 || showFluencySupports) && <Card soft><Text style={{ fontFamily: "Lora_600SemiBold", fontSize: 20, lineHeight: 29, color: c.ink }}>{state.productionText}</Text></Card>}
        {voiceUri && <QuietButton label="Прослушать запись" onPress={() => void playRecording(voiceUri)} />}
        {voiceMessage && <Card soft><Text style={{ fontFamily: "GolosText_400Regular", fontSize: 15, lineHeight: 22, color: c.ink }}>{voiceMessage}</Text></Card>}
        <PrimaryButton label={recorder.recording ? "Остановить" : "Записать"} onPress={() => recorder.recording ? void stopRecording() : void beginRecording()} />
        {!recorder.recording && !voiceUri && <QuietButton label="Сказано вслух — дальше" onPress={() => { resetVoiceUi(); setShowFluencySupports(false); accept(confirmStage0Day1FluencyVersion("said-aloud-confirmed")); }} />}
        {!recorder.recording && voiceUri && <QuietButton label="Дальше" onPress={() => { resetVoiceUi(); setShowFluencySupports(false); accept(confirmStage0Day1FluencyVersion("recorded")); }} />}
        {version === 1 && <QuietButton label="Вернуться к опорам" onPress={() => setShowFluencySupports(true)} />}
      </Shell>
    );
  }

  return (
    <Shell state={state} title="Закрытие дня" onBack={returnToPlan}>
      <Heading title={state.mode === "short" ? "День закрыт коротко" : "Что стало ближе"} />
      <Card>{(state.mode === "short" ? DAY1_SHORT_FACTS : DAY1_FULL_FACTS).map((fact) => <Text key={fact} style={{ fontFamily: "GolosText_600SemiBold", fontSize: 16, lineHeight: 23, color: c.ink }}>{fact}</Text>)}</Card>
      <PrimaryButton label="Дальше" onPress={() => { const next = accept(completeStage0Day1()); if (next?.completed) router.replace("/entry/path-hub"); }} />
    </Shell>
  );
}
