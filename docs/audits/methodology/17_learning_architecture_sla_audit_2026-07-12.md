# 17 · Learning Architecture Audit — Intensive English

Дата: 2026-07-12  
Фокус: не интерфейс, не продуктовый UX, а учебная архитектура.  
Роль анализа: adult SLA, applied linguistics, psycholinguistics, cognitive psychology, deliberate practice, retrieval practice, AI tutoring, FSI/DLI-style coaching.

Документы, на которые опирался:
- `01_research_method.md`
- `05_method_to_mechanics.md`
- `08_product_audit_v3_codex.md`
- `09_architecture_plan.md`
- `10_psychology_layer.md`
- `11_experiments_backlog.md`
- `13_app_logic.md`
- `15_ux_audit_codex_2026-07-12.md`
- `16_target_user_simulation_codex_2026-07-12.md`

Папку `feedback/` не использовал.

---

## Executive Verdict

Intensive English has a valuable methodological instinct: it refuses to teach adults through tiny isolated cards and instead tries to create a dense language field, state regulation, context, recognition, repetition and speech output.

But the methodology must be corrected sharply:

1. **Massive input is useful, but it does not by itself create speaking.**  
   It should be treated as priming, perceptual familiarization, lexical noticing and recognition training. It should not be treated as “subconscious acquisition of hundreds of words”.

2. **The core learning problem is not vocabulary exposure. It is transfer from receptive knowledge to controlled and then automatic production.**  
   The target user already understands a lot. Her bottleneck is retrieval under pressure, speech planning, articulation, embarrassment, and lack of automatic chunks.

3. **Every learning unit must end in production.**  
   Not as a bonus. Not as a separate tab. As the completion condition of learning.

4. **The atomic unit should not be a word. It should be a usable chunk inside a situation.**  
   Single words can be introduced, but active speaking grows from formulaic language, collocations, sentence frames, discourse moves and task repetition.

5. **Psychological safety is not decorative. It is part of the learning architecture.**  
   A learner who freezes cannot retrieve language. Barrier work belongs exactly before speaking, recording, repair and interaction.

6. **AI should not be a chatbot first. AI should be a feedback and task-simulation layer after learner output.**  
   The learner must speak/write first; AI responds with limited, high-quality prompts.

The ideal architecture is:

**Comprehensible input → noticing → retrieval → controlled production → freer production → feedback → spaced reuse → interaction → capability evidence.**

---

## Methodology Reconstructed

### What the current method is trying to do

The current method combines four traditions:

1. **Suggestopedic / Petrusinsky intensive input**
   - Lower barriers.
   - Present large volumes.
   - Use rhythm, music, multisensory input.
   - Move from overload to recognition.

2. **Modern memory science**
   - Spaced repetition.
   - Retrieval practice.
   - Recognition and productive recall.
   - Timelog and feedback loops.

3. **Communicative / task-based language learning**
   - Context.
   - Personal meaning.
   - Speaking and writing artifacts.
   - Real-life capabilities.

4. **Coaching / habit psychology**
   - State regulation.
   - Fear of speaking.
   - Shame and avoidance.
   - Return after breaks.

This combination is promising. The risk is that the first tradition still overclaims and can overpower the others. The method becomes strongest when Petrusinsky is used as **intensive exposure and barrier reduction**, while modern SLA supplies the learning spine.

---

## Evidence Standards Used

**Strong**
- Spaced retrieval.
- Direction-specific retrieval: meaning → form is needed for speaking.
- Output practice for productive skill.
- Corrective feedback when limited, timely and understandable.
- Task repetition for fluency.
- Comprehensible input at appropriate level.

**Moderate**
- Shadowing for rhythm, prosody and fluency.
- Pattern practice when meaning-based and followed by personalization.
- Extensive reading/listening for vocabulary growth.
- Pre-task planning.
- Self-recording for fluency awareness.
- Affective support improving participation and persistence.

**Weak / risky**
- Ultra-fast/subthreshold presentation as “subconscious acquisition”.
- Music frequencies as direct language accelerators.
- Huge word-count promises as learned vocabulary.
- Speed reading as language improvement without comprehension.
- Streaks as learning evidence.

