# Fable correction — Path Hub week header on physical Android · v1

Continue inside the existing `Intensive English дизайн-система` project. Do not create a replacement project.

## Evidence

Physical Android screenshot captured 2026-08-05 at 10:45 in Expo Go:

`/Users/galinayanovskaya/Pictures/WhatsApp Unknown 2026-08-05 at 10.46.02 AM/WhatsApp Image 2026-08-05 at 10.45.45 AM.jpeg`

The current Path Hub is the correct product surface. The verified defect is limited to the weekly-practice card header: `ВРЕМЯ ПРАКТИКИ · АВГУСТ` collides with `Первая неделя`, producing the visible string `АВГУСТПервая неделя` and horizontal clipping at the right edge.

## Scope

Create one bounded responsive correction for the existing Path Hub weekly-practice card at the owner's physical-device width shown in the screenshot, plus a 360 × 800 reference if different.

- Preserve the approved Living Content visual language, card, seven-day row, copy and information hierarchy.
- Keep both pieces of information: the month label and `Первая неделя`.
- Resolve collision, clipping and horizontal overflow for normal and large system text.
- Do not change navigation, learning mechanics, the first-practice card, the guide card or any unrelated surface.
- Do not restore legacy onboarding, streaks, guardians, levelcheck, music, coach upsell or automatic word cycling.

## Deliverables

Save the corrected screen and a short implementation annotation under:

`docs/design/exports/path-hub-week-header-device-correction-v1/`

Stop for product-owner visual approval. Application code is out of scope for Fable.
