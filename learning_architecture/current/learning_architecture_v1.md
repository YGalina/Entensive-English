# Intensive English Learning Architecture v1

Date: 2026-07-14

Role: Chief Learning Architect

Scope: methodology only. No screen redesign, no implementation tickets, no application code changes.

## 0. Source Inventory First

### Research Corpus Read

| Source | Path | Used for |
|---|---|---|
| Integrated L2 competence report | `/Users/galinayanovskaya/Intensive English Research/05_receptive_productive_gap/DEEP_RESEARCH_BRIEF_Building_Integrated_L2_Compet.pdf` | receptive-productive gap, vocabulary, grammar proceduralisation, speaking, listening, pronunciation, feedback, intensity, transfer |
| Adult intermediate programme comparison | `/Users/galinayanovskaya/Intensive English Research/07_comparative_programmes/_COMPARATIVE_RESEARCH_BRIEF_Adult_Intermediate.pdf` | programme precedents, exercise architecture, weak exercise patterns, mobile/web task demand |
| Market and evidence synthesis | `/Users/galinayanovskaya/Intensive English Research/04_layer3_synthesis/L3_EXECUTIVE_2pages_RU.md` | market gaps, claims not to make, strategic evidence boundaries |
| Receptive-productive gap report | `/Users/galinayanovskaya/Intensive English Research/05_receptive_productive_gap/GAP_gemini_2026-07-09_RU.md` | gap mechanisms, phraseology, oral vs written production |
| Product audit | `/Users/galinayanovskaya/Intensive English Research/06_product_audit/AUDIT_intensive-english_2026-07-09_RU.md` | current product risks and earlier methodology critique |
| Layer 2/3 research files | `/Users/galinayanovskaya/Intensive English Research/02_layer2_reports/*.md`, `/Users/galinayanovskaya/Intensive English Research/04_layer3_synthesis/*.md` | corroboration and uncertainty mapping |
| DOCX market report | `/Users/galinayanovskaya/Intensive English Research/02_layer2_reports/L2_chatgpt_2026-07-08_EN.docx` | product landscape cross-check via local text extraction |

PDF equivalents were found but not all were machine-extractable locally because `pdftotext` is unavailable. Where a PDF appears to duplicate a markdown or DOCX version, the markdown/DOCX version was treated as the accessible source equivalent. This is marked as an evidence-handling limitation, not hidden.

### Project Methodology and Product Docs Read

| Source | Path | Used for |
|---|---|---|
| Petrusinsky/Lozanov method research | `01_research_method.md` | original five-level frame and method inheritance |
| Product concept | `02_concept.md` | target product premise and modules |
| MVP spec | `03_spec_MVP.md` | current intended scope |
| Method to mechanics | `05_method_to_mechanics.md` | current block/session theory |
| Product audit v3 | `08_product_audit_v3_codex.md` | current risk map and previous decisions |
| Architecture plan | `09_architecture_plan.md` | output layer, SRS v2, feedback, assessment |
| Psychology layer | `10_psychology_layer.md` | guardians and affective layer |
| App logic | `13_app_logic.md` | day loop, session phases, user states |
| Platform architecture | `17_platform_architecture.md` | mobile/web split |
| SLA audit | `docs/audits/methodology/17_learning_architecture_sla_audit_2026-07-12.md` | previous exercise-level audit |
| Understand to automatic speech map | `docs/audits/methodology/18_understand_to_automatic_speech_map_2026-07-12.md` | cognitive transition ladder |
| UX feedback | `15_ux_audit_codex_2026-07-12.md`, `16_target_user_simulation_codex_2026-07-12.md`, `feedback/*.md` | learner confusion, overload, trust risks |

### Current Content and Exercise Definitions Read

| Source | Path | Used for |
|---|---|---|
| Day plan | `packages/core/dayplan.ts` | current activity sequence and time goals |
| Packs and vocabulary | `packages/core/data/packs.ts` | lexical data model, translations, word/chunk packs |
| SRS | `packages/core/srs.ts` | recognition and productive retrieval mechanics |
| Grammar | `packages/core/data/grammar.ts` | grammar as frame/fill construction |
| Feedback | `packages/core/feedback.ts` | prompt-based correction |
| Assessment | `packages/core/assess.ts` | speaking sample and self-rating |
| Shadowing | `packages/core/data/shadowing.ts` | video/audio shadowing content |
| Role scenes | `packages/core/data/roleScenes.ts` | role-mask dialogue practice |
| Reading/library | `packages/core/data/reading.ts`, `packages/core/data/library.ts` | reading and book flows |
| Mobile/web flows | `apps/mobile/src/app/*`, `apps/web/src/app/*`, `docs/design/project/screens/*.html`, `docs/design/project/slices-v2/**/*` | current user flows and platform placement |

## 1. Evidence Labels Used

Every decision below uses one or more labels:

| Label | Meaning |
|---|---|
| Research-supported | Backed by the research corpus or well-established SLA/cognitive mechanisms |
| Programme precedent | Seen in credible programmes, coursebooks, tutoring, FSI/DLI-like systems, or established app patterns |
| Product hypothesis | Plausible but must be tested in Intensive English users |
| Founder preference | Reflects Galina's positioning, taste, psychological frame, or Petrusinsky inheritance |
| Unknown | Needs research, data, or pilot evidence |

Founder ideas can shape product identity. They do not count as scientific evidence unless independently supported.