---

## Activity Classification

### 1. Onboarding as learning diagnosis

**Current activity:** choose native language, goal, interests, level, time, sometimes method facts.

**Decision:** Modify.

**Why it exists:** To personalize translation, content, level and pace.

**Cognitive mechanism:** Not a learning exercise yet. It is diagnostic framing and commitment formation.

**Evidence:** Goal specificity and appropriate level selection improve adherence. Diagnostic calibration prevents over/underload.

**Bottleneck solved:** Wrong material, wrong level, wrong expectations.

**Would an elite coach use it?** Yes, but shorter and more diagnostic.

**Replace/modify into:**  
Onboarding should collect only what changes training:
- native language for meaning layer;
- interface language separately;
- life domain;
- available weekly time;
- current receptive level;
- current speaking comfort;
- primary speaking barrier.

Remove method lectures from onboarding. Put them into optional “why this works”.

---

### 2. Vocabulary level check

**Current activity:** yes/no recognition of words.

**Decision:** Modify.

**Why it exists:** Quick placement.

**Cognitive mechanism:** Recognition, confidence calibration.

**Evidence:** Vocabulary recognition correlates with broad level, but does not measure speaking.

**Bottleneck solved:** Starting too easy or too hard.

**Would an elite coach use it?** Yes, but never alone.

**Modify into:**  
Three-part placement:
1. word recognition;
2. short listening comprehension;
3. 45-60 second spoken sample or one written answer.

Report levels separately:
- comprehension zone;
- speaking zone;
- writing zone;
- confidence/freeze profile.

For this product, the most honest result might be:  
“You understand around B2 material, but your spontaneous output is closer to A2/B1. This gap is trainable.”

---

### 3. Breathing, music, readiness

**Current activity:** attune/breathing/music before a session.

**Decision:** Keep, but modify.

**Why it exists:** Reduce stress, mark transition into practice, make speaking less threatening.

**Cognitive mechanism:** Arousal regulation, attentional readiness, affective filter reduction.

**Evidence:** Moderate for state regulation; weak for direct language acceleration.

**Bottleneck solved:** Avoidance, anxiety, scattered attention.

**Would an elite coach use it?** Yes, briefly, with skeptical adults, if it does not feel like therapy.

**Modify into:**  
Make it 30-60 seconds by default. Always skippable. Never claim “alpha waves accelerate learning”. The training reason is simple: “We lower pressure so you can retrieve language.”

---

### 4. Rapid word flow / “kino-session”

**Current activity:** fast presentation of word + IPA + translation + audio + example.

**Decision:** Modify.

**Why it exists:** Massive exposure, reduce fear of large input, create familiarity.

**Cognitive mechanism:** Perceptual familiarization, lexical priming, repeated exposure, noticing.

**Evidence:** Strong for repeated exposure and recognition; weak for subthreshold unconscious acquisition.

**Bottleneck solved:** English feels like noise; learner freezes at unfamiliar vocabulary density.

**Would an elite coach use it?** A coach might use rapid preview, but not as the main acquisition claim.

**Modify into:**  
Call it **preview / exposure wave**, not “learning”.  
Use blocks of 12-25 items, not 100+ in one undifferentiated stream for ordinary daily use.  
For each item, prioritize:
- English word/chunk;
- large L1 meaning;
- audio;
- one short phrase only if readable.

Ultra-fast mode should be optional and framed as perceptual familiarization, not comprehension.

The learning happens later: in context, retrieval and production.

---

### 5. “Знаю / Ещё нет” during word flow

**Current activity:** learner marks recognition while stream continues.

**Decision:** Modify.

**Why it exists:** Self-assessment and SRS scheduling.

**Cognitive mechanism:** Metacognitive judgment, recognition monitoring.

**Evidence:** Self-ratings are useful but noisy. Retrieval tests are better than recognition feelings.

**Bottleneck solved:** Avoiding punitive testing while still capturing memory signals.

**Would an elite coach use it?** Yes, but as a weak signal.

**Modify into:**  
Keep “Ещё нет / Узнаю”. Add later retrieval checks:
- L1 meaning → English word/chunk;
- context gap → recall word;
- English audio → choose/produce meaning;
- use word in one phrase.

