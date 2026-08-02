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
