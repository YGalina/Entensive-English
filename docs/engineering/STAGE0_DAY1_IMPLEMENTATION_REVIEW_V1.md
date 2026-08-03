# Stage 0 Day 1 implementation review v1

Review target: `5b62637`

Initial verdict: **CHANGES REQUIRED**

## Findings and correction status

| Severity | Finding | Correction |
|---|---|---|
| P1 | Arbitrary non-empty guided strings could unlock the claim that three phrases used one frame. | Submission now requires three instances of `I've been working on …`; accepted feedback is shown before B9. |
| P1 | F2 promised tap translation but rendered inert text; unavailable supportive audio had no honest state. | Every dialogue line is an accessible control with its approved RU support; F1/F2 audio controls expose `C-ERR-AU` while the segment map is unavailable. |
| P1 | A failed local write could remove the latest visible production/guided input. | Inputs retain a UI buffer, show `C-ERR-SAVE`, and provide an explicit retry; persistence still requires exact read-back. |
| P1 | The second wrong meaning answer advanced without showing the required fragment. | `shown` is now a persisted intermediate state; the final two lines and RU support are rendered before explicit continuation. |
| P2 | Filled guided slots were not editable before submission. | Three accessible slot controls allow revisiting any slot until final submission; submitted slots remain locked. |
| P2 | Recording could continue after Back/unmount; empty/save-failed states were conflated. | Back and unmount stop active capture; the recorder exposes detailed `saved` / `empty` / `save-failed` outcomes and uses the corresponding locked copy. |
| P2 | Retrieval support choices and inputs lacked required labels/copy. | The level-2 heading is restored; choices are buttons and text inputs have explicit accessible labels. |

## Verification after correction

- Core repository unit suite: 157/157 passed.
- Mobile TypeScript: passed.
- `git diff --check`: required before correction commit.
- Physical-device microphone, interruption and screen-reader checks remain a release gate.

Status: **correction implemented; exact correction commit requires independent re-review**.

## Independent re-review of `40a9ce1`

Verdict: **CHANGES REQUIRED**

| Severity | Finding | Correction status |
|---|---|---|
| P1 | A failed retrieval submission could clear the visible answer; the failed support-state write was not surfaced. | Retrieval now retains its UI buffer, shows `C-ERR-SAVE`, and retries the exact submit action. |
| P2 | Three identical framed answers could produce the claim «три разных дела». | Group validation now requires three distinct normalized frame completions. |
| P2 | The approved optional second-version path after guided submission was absent. | The accepted state now includes the locked `C-B4-V2` prompt, optional editable draft, frame validation and persistence retry. |

Status: **second correction implemented; exact correction commit requires independent re-review**.

## Independent re-review of `4a71e4c`

Verdict: **CHANGES REQUIRED**

The three targeted findings were confirmed closed. One P1 regression remained: version 3 made `guidedOptionalDraft` mandatory without migrating valid version 2 progress. Loading a Day 1 started under `40a9ce1` could therefore return `null` and expose a fresh-start path.

Correction: valid version 2 state is migrated to version 3 with an empty optional draft while preserving the exact path, block, phase, learner drafts and evidence. Malformed version 2 data remains rejected.

Status: **migration correction implemented; exact correction commit requires final independent re-review**.

## Final independent re-review of `b7bb786`

Verdict: **PASS** — no remaining actionable findings.

- Valid v2 state migrates to v3 while preserving path, block, phase, drafts, evidence and completion data.
- Full validation and active-path checks still reject malformed and wrong-path states.
- Retrieval failure retains visible input and never advances without an accepted write.
- Guided submission requires three distinct framed topics; the approved optional second version remains optional, validated and atomically persisted on continuation.
- Repository unit suite: 162/162 passed.
- Mobile TypeScript: passed.
- `git diff --check`: passed.

Remaining release gate: physical-device microphone lifecycle and screen-reader QA.

## Device-launch correction

Physical-device launch exposed that `/` was still owned by the legacy tab group. A clean Expo launch therefore opened the rejected onboarding, auto-advancing word flow, music and trainer surfaces instead of S1.

Correction: the root-owning legacy tab layout now unconditionally redirects to the canonical product entry `/entry`. S1 remains the only component allowed to decide recognition, resume, integrity, protocol or Path routing. The old tab/session/coach files remain in history but are explicitly classified as non-product routes and cannot govern startup.