Recognition alone must never equal “learned”.

---

### 6. Context phase

**Current activity:** same words appear in text/examples; tap gives translation.

**Decision:** Keep, but modify.

**Why it exists:** Words become meaningful in use.

**Cognitive mechanism:** Contextual encoding, semantic elaboration, noticing, form-meaning mapping.

**Evidence:** Strong for vocabulary depth and comprehension when input is comprehensible and repeated.

**Bottleneck solved:** Learner knows word translations but cannot recognize words in real language.

**Would an elite coach use it?** Yes.

**Modify into:**  
Use authentic or semi-authentic mini-contexts tied to user goals:
- doctor appointment;
- meeting;
- relocation;
- school conversation;
- interview;
- personal content import.

Avoid isolated example sentences as the main context. They are useful as support, but the core should be a short coherent passage/dialogue.

---

### 7. Tap-to-translate / translation layer

**Current activity:** translation available near the word/context.

**Decision:** Keep.

**Why it exists:** Keep input comprehensible without forcing dictionary work.

**Cognitive mechanism:** Comprehensible input, reduced working-memory load, form-meaning mapping.

**Evidence:** Strong enough in adult learning: L1 support can accelerate comprehension when not overused.

**Bottleneck solved:** Adult learner gets stuck decoding and loses flow.

**Would an elite coach use it?** Yes, especially for adults and intensive input.

**Modify into:**  
Use L1 translation for meaning, but gradually add English definitions at higher levels. Never confuse native language with interface language.

---

### 8. Context audio autoplay

**Current activity:** context phrases can be listened to, but may require too much tapping.

**Decision:** Keep, modify.

**Why it exists:** Move from visual recognition to auditory recognition.

**Cognitive mechanism:** Phonological mapping, listening segmentation, auditory chunking.

**Evidence:** Strong for listening practice when repeated and comprehensible.

**Bottleneck solved:** “I know it on the page but don’t hear it in speech.”

**Would an elite coach use it?** Yes.

**Modify into:**  
Make context listenable as a continuous loop:
1. listen with text + translation;
2. listen with text only;
3. listen without text;
4. repeat one selected line aloud.

Do not require pressing play for every phrase.

---

### 9. Shadowing

**Current activity:** listen and repeat after native/teacher audio.

**Decision:** Keep, but narrow the claim.

**Why it exists:** Train rhythm, prosody, articulation and reduced hesitation.

**Cognitive mechanism:** Auditory-motor mapping, phonological loop, proceduralization, prosodic imitation.

**Evidence:** Moderate. Good for prosody and fluency; not sufficient for spontaneous speaking.

**Bottleneck solved:** Adult learner sounds hesitant, reads English with L1 rhythm, cannot keep pace.

**Would an elite coach use it?** Yes, especially for fossilized rhythm and confidence.

**Modify into:**  
Use short loops:
- listen;
- repeat after;
- speak with;
- speak alone;
- record one version.

Use phrases and discourse moves, not random sentences. Always connect shadowing to later own output.

---

### 10. Pronunciation / sounds

**Current activity:** sound practice and tempo ladder.

**Decision:** Modify.

**Why it exists:** Improve intelligibility and confidence.

**Cognitive mechanism:** Articulatory motor learning, phonemic awareness, auditory discrimination.

**Evidence:** Moderate when focused on high-functional-load contrasts and feedback.

**Bottleneck solved:** Shame about accent, low intelligibility, weak auditory discrimination.

**Would an elite coach use it?** Yes, selectively.

**Modify into:**  
Do not train isolated sounds as a separate large curriculum. Train pronunciation through:
- minimal pairs only when needed;
- high-frequency chunks;
- stress and rhythm;
- learner’s actual recorded phrases.

Goal is intelligibility and confidence, not accent elimination.

---

### 11. Grammar “listen then build”

**Current activity:** listen to full phrase, choose missing part, correct answer appears only after attempt, repeat aloud.

**Decision:** Keep and expand.

**Why it exists:** Turn grammar knowledge into usable sentence patterns.

