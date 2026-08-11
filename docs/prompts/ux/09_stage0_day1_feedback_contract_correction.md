# Claude Opus correction — Stage 0 Day 1 feedback contract · v1 → v1.1

Work in `YGalina/Entensive-English`, branch `codex/target-user-feedback-gate`.

Read:

- `docs/prompts/ux/08_target_user_learning_feedback_contract.md`
- `docs/ux/stage0/STAGE0_DAY1_FEEDBACK_CONTRACT.md`
- `docs/evals/stage0_day1_feedback_v1/README.md`
- `docs/evals/stage0_day1_feedback_v1/cases.json`
- `docs/qa/TARGET_USER_DAY1_FEEDBACK_2026-08-10.md`
- `packages/core/feedback.ts`

This is a bounded correction after Codex inspection. Do not create code, visual design or additional project documents. Update only the same three deliverables. Do not commit or push.

## Required corrections

### 1. Resolve support-ladder contradictions

The current general table says every `incorrect-or-insufficient` outcome advances support, while `too-short` later says support does not advance and `not-assessable` has no safe rule.

Define behavior by reason:

- `meaning-mismatch` and `form-incomplete`: advance exactly one support step;
- `too-short`: keep support unchanged and return to input;
- `not-assessable`: keep support unchanged; a system/parser failure must never be treated as learner failure.

Make the contract, copy table, README and cases agree.

### 2. Remove the article-rule false positive

`onboarding` cannot be treated as universally countable: `I work on onboarding` / `I've been working on onboarding` can be natural when it names the process. This also contradicts R1, which explicitly allows no article.

Remove `onboarding` from the blanket `article-missing` trigger. Define a narrow lexical/context rule for genuinely countable nouns and add negative regression cases that must not receive an article hint.

### 3. Make `verb-chain` match its own examples

The stated trigger covers modal + `-s`/`-ed`, but the example `should met` contains an irregular form and would not match. Define the actual finite/irregular forms covered, include `should met`, and add at least one valid modal + base-form negative case.

### 4. Correct retry evaluation

Delete the rule that a retry may inspect only changed spans. It hides real unchanged errors that were suppressed by the two-hint limit; in the confirmed M4 example, `meet deadline` could then remain permanently invisible.

Use deterministic stable priority over the complete text on every attempt. Previously corrected hints disappear; remaining genuine hints may appear in the next pass. Add honest copy for this case (for example, that one more place remains) without implying that earlier feedback was complete. Add a regression case with three genuine issues where the third appears only after the first two are corrected.

### 5. Do not suppress a reliable hint merely because text is short

`I working.` currently becomes `not-assessable` solely because it has fewer than three words, even though `aux-missing` is a high-confidence match. Apply high-confidence deterministic rules before the length fallback. Use `not-assessable` only when no reliable rule can be applied or the input truly cannot be parsed. Update A18 accordingly.

### 6. Tighten R1 ongoing meaning

Do not list bare `I've worked on the new onboarding.` as an automatically meaning-correct equivalent of ongoing `последнее время я работаю`. Present Perfect Simple without an ongoing cue can describe completed experience. Either require an explicit ongoing/recent cue (`lately`, `this week`, `still`, a duration) or classify the bare form conservatively. Add cases for both the cued and uncued form.

### 7. Tighten R3 meaning requirements

`an idea` or `a way` alone is not sufficient. Acceptance still requires the meaning of removing/cutting one step. Make the feature contract explicit so lexical overlap cannot accept `I came up with an idea` by itself.

### 8. Correct learner copy modality and density

- Structured retrieval is typed in this implementation: change `C-FB-SHORT` from `скажи её целиком` to `напиши фразу целиком` or another accurate typed-action phrase.
- Repeating the full `C-FB-SCOPE` paragraph after every one of three answers risks recreating the already confirmed “too much text” problem. Preserve honesty, but define it as one compact stable disclosure per retrieval block or shorten the per-result expression. Do not choose visual placement; Fable owns that.
- Ensure no outcome implies correctness beyond the evaluator's actual coverage.

### 9. Separate regression fit from general quality

Passing the 28 authored cases proves regression conformance, not general evaluator quality. Keep them as the versioned regression suite, but require an independently authored, human-labelled holdout before enabling Stage B LLM or claiming general semantic quality. The holdout must not be used to tune rules. Report inter-rater agreement and adjudicate every disagreement; do not let one model label or evaluate itself.

### 10. Preserve the two substantive recommendations

Unless the corrected evidence contradicts them, retain:

- `We have to meet the deadline.` as `target-retrieved`, because the target feature is the collocation `meet the deadline` and modal variation is allowed;
- `I come up with a way to remove one step.` as `incorrect-or-insufficient / form-incomplete`, because the prompt requires completed past meaning.

## Verification and output

- Keep all mandatory M1–M5 fixtures.
- Keep JSON valid, IDs unique and every referenced copy ID declared in the contract.
- Update counts in README if cases are added.
- Append a short `v1.1 correction summary` inside the contract; do not create a fourth file.
- Stop for Codex inspection and owner ratification. Do not commit or push.
