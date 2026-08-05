# Intensive English brand package v1 — Codex QA

Date: 2026-08-05
Source archive: `Intensive English дизайн-система_фирстиль.zip` (modified 2026-08-05 11:52:30, 773,105 bytes)
Owner decision: use the downloaded Claude Design brand mark in the application and replace the legacy icon.

## Verdict

**PASS and implemented.**

The actual package and raster assets were inspected. The supplied app icon is the Living Content `ie` mark on amber highlight and paper background. Required native variants are present at the documented sizes.

## Implemented assets

- `icon.png` — 1024 × 1024 main application icon.
- `android-icon-background.png` — 1024 × 1024 adaptive background.
- `android-icon-foreground.png` — 1024 × 1024 adaptive foreground.
- `android-icon-monochrome.png` — 1024 × 1024 Android themed icon.
- `splash-icon.png` — 1024 × 1024 splash mark.
- `favicon.png` — 192 × 192 web icon.

The complete source package is stored at `docs/design/exports/ie-brand-package-v1/`. Legacy speech-wave SVG icon sources were removed because they are unused and explicitly superseded by the approved package.

## Configuration and verification

- Expo main icon and all Android adaptive paths resolve to the new assets.
- Application, adaptive-icon and splash backgrounds are paper `#FAF6EE`.
- Web theme color is brand terracotta `#E8623D`.
- Mobile TypeScript passes.
- Expo public configuration resolves the expected assets and colors.
- Android Expo export with cleared bundler cache succeeds.

The launcher icon cannot change inside Expo Go itself. It becomes visible when a new native Android build using this configuration is installed.
