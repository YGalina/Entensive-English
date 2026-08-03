# Fable correction — owner physical-device feedback · v1

Open `YGalina/Entensive-English`, branch `codex/stage0-day1-vertical-slice`.

Read the governing files first:

- `.ai/AI_PROJECT.md`
- `.ai/AI_RULES.md`
- `docs/governance/DEVELOPMENT_CONSTITUTION.md`
- `docs/qa/CLAUDE_MULTI_AGENT_UIUX_QA_STAGE0_DAY1_V1.md`
- `docs/ux/stage0/STAGE0_LEARNING_EXPERIENCE_CONTRACT.md`
- `docs/ux/stage0/STAGE0_SCREEN_AND_STATE_MAP.md`
- `docs/ux/stage0/STAGE0_COPY_INVENTORY.md`
- `docs/ux/stage0/STAGE0_DAY1_IMPLEMENTATION_DECISIONS.md`
- `docs/design/exports/batch-a-defaults-final/`
- `docs/design/exports/batch-c-correction-v1/`
- `docs/design/exports/stage0-day1-v1/`

## Role boundary

You are Fable / Claude Design, the visual design authority for Intensive English.

This is a narrow physical-device correction pass. Preserve Living Content, the accepted visual language, approved navigation, learning mechanics and all unaffected screens. Do not redesign the product. Do not edit application code. Do not replace the established style.

Produce only the four corrections below and stop for owner visual approval.

## 1. S7 baseline completion transition

Problem observed on a physical Android device: after the 28th Russian→English baseline response, the learner receives no closure or explanation and is moved into practice. Per-item correctness must remain hidden because this is a baseline; do not reveal answers, scores, levels, percentages or a list of mistakes.

Add one completion state after the final response and before the first practice:

- title: `Стартовая точка сохранена.`
- body: `Здесь не было оценки. Ответы нужны, чтобы практика началась с того, что пока не вспоминается.`
- transition line: `Теперь — первая тренировка.`
- one dominant CTA: `Начать тренировку`

The state must feel like closure and orientation, not praise, failure, an exam result or a dashboard. Keep the existing S7 visual language.

## 2. Stage 0 text-entry states with the real keyboard open

Problem observed on a physical Android device: typed text is not reliably visible and the keyboard closes while the learner is entering an answer.

Create corrected keyboard-open references for:

- retrieval: `Вспомни и напиши`;
- free production: `Своя фраза`;
- guided variation: `Три фразы по одной рамке`.

Requirements:

- Android reference viewport: 360 × 800;
- also verify the accepted 390 × 844 reference;
- the active field and typed text remain visible above the keyboard;
- the keyboard does not visually imply dismissal after each character;
- the current prompt remains understandable;
- the primary action remains reachable by normal scrolling, not necessarily simultaneously pinned above the keyboard;
- no reduced touch targets and no new compact visual language;
- reuse the accepted Batch C keyboard ergonomics and Stage 0 Day 1 styling.

The engineering focus/persistence correction already exists. Your task is only to provide the canonical responsive visual references.

## 3. S14 real post-production feedback

Problem observed on a physical Android device: after the learner writes and says her own phrase, there is no useful response about whether she completed the task or what to improve. The implementation currently always shows the unavailable state.

Reuse the frozen Batch C S14 composition. Do not invent a new summary screen and do not use a binary `правильно / неправильно` verdict for free production.

Create these S14 states:

### A. Task achieved / target frame present

- acknowledgement: `Задание выполнено: ты сказала, над чем работаешь сейчас.`
- show the learner’s written phrase;
- show up to two natural alternatives in the existing `ЕЩЁ ТАК ГОВОРЯТ` section;
- show the contextual grammar note in the existing grammar card;
- disclosure: `Это автоматическая проверка написанного текста. Голосовая запись не анализировалась.`

### B. On-topic answer, target frame absent

- acknowledgement: `Ты ответила по теме.`
- one self-correction invitation: `Попробуй ещё одну версию с рамкой дня: I’ve been working on…`
- preserve the learner’s original phrase; never silently rewrite it;
- keep alternatives, contextual grammar and the same disclosure.

### C. One or two detectable language issues

- use the existing gentle self-correction pattern, maximum two prompts;
- no red error styling, score, CEFR or exhaustive correction;
- after the prompts, offer `Попробовать ещё раз` and a quiet `Оставить как есть`;
- the learner’s original text remains visible and saved.

### D. Summary unavailable / retry

- retain the approved unavailable copy and add the missing real action `Попробовать ещё раз`;
- retain a non-blocking `Дальше` action;
- never claim that analysis happened when it did not.

Voice correctness is out of scope: no pronunciation or speech-content claim is allowed until a separate speech-analysis pipeline exists.

## 4. S3 three-answer responsive state

Problem observed on a physical Android device: all three equal answers are not simultaneously understandable/reachable on some screens.

Create a responsive correction for the existing S3 question screen:

- preserve three equal full-width vertical choices;
- verify 360 × 800 and large system text up to 200%;
- every choice remains reachable by obvious vertical scrolling;
- no horizontal three-button row;
- do not reduce the 60 px default touch height or the 44 px accessibility minimum;
- the third option `Не могу оценить` must not look secondary or hidden;
- preserve the accepted question, context card, typography, colors and one-question-per-screen flow.

## Deliverables

Save the correction package under:

`docs/design/exports/stage0-owner-device-correction-v1/`

Include:

- one review board;
- individual screen HTML exports;
- a short state/copy inventory;
- a short implementation handoff with viewport and keyboard behavior annotations.

Do not alter any existing accepted export. Do not create code. Stop after the four corrections for owner visual approval.