**Cognitive mechanism:** Pattern retrieval, form-focused practice, auditory memory, controlled production.

**Evidence:** Strong for retrieval; moderate/strong for form-focused instruction when tied to meaning.

**Bottleneck solved:** “I know grammar but cannot build a sentence fast.”

**Would an elite coach use it?** Yes.

**Modify into:**  
Make it a universal pattern:
1. hear complete phrase;
2. reconstruct missing part;
3. receive prompt, not answer, on first error;
4. say the complete phrase;
5. personalize it.

Grammar should be trained as **sentence-making under meaning pressure**, not explanation.

---

### 12. Typing / motor channel

**Current activity:** typing drills / Shestov-style motor channel.

**Decision:** Modify, optional.

**Why it exists:** Add motor encoding and spelling automaticity.

**Cognitive mechanism:** Orthographic encoding, motor memory, dictation-like retrieval.

**Evidence:** Moderate for spelling/writing fluency; weak as a core speaking driver.

**Bottleneck solved:** Learner cannot write accurately or retrieve spelling/chunks.

**Would an elite coach use it?** Sometimes, for writing goals or spelling issues.

**Modify into:**  
Keep mostly web-based. Connect it to chunks and dictation:
- hear phrase;
- type from memory;
- compare;
- say aloud.

Do not make it a daily required path for all speaking learners.

---

### 13. Speed reading / reading

**Current activity:** reading large text arrays, WPM, translation by tap.

**Decision:** Modify.

**Why it exists:** Build input volume and reading fluency.

**Cognitive mechanism:** Extensive reading, lexical consolidation, syntactic parsing fluency.

**Evidence:** Strong for vocabulary and reading fluency; weak for direct speaking transfer unless followed by output.

**Bottleneck solved:** Slow word-by-word reading and low tolerance for authentic text.

**Would an elite coach use it?** Yes, with comprehension checks.

**Modify into:**  
Measure:
- WPM;
- gist comprehension;
- recall of 3 ideas;
- 1 spoken/written response.

Speed without comprehension is not progress.

---

### 14. Recognition SRS

**Current activity:** spaced repetition for known/not-known.

**Decision:** Keep, modify.

**Why it exists:** Consolidate vocabulary.

**Cognitive mechanism:** Spacing effect, retrieval practice, memory reconsolidation.

**Evidence:** Strong.

**Bottleneck solved:** Words disappear after first exposure.

**Would an elite coach use it?** Yes.

**Modify into:**  
SRS cards should include:
- single words;
- chunks/collocations;
- context gaps;
- audio recognition;
- L1 meaning → English form;
- “use in phrase” prompts.

The word is “mine” only after productive use.

---

### 15. Productive SRS / “Скажи сама”

**Current activity:** meaning/context gap → reveal English → self-grade.

**Decision:** Keep, make central.

**Why it exists:** Convert receptive vocabulary into active vocabulary.

**Cognitive mechanism:** Direction-specific retrieval, productive recall, transfer-appropriate processing.

**Evidence:** Strong.

**Bottleneck solved:** “I recognize the word but cannot say it.”

**Would an elite coach use it?** Absolutely.

**Modify into:**  
It should not feel like a separate obligation. It should be embedded:
- after SRS;
- after context;
- in the final phase of every session.

Require tiny output:
- one phrase;
- one substitution;
- one spoken answer.

---

### 16. “Say your own” daily output

**Current activity:** answer question with chips, text or voice.

**Decision:** Keep, central.

**Why it exists:** Force the transition from input to personal expression.

**Cognitive mechanism:** Pushed output, retrieval, self-generation effect, proceduralization.

**Evidence:** Strong enough: productive ability requires production practice.

**Bottleneck solved:** Speaking freeze and inability to formulate own thoughts.

**Would an elite coach use it?** Yes, every session.

**Modify into:**  
Use a ladder:
1. choose a ready phrase;
2. fill one slot;
3. say one sentence;
4. say 2-3 sentences;
5. answer follow-up;
6. repeat same task faster.

Do not jump from passive input to open-ended personal confession too early.

---

### 17. Evening status

**Current activity:** short day status/check-in.

**Decision:** Keep, modify.

