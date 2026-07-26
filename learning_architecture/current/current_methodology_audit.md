# Current Methodology Audit

Date: 2026-07-14

Scope: inventory and classification of existing Intensive English modules, lesson flows, exercise types, repetition mechanics, AI interactions, assessments, content sources, and user flows.

Classification: KEEP, KEEP BUT REPOSITION, REDESIGN, REPLACE, REMOVE, RESEARCH FURTHER.

## 1. Summary Verdict

Current Intensive English already has the right ambition: it does not want to be another quiz app. It contains a strong input engine, native-language meaning support, productive SRS, speech output, role scenes, shadowing, reading, grammar frames, feedback prompts, and a psychology layer.

The problem is sequence and proof:

- recognition is still too close to "learned";
- output exists, but needs a stricter ladder;
- grammar is promising but must be diagnostic and transfer-oriented;
- community is conceptually valuable but under-specified;
- intensive claims need evidence boundaries;
- mobile and web are still partly copies rather than method-specific environments.

## 2. Inventory Matrix

| Item | Skill/subskill | Learner problem | Mechanism | Evidence | Assumes | Mode trained | Transfer? | Placement | Platform | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| Onboarding: native language | meaning access | translation mismatch | L1 support | Research-supported | learner knows L1 | diagnostic | indirect | before training | both | KEEP |
| Onboarding: interface language | UX comprehension | app speaks wrong language | preference separation | Product hypothesis | none | not learning | indirect | before training | both | KEEP |
| Onboarding: goal/interests | relevance | generic content | goal framing | Programme precedent | self-awareness | diagnostic | medium | before content | both | REDESIGN |
| Onboarding: self-level | placement | wrong load | metacognitive estimate | Weak alone | honest self-report | diagnostic | low | before check | both | KEEP BUT REPOSITION |
| Vocabulary level check | lexical breadth estimate | starting too easy/hard | recognition sampling | Research-supported as partial | reading recognition | recognition | weak alone | diagnostic | both | REDESIGN |
| Speaking checkup | fluency/confidence baseline | hidden speaking gap | elicited sample | Research-supported | microphone comfort | spontaneous sample | high | early, then monthly | mobile primary | KEEP |
| Readiness/breath/music | speaking avoidance | anxiety/arousal | state regulation | Moderate; not language acceleration | adult buy-in | affective readiness | indirect | before output or return | mobile primary | KEEP BUT REPOSITION |
| Word flow/kino-session | lexical exposure | English feels dense | repeated exposure, priming | Strong for exposure; weak for unconscious acquisition | basic literacy | recognition | low unless followed | early in block | mobile focus | REDESIGN |
| "Know/not yet" in flow | self-monitoring | no scheduling signal | metacognitive judgement | weak/moderate | honesty | recognition | low | after exposure | both | REDESIGN |
| Context phase | vocabulary depth | translation without use | contextual encoding | Research-supported | basic comprehension | recognition/noticing | medium | after preview | both | KEEP |
| Tap translation | comprehension | dictionary friction | L1 scaffolding | Research-supported for adults | chosen L1 | comprehension | indirect | throughout input | both | KEEP |
| Context audio autoplay | listening mapping | page-known, ear-unknown | phonological mapping | Research-supported | audio quality | listening | medium | after context | mobile/both | KEEP BUT REPOSITION |
| Recognition SRS | retention | forgetting | spaced retrieval | Research-supported | item known enough | recognition | limited | daily | mobile primary | KEEP |
| Productive SRS | active vocabulary | "I know it but cannot say it" | L1/meaning→L2 retrieval | Research-supported | recognition foundation | controlled recall | medium/high | after recognition | mobile primary | KEEP |
| "Say your own" output | personal speech | freeze | pushed output, generation | Research-supported | models and cues | guided production | high if scaffolded | every session end | both | REDESIGN |
| Grammar listen/build | grammar proceduralisation | knows rules, cannot use | pattern retrieval | Research-supported if meaningful | target construction known | controlled production | medium/high | after input and examples | web primary/mobile micro | KEEP BUT REPOSITION |
| Pronunciation drills | intelligibility | shame, sound confusion | articulatory practice | Moderate | hearing target | controlled production | medium | targeted, not daily for all | mobile primary | REDESIGN |
| Shadowing | prosody, fluency | hesitant mouth/rhythm | auditory-motor mapping | Moderate | comprehension | imitation | medium; not spontaneous alone | after comprehension | both | KEEP BUT REPOSITION |
| Speed reading | reading fluency | word-by-word reading | extensive/timed reading | Research-supported for reading | text level appropriate | comprehension | low to speech alone | optional/deep work | web primary | REDESIGN |
| Book library | extensive input | low volume | reading exposure | Research-supported | motivation/time | comprehension | low unless output added | ongoing | both | KEEP |
| Video/import content | relevance | app language not user's life | personal input | Product hypothesis + precedent | content rights | input/noticing | high if output added | after onboarding | both | KEEP |
| Typing/motor channel | spelling/writing | weak form memory | orthographic retrieval | Moderate | keyboard skill | controlled recall | medium for writing | web deep work | web | KEEP BUT REPOSITION |
| Role scenes/literary masks | safe dialogue | ego threat in speaking | role-play, affective distancing | Programme precedent | role acceptance | guided production | medium | after controlled output | both | REDESIGN |
| Adult role scenarios | real interaction | transfer gap | task-based role-play | Research-supported | enough chunks | guided/spontaneous | high | core B1→B2 | both/live | ADD/REPLACE CORE |
| AI feedback | correction at scale | no coach | prompts, self-repair | Research-supported for feedback; AI quality unknown | consent, text/audio | guided correction | high if retry | after output | both | KEEP |
| AI conversation | practice volume | no partner | simulated interaction | Promising; transfer unknown | task design | spontaneous/guided | unknown/high if constrained | after prep | both | REDESIGN |
| Evening circle | daily consolidation | habit decay | reflection + retrieval | Moderate | low fatigue | guided output | medium | end of day | mobile primary | KEEP BUT REPOSITION |
| Guardians | affective barriers | shame/perfectionism | reappraisal, exposure | Moderate/product hypothesis | adult tone | affective readiness | indirect/high for adherence | friction points | both | KEEP BUT REPOSITION |
| People/club | real transfer | app does not equal people | interaction, negotiation | Research-supported if structured | safety and prep | spontaneous interaction | high | after readiness | live/both | REDESIGN |
| Progress/path | metacognition | no sense of growth | capability tracking | Programme precedent | valid metrics | assessment | indirect | weekly/monthly | web primary | REDESIGN |
| Payments/monetization | access | business model | not learning | Unknown | willingness to pay | none | none | outside method | web | OUT OF SCOPE |

