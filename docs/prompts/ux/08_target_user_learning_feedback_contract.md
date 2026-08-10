# Claude Opus task — target-user learning-feedback contract

Work in `YGalina/Entensive-English`, branch `codex/target-user-feedback-gate`.

Act as Principal Learning Feedback Architect with expertise in adult SLA, instructed second-language production, assessment validity, corrective feedback, deterministic NLP evaluation and AI-tutor safety.

This is a bounded contract correction. Do not create visual design, application code, new curriculum activities, scores, levels, speech analysis or motivational gamification. Do not reopen frozen architecture.

Read completely:

- `PRODUCT_CONSTITUTION.md`
- `docs/qa/TARGET_USER_DAY1_FEEDBACK_2026-08-10.md`
- `docs/ux/stage0/STAGE0_LEARNING_EXPERIENCE_CONTRACT.md`
- `docs/ux/stage0/STAGE0_SCREEN_AND_STATE_MAP.md`
- `docs/ux/stage0/STAGE0_COPY_INVENTORY.md`
- `docs/ux/stage0/STAGE0_DAY1_IMPLEMENTATION_DECISIONS.md`
- `docs/methodology/stage0_work_conversation_v1/DAY_01.md`
- `packages/core/feedback.ts`
- `packages/core/stage0Day1.ts`
- `apps/mobile/src/app/entry/stage0-day1.tsx`
- `packages/core/evals/run-s14-baseline.ts`

## Confirmed target-user problems

1. Structured retrieval currently behaves like string equality. Natural answers were rejected:
   - `I've been working on a new onboarding lately.`
   - `We have to meet the deadline.`
   - `I came up with a way to remove one step.`
2. The learner cannot tell whether the meaning was wrong or whether she merely used a valid alternative instead of today's target form.
3. Free production `I working on launch new product. I should meet deadline next month.` received generic on-topic feedback and no actionable correction.
4. Absence of a detected error must never be presented as proof of correctness.
5. Voice is not analysed and must remain outside this contract.

## Required decisions

For each of the three Day 1 retrieval items, define:

- the learning target;
- meaning requirements;
- required target-form features, if any;
- acceptable grammatical/lexical variation;
- three outcome classes: `target-retrieved`, `meaning-correct-alternative`, `incorrect-or-insufficient`;
- the smallest truthful learner feedback and next action for each class;
- how graduated support changes after each class.

For free written production, define:

- what the current deterministic checker may claim;
- which high-value error classes must be added for this Day 1 task;
- when to give one or at most two self-correction prompts;
- when to say that automatic checking could not assess a part;
- how a corrected attempt is re-evaluated;
- what must never be inferred from no detected rule, topic match or target-frame presence.

Decide whether the initial implementation should remain deterministic, use a bounded LLM evaluator, or use a staged hybrid. If an LLM is proposed, specify privacy boundary, structured output schema, timeout/failure behavior, prompt-injection boundary, human-labelled baseline and non-regression requirements. Do not make an LLM call a release dependency unless the evidence supports it.

## Evaluation requirement

Create a versioned benchmark specification containing:

- the five mandatory examples from `TARGET_USER_DAY1_FEEDBACK_2026-08-10.md`;
- at least 12 additional positive, acceptable-alternative, incorrect, ambiguous and adversarial examples;
- expected classification and allowed feedback for every example;
- false-rejection and false-acceptance guardrails;
- a separate measure for feedback usefulness/truthfulness;
- explicit pass criteria for implementation and future model changes.

The benchmark evaluates the product evaluator; one LLM's prose opinion is not acceptance evidence.

## Output

Create only:

- `docs/ux/stage0/STAGE0_DAY1_FEEDBACK_CONTRACT.md`
- `docs/evals/stage0_day1_feedback_v1/README.md`
- `docs/evals/stage0_day1_feedback_v1/cases.json`

Every learner-facing Russian string must be final or explicitly marked `OWNER-RATIFICATION-REQUIRED`. Do not edit existing governing documents in this pass. Do not commit or push. Stop for Codex inspection and owner decisions.