**Why it exists:** Daily low-stakes production and consolidation.

**Cognitive mechanism:** Retrieval, self-explanation, reflection, habit closure.

**Evidence:** Moderate/strong when output is consistent and low stakes.

**Bottleneck solved:** Learner avoids production unless prompted.

**Would an elite coach use it?** Yes.

**Modify into:**  
Evening status should be a fixed productive ritual:
- one fact about day;
- one English sentence;
- optional voice;
- save artifact;
- schedule 1-2 phrases for reuse.

Keep it short. The goal is consistency, not journaling volume.

---

### 18. AI feedback

**Current activity:** planned/partial feedback after output.

**Decision:** Keep, modify.

**Why it exists:** Provide scalable coach-like correction and next-step prompts.

**Cognitive mechanism:** Feedback, noticing the gap, pushed modification.

**Evidence:** Strong for feedback in general; AI quality depends on constraint.

**Bottleneck solved:** Learner repeats errors or avoids speaking because there is no safe response.

**Would an elite coach use it?** Yes, if constrained and not overwhelming.

**Modify into:**  
AI should respond after user output:
- one meaning confirmation;
- one priority correction;
- one better version;
- one follow-up question;
- one “say it again” prompt.

Never give ten corrections. Never interrupt early speech with grammar lectures.

---

### 19. Roles / dialogue scenes

**Current activity:** partner line voiced; learner speaks own line from meaning.

**Decision:** Keep, but replace literary framing for most adult goals.

**Why it exists:** Lower ego threat through role, simulate turn-taking.

**Cognitive mechanism:** Task-based speaking, role-play, retrieval under interaction pressure.

**Evidence:** Moderate/strong in communicative teaching.

**Bottleneck solved:** Freezing in dialogue, not knowing what to say next.

**Would an elite coach use it?** Yes, but domain-specific.

**Modify into:**  
Keep “role mask” as one format, but prioritize real adult scenarios:
- doctor;
- manager;
- colleague;
- landlord;
- school teacher;
- interview;
- small talk;
- disagreement.

Literary scenes can stay as optional playful practice, not core curriculum.

---

### 20. People / speaking club

**Current activity:** community, nearby people, club.

**Decision:** Keep, but place later.

**Why it exists:** Real interaction, accountability, social use.

**Cognitive mechanism:** Interaction hypothesis, negotiation of meaning, real-time retrieval, anxiety tolerance.

**Evidence:** Strong for interaction as part of language development; quality depends on structure.

**Bottleneck solved:** App fluency does not transfer to people.

**Would an elite coach use it?** Yes, after controlled preparation.

**Modify into:**  
Unlock or recommend after the learner has:
- at least 5 saved outputs;
- one recorded voice sample;
- learned repair phrases;
- practiced “I need a second”, “Can you repeat?”, “What I mean is...”

Club must be structured:
1. warm-up phrase;
2. prepared answer;
3. partner follow-up;
4. repair phrase;
5. one saved phrase.

---

### 21. Three-minute ritual

**Current activity:** breathing + phrases + mindset as standalone.

**Decision:** Replace.

**Why it exists:** Micro-practice and return route.

**Cognitive mechanism:** State regulation, habit rescue, minimal viable practice.

**Evidence:** Moderate for adherence; weak as standalone language learning.

**Bottleneck solved:** “I have no time / I missed days / I am scared to restart.”

**Replace with:**  
Not a separate module. Make it the **return protocol**:
- 30 sec breathing;
- hear one phrase;
- say one phrase;
- done.

This is not a normal daily lesson. It is a rescue path.

---

### 22. Guardians / psychological layer

**Current activity:** 4 guardians, practices, path.

**Decision:** Keep, but make behavior-triggered.

**Why it exists:** Speaking freeze is emotional and identity-based, not just linguistic.

**Cognitive mechanism:** Self-regulation, exposure tolerance, reappraisal, avoidance interruption.

**Evidence:** Moderate for anxiety management and adherence; not a language mechanism by itself.

**Bottleneck solved:** Learner avoids output despite knowing English.

**Would an elite coach use it?** Yes, if adult and non-therapeutic.