## 2. Correct Product Premise

The learner is not a hidden B2 speaker who only needs confidence.

The typical Intensive English learner is uneven:

- A2/B1 or B1 productive vocabulary;
- stronger passive reading than speaking;
- incomplete collocations and formulaic language;
- grammar recognition without fast procedural use;
- uneven listening, especially connected speech;
- slow phrase assembly;
- pronunciation/prosody shame;
- real fear of mistakes;
- habit fragility.

Therefore the product must do two jobs at the same time:

1. build missing English competence;
2. convert that competence into independent use.

## 3. Core Architecture

The learning unit is not a card and not a free conversation.

The learning unit is a **language item in a use-path**:

```
meaningful encounter
→ comprehension
→ noticing
→ pronunciation/perception
→ controlled recall
→ guided production
→ personal use
→ interaction/transfer
→ delayed retrieval
→ later reuse in changed context
```

The system should never mark an item as "learned" after recognition only. It can mark states:

- seen;
- understood;
- recognized in context;
- recalled from meaning;
- said aloud in a controlled frame;
- used in a personal sentence;
- used in interaction or task;
- reused after delay.

## 4. Programme Spine

Intensive English should become a **bridging system** from input to speech, not a content library with exercises around it.

The spine:

1. Diagnostic profile, not one crude level.
2. Daily input block.
3. Noticing and extraction of useful chunks.
4. Productive retrieval.
5. Grammar and pronunciation only as use-enablers.
6. Pushed output every session.
7. Feedback through prompts and retry.
8. Transfer into human/AI/community tasks.
9. Periodic assessment with samples, not only streaks.

## 5. What "Intensive" Means Here

Research-supported: intensity means high volume plus feedback, retrieval, output, and assessment. It is not a mystical fast display effect.

Programme precedent: serious intensive programmes use many weekly hours, teacher contact, testing, and real output.

Product hypothesis: Intensive English can create a humane consumer version by offering modes:

- sustainable daily: 20-45 min/day;
- accelerated: 7-10 h/week;
- bootcamp: 15-25 h/week for a short cohort;
- maintenance: 10-15 min/day after a level;
- recovery: 3-8 min after missed days.

Founder preference: Petrusinsky-inspired overload, rhythm, readiness, and psychological safety remain as identity, but claims must be phrased conservatively.

## 6. Non-Negotiable Method Rules

1. No comprehension-only promise.
2. No "make your own sentence" before models, constraints, cues, feedback, and retry.
3. No grammar quiz disconnected from speech.
4. No AI conversation without task, target language, feedback, retry, and recycling.
5. No passive film/book consumption as "training" unless it generates extraction, recall, output, and later reuse.
6. No streak as evidence of progress.
7. No single level label for uneven learners.
8. No native speaker participation without moderation, role clarity, and safety design.

## 7. Output Files in This Architecture Pack

1. `learning_architecture_v1.md` - this overview and source inventory.
2. `current_methodology_audit.md` - item-by-item audit.
3. `competence_model.md` - complete competence model.
4. `b1_to_b2_progression.md` - progression architecture.
5. `exercise_redesign_matrix.md` - weak exercise redesign.
6. `content_integration_films_books_shadowing.md` - content-to-learning flows.
7. `human_ai_community_model.md` - human, AI and community layer.
8. `mobile_web_learning_split.md` - platform assignment by learning requirement.
9. `evidence_and_hypotheses_register.md` - evidence map and product hypotheses.
10. `open_research_questions.md` - unresolved decisions.

## 8. Complete Learning Loops by Language Item

### Single Word

`encounter in context → L1 meaning and audio → pronunciation/form noticing → recognition in second context → recall from meaning → use in fixed phrase → personal phrase → delayed productive SRS → new context transfer`

Mastery: learner retrieves the word from meaning and uses it naturally in a short phrase.

### Collocation

`encounter as whole phrase → explain word partnership → contrast L1-calque → collocation gap → meaning-to-collocation recall → personalization → spoken/written use → changed-topic recycle`

Mastery: learner chooses the natural combination without literal translation.

### Phrasal Verb

`scenario encounter → meaning mapping → natural examples → polysemy contrast if needed → scenario choice → retrieval from meaning → role-play use → delayed scenario cue`

Mastery: learner uses the phrasal verb in a plausible situation.

### Formulaic Sequence

`hear/read chunk → understand function → repeat with prosody → complete missing part → retrieve whole chunk → vary one slot → use in interaction → later use with different interlocutor`

Mastery: the chunk comes as one unit under pressure.

### Grammar Construction

`meaning contrast → model examples → structured input → choose form → listen and reconstruct → transform → say aloud → personalize → unannounced later use`

Mastery: learner uses the construction while communicating, not only in a quiz.

### Pronunciation Feature

`perception contrast → articulatory cue → model phrase → slow production → natural speed → record/compare → own phrase → intelligibility check`

Mastery: the feature improves comprehensibility in a real phrase.

### Listening Feature

`natural audio → identify problem such as reduction/linking/stress → transcript reveal → repeat segment → dictation or ordering → listen without text → summarize → new speaker transfer`

Mastery: learner recognizes the feature in new audio.

### Discourse Strategy

`context example → function label → 2-4 phrases → controlled role-play → complication → AI/peer interaction → feedback → live use`

Mastery: learner manages the conversation, not only isolated sentences.