## 3. Current Lesson Flow Audit

### Existing Flow

`readiness → word flow → context → recognition → output → SRS/evening`

### What Works

- The sequence includes input and output in one day.
- Translation is correctly tied to native language, not profile language.
- Productive SRS exists in code.
- Output artifacts and feedback are already conceptually present.

### What Is Missing Before Output

Before "say your own", many learners need:

1. 2-4 natural models;
2. target chunk highlighted;
3. meaning cue;
4. substitution slot;
5. one constrained completion;
6. rehearsal aloud;
7. then personal answer.

### What Is Missing After Output

After output, the system needs:

1. one priority feedback prompt;
2. self-repair;
3. retry;
4. save improved phrase;
5. delayed return;
6. transfer to changed context.

## 4. Repetition Mechanics Audit

Current SRS is technically strong because it separates recognition and production. Methodologically, it should expose item state:

| State | Meaning | Next action |
|---|---|---|
| Seen | encountered in input | show in context |
| Understood | meaning clear | notice form/chunk |
| Recognized | recognized later | create productive cue |
| Recalled | produced from meaning | use in phrase |
| Used | used in personal output | schedule transfer |
| Transferred | used in new context | count toward active vocabulary |

Do not report "learned words" unless the label says exactly which state is meant.

## 5. AI Interaction Audit

AI is useful only when it is a coach, not a pleasant chatty fog.

Keep:

- feedback prompts;
- one correction at a time;
- retry;
- scenario role-play;
- transcript-based recycling.

Redesign:

- unstructured conversation;
- overly positive responses without correction;
- grammar explanations without a new attempt;
- conversation not linked to the learner's active chunks.

## 6. Assessment Audit

Current assessment has a good start: monthly speaking sample and self-scores.

Add:

- listening diagnostic;
- productive vocabulary sample;
- grammar-in-speech task;
- pronunciation intelligibility sample;
- repair-strategy task;
- external/human speaking checkpoint in paid or cohort mode.

Do not use vocabulary recognition as the main level label.

## 7. User Flow Audit

### Mobile

Best for:

- daily session;
- voice;
- shadowing;
- productive SRS;
- evening circle;
- return after missed days;
- first speaking sample.

Risk:

- too many choices;
- typing-heavy tasks;
- long grammar explanations.

### Web

Best for:

- grammar workshop;
- writing;
- longer reading;
- archive/progress;
- import/curation;
- serious self-review;
- group calls.

Risk:

- becoming a storage attic;
- duplicating mobile without a distinct learning role.

## 8. Final Classification Summary

### KEEP

Native language layer, context phase, tap translation, productive SRS, AI feedback prompts, assessment samples, book/library base.

### KEEP BUT REPOSITION

Readiness, shadowing, pronunciation, typing, evening circle, platform split.

### REDESIGN

Word flow, know/not-yet, "say your own", grammar flow, role scenes, people/club, progress metrics.

### REPLACE

Literary role scenes as core curriculum should be replaced by adult scenarios. Literary masks can remain optional.

### REMOVE

Streak-as-progress, claims of unconscious acquisition, passive content as training, any separate three-minute ritual that duplicates the return protocol.

### RESEARCH FURTHER

Safe high-speed presentation limits, exact productive SRS thresholds, native speaker incentive model, transfer from AI dialogue to human speech, Petrusinsky-specific claims.