**Modify into:**  
Use guardians at friction points:
- before recording;
- after repeated skip;
- after long pause;
- after perfectionistic overtraining;
- before first club.

Each guardian must end with a language action, not reflection only.

Example:  
“Запугивание пришло. Say one sentence quietly. Save or delete. The learning is the attempt.”

---

### 23. Streaks / gamified persistence

**Current activity:** streak-like consistency in places.

**Decision:** Remove from learning architecture.

**Why it exists:** Engagement.

**Cognitive mechanism:** Habit reinforcement, loss aversion.

**Evidence:** Good for app opens, not proficiency. Risky for shame-prone adult learners.

**Bottleneck solved:** None directly for language.

**Would an elite coach use it?** No, not as core evidence.

**Replace with:**  
Training log:
- honest hours;
- completed outputs;
- capabilities unlocked;
- return after pause;
- current training rhythm.

No “burning” streak. No flame as learning signal.

---

### 24. Teacher videos / curated content

**Current activity:** teacher blocks and video/shadowing content.

**Decision:** Keep, modify.

**Why it exists:** Provide comprehensible spoken input and models.

**Cognitive mechanism:** Input, modeling, prosody, discourse chunks.

**Evidence:** Strong for comprehensible input; output needed for transfer.

**Bottleneck solved:** Learner lacks natural phrases and spoken models.

**Would an elite coach use it?** Yes.

**Modify into:**  
Every video block should produce:
- 8-12 chunks;
- 3 comprehension checks;
- 1 shadowing line;
- 1 personal answer;
- 1 spaced reuse item.

Videos without output are content consumption, not training.

---

### 25. Import own content

**Current activity:** planned/partial.

**Decision:** Keep, make central.

**Why it exists:** Personal relevance and transfer to real life.

**Cognitive mechanism:** Elaborative encoding, motivation, context-specific transfer.

**Evidence:** Strong in principle: meaningful, relevant input improves engagement and retention.

**Bottleneck solved:** App language does not match user’s actual situations.

**Would an elite coach use it?** Yes.

**Modify into:**  
The ideal unit starts from user content:
- paste article/video/email;
- extract chunks;
- preview;
- understand;
- practice;
- answer in own words.

This is a major differentiator from generic apps.

---

## What To Remove From Methodology

Remove these as learning claims:

1. **“Subconscious acquisition of hundreds of words.”**  
   Replace with: “high-volume exposure and recognition priming.”

2. **“600/980 words learned.”**  
   Replace with: “600 words passed through exposure; X recognized; Y recalled; Z used.”

3. **Alpha/theta/music as language accelerators.**  
   Replace with: “state regulation before demanding practice.”

4. **Streak as progress.**  
   Replace with: “training rhythm and return ability.”

5. **Open-ended speaking too early.**  
   Replace with scaffolded production ladder.

6. **Standalone modules that do not close with output.**  
   Replace with integrated learning units.

---

## The Ideal Learning Unit

The atomic unit is not a card. It is not even a word pack.

The ideal unit is:

**A meaningful situation + a small set of reusable chunks + comprehension + retrieval + personal output + feedback + spaced reuse.**

### Unit structure

1. **Prime**
   - 30-60 sec readiness if needed.
   - State goal: “Today you will describe a symptom / answer a meeting question / tell a short story.”

2. **Input preview**
   - 8-15 target chunks.
   - English + L1 meaning.
   - Audio.
   - Fast optional preview only as familiarity.

3. **Comprehensible context**
   - One short dialogue/text/video segment.
   - Translation available.
   - Listen/read for meaning.

4. **Noticing**
   - Highlight target chunks.
   - Ask: “What phrase means X?”
   - Ask: “What word helped you understand the speaker’s intention?”

5. **Recognition retrieval**
   - English audio → choose meaning.
   - Context gap → identify chunk.

6. **Productive retrieval**
   - L1 meaning → say/write English chunk.
   - Sentence frame with missing slot.

7. **Controlled production**
   - Build 2-3 sentences with supports.
   - Repeat aloud.

8. **Freer production**
   - Answer one personal question.
   - Voice or text.
   - Minimum viable output accepted.

