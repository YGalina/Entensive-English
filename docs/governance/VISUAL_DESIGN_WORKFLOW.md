# Visual Design Workflow

Status: Current  
Visual identity: Living Content / “Paper and Ink”

## Authority

- Product owner: approves the visual result and any change to the established identity.
- Claude Design / Fable: Creative Director; extends and applies Living Content.
- Claude Opus: maintains UX logic, copy and screen specifications.
- Codex: checks specification integrity, accessibility, state coverage and implementation risk; it does not art-direct.
- ChatGPT: supports product/methodology decisions; it does not select the visual style.

## Canonical style sources

1. `docs/design/project/Intensive English - Design System.dc.html`
2. `packages/tokens/index.ts`
3. `docs/design/project/Intensive English - Directions.dc.html`
4. `docs/design/project/Экраны-v2.dc.html`
5. `docs/design/project/slices-v2/`
6. `docs/design/DESIGN_SOURCE_INVENTORY.md`

## Product-wide audit and migration procedure

### 1. Audit the existing designed product

Claude Design reviews every existing mobile, web and focus screen against the approved methodology, curriculum, Product Constitution, Experience Architecture, UX, IA, journeys, interactions and Screen Specifications using D-02.

The audit classifies each source as KEEP, ADAPT, REBUILD IN LIVING CONTENT, ARCHIVE or FUTURE REFERENCE and identifies every approved screen requiring a new design.

### 2. Owner approves the migration sequence

The product owner reviews the audit, resolves founder decisions and approves the order of complete user journeys. No visual redesign starts before this gate.

### 3. Design one approved journey batch

Using D-03, Claude Design redesigns one coherent journey batch at real target dimensions. Existing valid screens and components are reused; obsolete logic is removed; missing screens are created in Living Content.

### 4. Owner visual review

The product owner judges whether it feels like Intensive English and whether the hierarchy is understandable. This is the visual approval gate. Codex does not select taste.

### 5. Required states

Only after default-screen approval, Claude Design expands the same design into required variants, loading, error, offline, resume and empty states. States live in a separate compact sheet.

### 6. Codex QA

Codex checks only:

- frozen UX/specification compliance;
- accessibility and target sizes;
- state completeness and conflicts;
- misleading learning/progress claims;
- responsive and implementation ambiguity.

Codex findings request the smallest correction and do not replace the chosen art direction.

### 7. Claude Design patch

Claude Design resolves accepted QA findings while protecting the approved visual concept.

### 8. Owner approval and freeze

The owner approves the screen. The artifact, rationale, state sheet and implementation handoff are versioned in Git. Only then does the next screen or batch begin.

## Prohibited process failures

- designing all screens before establishing one quality bar;
- treating an annotated specification board as final UI;
- inventing a new brand for every batch;
- copying obsolete UX because its visual source exists;
- letting review by committee flatten the visual direction;
- implementing before owner visual approval.
