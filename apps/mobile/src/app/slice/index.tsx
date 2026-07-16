import { Share, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  useSliceState,
  needsRecovery,
  assessmentAvailable,
  sliceProgress,
  exportSliceData,
  SLICE_TOTAL_SESSIONS,
} from "@ie/core/slice";
import { useMarina } from "@/theme";
import { SliceScreen, SliceCard, SliceBtn, SliceNote } from "@/components/slice-ui";

// Хаб пилота Vertical Slice v1: показывает ровно один следующий шаг.
// Прогресс — только процесс и task-performance (спека §10): никаких
// «способностей», уровней и стриков.

export default function SliceHub() {
  const router = useRouter();
  const s = useSliceState();
  const pr = sliceProgress();

  const entryDone = Boolean(s.entry);
  const pretestDone = Boolean(s.pretestAt);
  const sessionsLeft = pretestDone && s.sessionsCompleted < SLICE_TOTAL_SESSIONS;
  const recovery = needsRecovery();
  const assessOpen = assessmentAvailable();
  const contextLeft = Boolean(s.assessAt) && !s.newContextAt;
  const finished = Boolean(s.newContextAt);

  return (
    <SliceScreen title="Пилот · Vertical Slice">
      <SliceNote text="Одна задача: ответить на «So what have you been working on lately?». 22 единицы · 14 сессий · претест и отложенный тест. Данные хранятся на этом устройстве." />

      {!entryDone && (
        <SliceCard>
          <Title text="Шаг 1 · Вход в пилот" />
          <SliceNote text="Пять наблюдаемых признаков профиля — заполняется на разговоре с Галиной." />
          <SliceBtn label="Заполнить вход" onPress={() => router.push("/slice/entry")} />
        </SliceCard>
      )}

      {entryDone && !pretestDone && (
        <SliceCard>
          <Title text="Шаг 2 · Претест" />
          <SliceNote text="22 единицы: русский смысл → напиши английскую форму. Без подсказок и без ответов — это базовая линия, не урок. «Не помню» — честная кнопка." />
          <SliceBtn label="Начать претест" onPress={() => router.push("/slice/pretest")} />
        </SliceCard>
      )}

      {pretestDone && sessionsLeft && recovery && (
        <SliceCard tone="soft">
          <Title text="Вернуться с 5 минут" />
          <SliceNote text="Был перерыв — это пауза, не потеря. Короткий возврат: несколько единиц и одна твоя фраза. Считается полноценной сессией." />
          <SliceBtn
            label="Вернуться с 5 минут"
            onPress={() => router.push({ pathname: "/slice/session", params: { mode: "recovery" } })}
          />
        </SliceCard>
      )}

      {pretestDone && sessionsLeft && (
        <SliceCard>
          <Title text={`Сессия ${Math.min(s.sessionsCompleted + 1, SLICE_TOTAL_SESSIONS)} из ${SLICE_TOTAL_SESSIONS}`} />
          <SliceNote
            text={
              s.introDone < 5
                ? "Новые единицы дня: текст → извлечение → твой ответ → вслух."
                : "Возврат и производство: то, что уже вводили, — в твою речь."
            }
          />
          <SliceBtn label="Начать сессию" onPress={() => router.push("/slice/session")} />
        </SliceCard>
      )}

      {assessOpen && (
        <SliceCard tone="soft">
          <Title text="Отложенный тест открыт" />
          <SliceNote text="Прошло 14 дней с претеста. Те же 22 единицы, тот же порядок — сравним с базовой линией." />
          <SliceBtn label="Пройти тест" onPress={() => router.push("/slice/assess")} />
        </SliceCard>
      )}

      {contextLeft && (
        <SliceCard tone="soft">
          <Title text="Последний шаг · Новый контекст" />
          <SliceNote text="Один новый вопрос, на котором мы не тренировались." />
          <SliceBtn
            label="Ответить"
            onPress={() => router.push({ pathname: "/slice/assess", params: { phase: "context" } })}
          />
        </SliceCard>
      )}

      {finished && (
        <SliceCard tone="soft">
          <Title text="Пилот завершён" />
          <SliceNote text="Спасибо. Выгрузи данные кнопкой ниже и отправь Галине." />
        </SliceCard>
      )}

      {pretestDone && (
        <SliceCard>
          <Title text="Как идёт" />
          <Fact label={`Сессия ${pr.sessionsCompleted} из ${pr.totalSessions}`} />
          {pr.todayTotal > 0 && (
            <Fact label={`Сегодня ${pr.todayOk} из ${pr.todayTotal} достались без подсказки`} />
          )}
          {pr.voiceCount > 0 && <Fact label={`${pr.voiceCount} голосовых записей — твои, приватные`} />}
          {pr.frameUses > 0 && (
            <Fact label={`«I've been…» появилось в твоих написанных ответах: ${pr.frameUses}`} />
          )}
          {pr.insufficientCount > 0 && (
            <Fact label={`По ${pr.insufficientCount} единицам данных пока мало`} />
          )}
          <SliceNote text="Это факты процесса, не оценка умения говорить: устную речь мы в пилоте не измеряем." />
        </SliceCard>
      )}

      {entryDone && (
        <SliceBtn
          kind="ghost"
          label="Выгрузить данные пилота (JSON)"
          onPress={() => {
            void Share.share({ message: exportSliceData() });
          }}
        />
      )}
    </SliceScreen>
  );
}

function Title({ text }: { text: string }) {
  const { c } = useMarina();
  return <Text style={{ fontFamily: "GolosText_700Bold", fontSize: 17, color: c.ink }}>{text}</Text>;
}

function Fact({ label }: { label: string }) {
  const { c } = useMarina();
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
      <Text style={{ fontFamily: "GolosText_500Medium", fontSize: 14, color: c.ink, flex: 1 }}>
        {label}
      </Text>
    </View>
  );
}