9. **Feedback**
   - One priority prompt.
   - One better version.
   - One chance to say again.

10. **Scheduling**
   - Recognized items enter recognition SRS.
   - Produced items enter production SRS.
   - Weak items return in context, not as naked words only.

11. **Capability evidence**
   - Save artifact: “I can describe a symptom in 3 sentences.”

---

## Ideal Learning Progression

This is learning progression, not screen progression.

### Phase 0 — Diagnostic and Safety

**Goal:** Place the learner correctly and reduce shame.

**Duration:** first session.

**Training**
- Native language and interface language separated.
- Goal domain selected.
- Receptive vocabulary check.
- Listening check.
- 45-60 sec output sample, optional text if voice is too hard.
- Speaking barrier identified.

**Output**
- One sentence: “Today I want to speak more freely.”

**Success criteria**
- Learner knows: “My comprehension and speaking levels are different, and this is normal.”

---

### Phase 1 — Receptive Activation With Tiny Output

**Goal:** Turn English from “noise” into familiar, meaningful material while starting output immediately.

**Duration:** days 1-14.

**Training**
- Short daily unit.
- 8-15 chunks per unit.
- Rich L1 support.
- Listening and reading context.
- Recognition SRS.
- One supported sentence per day.

**Mechanisms**
- Comprehensible input.
- Noticing.
- Recognition retrieval.
- Self-generation.
- Low-stakes output.

**Output ladder**
- choose phrase;
- fill slot;
- write one sentence;
- say one sentence quietly.

**Success criteria**
- Learner completes 10+ tiny outputs.
- Learner stops treating “not yet” as failure.

---

### Phase 2 — Controlled Production

**Goal:** Make sentence building faster and less scary.

**Duration:** weeks 3-6.

**Training**
- Productive SRS begins.
- Grammar through listen-build-personalize.
- Shadowing short lines.
- Dictation/typing optional.
- Recording one sentence, not monologues.

**Mechanisms**
- Productive retrieval.
- Pattern practice.
- Auditory-motor mapping.
- Task repetition.

**Output ladder**
- say chunk from meaning;
- build sentence from frame;
- transform tense/person;
- record 2-3 sentence answer.

**Success criteria**
- Active word/chunk count appears.
- Learner can produce common frames without translating every word.

---

### Phase 3 — Fluency and Automaticity

**Goal:** Reduce pauses and build speech flow.

**Duration:** weeks 7-12.

**Training**
- 4/3/2 monologue practice.
- Same task repeated with less support.
- AI or rule-based prompts after output.
- Repair phrases.
- Short role-play.

**Mechanisms**
- Proceduralization.
- Retrieval under time pressure.
- Formulaic language.
- Feedback-driven modification.

**Output ladder**
- 30 sec answer;
- repeat answer faster;
- answer follow-up;
- repair breakdown.

**Success criteria**
- Fewer long pauses.
- Learner can restart after freezing.
- Learner has 20-50 reliable personal phrases.

---

### Phase 4 — Interaction

**Goal:** Transfer app speech into conversation.

**Duration:** months 3-6.

**Training**
- Simulated AI dialogue after preparation.
- Human club or coach in small safe structure.
- Turn-taking.
- Clarification and repair.
- Scenario-based practice.

**Mechanisms**
- Interaction hypothesis.
- Negotiation of meaning.
- Real-time retrieval.
- Anxiety tolerance.

**Output ladder**
- prepared answer;
- unexpected follow-up;
- ask a question back;
- disagree politely;
- summarize.

**Success criteria**
- Learner can stay in a 5-10 minute structured conversation.
- Learner uses repair phrases instead of freezing.

---

### Phase 5 — Domain Mastery

**Goal:** Build real-life capability in chosen domain.

**Duration:** months 6+.

**Training**
- User-imported content.
- Domain vocabulary and chunks.
- Presentations, meetings, medical, school, relocation, interviews.
- Monthly assessment.
- Human/AI feedback cycle.

**Mechanisms**
- Context-specific transfer.
- Deliberate practice.
- Long-term spaced reuse.
- Self-explanation.

