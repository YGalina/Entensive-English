# Модель учебного объекта (LearningObject)

Дата: 2026-07-13 · (TASK 6) Единая модель, хранящая любой тип единицы и её направленный статус. Расширяет, не ломает текущие srs.ts/output.ts/data.

## Тип единицы
```
kind: "word" | "lemma" | "phrase" | "collocation" | "phrasal_verb"
    | "grammar_pattern" | "pronunciation_feature" | "discourse_move"
```

## LearningObject (концептуальная схема)
```ts
type LearningObject = {
  id: string;
  kind: LOKind;
  // лексема/форма
  surface: string;            // "figure out", "make a decision", "present perfect"
  lemma?: string;             // канон. форма
  ipa?: string;
  gloss: Record<Lang, string>; // перевод по L1 (ru/ar/de/...)
  // источник
  sourceContext?: {           // ГДЕ встречен — «биография»
    kind: "film"|"book"|"podcast"|"article"|"user_link"|"pack"|"club";
    ref: string; excerpt?: string;
  }[];
  cefr?: { level: Level; relevance: "core"|"useful"|"advanced" };
  l1Trap?: string;            // калька-ловушка ("делать решение") для коллокаций
  // ЗНАНИЕ УЧЕНИКА — направленно (ключевой инвариант методики)
  familiarity: number;        // 0..1 субъективная встреченность
  receptive: DirState;        // форма→смысл
  productive: DirState;       // смысл→форма (главная цель)
  retrievalMs?: number;       // скорость извлечения (автоматизация — 19 T5)
  errorHistory: ErrEvent[];   // что путала (L1-калька, время, particle)
  contextsUsed: string[];     // в каких реальных контекстах употреблён
  transferEvidence: string[]; // id артефактов/срезов, где всплыл на НОВОМ
  // планирование
  nextReview: { recognize?: number; produce?: number }; // FSRS, раздельно
  status: "new" | "recog" | "mine"; // производный ярлык (mine = после вывода)
  createdAt: number; touchedAt: number;
};

type DirState = {
  reps: number; stability: number; difficulty: number;
  lastResult?: "again"|"hard"|"good"; noticed: number; // ноутинг «в дикой природе»
};
type ErrEvent = { at: number; type: "l1_calque"|"tense"|"particle"|"synonym_swap"|"other"; note?: string };
```

## Поля брифа → где в модели
| Требование | Поле |
|---|---|
| word/lemma/phrase/collocation/phrasal/grammar/pronunciation/discourse | `kind` + `surface`/`lemma` |
| source context | `sourceContext[]` |
| learner familiarity | `familiarity` |
| receptive status | `receptive: DirState` |
| productive status | `productive: DirState` |
| retrieval speed | `retrievalMs` |
| error history | `errorHistory[]` |
| contexts used | `contextsUsed[]` |
| CEFR relevance | `cefr` |
| next review | `nextReview{recognize,produce}` |
| transfer evidence | `transferEvidence[]` |

## Почему так (методика)
- **Направленность** (`receptive` vs `productive` раздельно) — прямое требование [R]: извлечение специфично направлению; продукция — отдельная цель, не следствие узнавания.
- **`retrievalMs`** — автоматизм = скорость+стабильность [R Segalowitz]; без него нельзя увидеть T4→T5.
- **`l1Trap`+`errorHistory.l1_calque/synonym_swap`** — механизм фразеологического разрыва [R gap §7]: калька и синонимическое смешение.
- **`transferEvidence`** — competence = перенос на новое, не «прошёл экран» [R].
- **`sourceContext`** — «биография слова» [F/UX любимое] + персонализация кодирования [H].
- **`status: mine`** только после вывода — «моим слово становится после того, как сказала вслух».

## Миграция с текущей модели (НЕ ломать разом)
| Сейчас | Куда |
|---|---|
| `data/packs.ts` `Word{en,ipa,def,exEn,tr}` | контентная часть LearningObject (surface/ipa/gloss/sourceContext); + `kind`, `l1Trap` |
| `srs.ts` `Card` recognize + produce ключи | `receptive`/`productive: DirState` + `nextReview` |
| `srs.ts` `noticed`, VocabState new/recog/mine | `DirState.noticed`, `status` |
| `output.ts` OutputArtifact `words[]` | связь артефакт→`contextsUsed`/`transferEvidence` |
| `assess.ts`/checkup | пишет в `transferEvidence` |
Подход: LearningObject — вью-агрегат поверх существующих сторов (srs/output/data), затем постепенно поднять в БД-схему (Drizzle, Фаза C уже заложена). Единица контента должна стать **chunk-, а не слово-центричной** (главный конфликт легаси: packs.ts кормит одиночными словами).

## Открытое [U]
- Частотные chunk/коллокации/фразовые с L1-ловушками — нужен контент-конвейер (не написан).
- Порог `retrievalMs`, при котором считаем «автоматизировано» — [U] (open_questions).