**Output**
- 2-3 minute speaking samples.
- Written messages/emails.
- Domain role-plays.
- Presentations or arguments.

**Success criteria**
- Capability evidence, not abstract level only:
  - “I can describe a medical symptom.”
  - “I can summarize a video.”
  - “I can answer an interview question.”
  - “I can ask a follow-up in a meeting.”

---

## Recommended Daily Training Models

### 12-minute day

For tired days and retention:
1. 1 min readiness.
2. 3 min input preview.
3. 3 min context listening/reading.
4. 3 min retrieval.
5. 2 min one sentence output.

This day counts if output happens.

### 30-minute day

Core daily training:
1. 2 min readiness.
2. 5 min exposure wave.
3. 8 min context.
4. 5 min recognition + productive retrieval.
5. 7 min say/write your own.
6. 3 min feedback and scheduling.

### 60-minute day

Deeper training:
1. 5 min readiness and review.
2. 10 min input preview.
3. 15 min context + shadowing.
4. 10 min SRS recognition/productive.
5. 10 min grammar/chunk transformation.
6. 10 min output + feedback.

### 120-minute day

Intensive day:
1. Two 45-minute learning units.
2. One 20-minute speaking task.
3. One 10-minute review/feedback block.

Do not make this the default. It is a special training day.

---

## Curriculum Spine

The curriculum should be organized by **capabilities**, not grammar chapters or word packs.

### Level B1 → B2

Core capabilities:
- describe daily state and plans;
- explain a problem;
- tell a short past story;
- ask for help/clarification;
- summarize a short video/text;
- give opinion with reason;
- handle basic service/medical/work situations;
- recover from not knowing a word.

Language focus:
- high-frequency verbs and collocations;
- tense contrasts in personal narratives;
- modal verbs for requests/advice;
- discourse markers: actually, I mean, the thing is, for me, because, so.

### Level B2 → C1

Core capabilities:
- argue a position;
- soften disagreement;
- explain nuance;
- present a project;
- handle follow-up questions;
- tell professional stories;
- negotiate meaning;
- repair misunderstanding elegantly.

Language focus:
- stance markers;
- hedging;
- abstract nouns;
- cause/effect;
- conditionals;
- present perfect/past contrast in professional stories;
- collocations by domain.

---

## What Elite Coaching Would Do Differently

An elite coach would not ask: “How many words did you see?”

They would ask:

1. Can you recognize it tomorrow?
2. Can you retrieve it from meaning?
3. Can you say it in a sentence?
4. Can you say it under mild time pressure?
5. Can you say it to another person?
6. Can you repair when you freeze?
7. Can you use it in your real domain?

The app should encode exactly this sequence.

---

## Final Methodological Redesign

### Keep

- Massive input as exposure and confidence-building.
- Translation layer on native language.
- Context-based learning.
- SRS.
- Productive SRS.
- Grammar through listening and phrase building.
- Shadowing.
- Evening output.
- Voice recording.
- Psychological barrier support.
- AI feedback after output.
- Capability-based progress.

### Modify

- Word flow: from “learning hundreds” to “preview and recognition priming”.
- Breathing/music: from “learning accelerator” to “state regulation”.
- Grammar: from separate page to repeated phase-4 format.
- Pronunciation: from isolated sounds to intelligibility in real phrases.
- Reading: from speed to comprehension + response.
- Typing: from core method to optional dictation/writing channel.
- People/club: from early social feature to staged interaction training.
- Guardian cards: from content to behavior-triggered interventions.

### Replace

- 3-minute ritual as standalone → return protocol with one output.
- Literary role scenes as core → real domain role-play first.
- Word-count progress → exposure/recognition/recall/production metrics.
- Streak progress → training rhythm + recovery after pauses.

### Remove

- Subconscious acquisition claims.
- “980 words learned” language.
- Alpha/theta language acceleration claims.
- Streaks as learning evidence.
- Any learning block that ends without output.

---

## The One Rule

If an activity does not move the learner through this chain:

**understand → notice → retrieve → produce → receive feedback → reuse**

then it is not core learning architecture.

It can be content, motivation, onboarding, reflection or support.

But it should not be allowed to pretend it teaches speaking.
